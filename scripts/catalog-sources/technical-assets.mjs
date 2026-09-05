import path from 'node:path';
import { modelKey } from './asset-remarks.mjs';

const formats = new Map([
  ['.pdf', ['pdf', 'PDF']], ['.dwg', ['cad', 'DWG']], ['.dxf', ['cad', 'DXF']], ['.exb', ['cad', 'EXB']],
  ['.step', ['3d', 'STEP']], ['.stp', ['3d', 'STEP']], ['.igs', ['3d', 'IGES']], ['.iges', ['3d', 'IGES']],
  ['.sldasm', ['3d', 'SLDASM']], ['.sldprt', ['3d', 'SLDPRT']],
]);
const formatOrder = { PDF: 0, DWG: 0, DXF: 1, EXB: 2, STEP: 0, IGES: 1, SLDASM: 2, SLDPRT: 3 };

export function describeTechnicalAsset(asset) {
  const extension = path.posix.extname(asset.path).toLowerCase();
  const format = formats.get(extension);
  if (!format) return null;
  const [kind, fileFormat] = format;
  const segments = asset.path.split('/');
  const folderMatches = segments.slice(0, -1).some(segment => new RegExp(`^(?:\\d+-)?${kind === '3d' ? '3D' : kind.toUpperCase()}$`, 'i').test(segment));
  const native = fileFormat === 'SLDASM' || fileFormat === 'SLDPRT';
  return {
    path: asset.path, kind, format: fileFormat,
    stemKey: modelKey(path.posix.basename(asset.path, path.posix.extname(asset.path))),
    role: native ? fileFormat === 'SLDASM' ? 'native_assembly_unverified' : 'native_model_unverified' : folderMatches ? 'organized_export_candidate' : 'unclassified_export',
    materialFolderLabel: segments.find(segment => /铝合金|不锈钢/.test(segment)) ?? null,
    sha256: asset.sha256 ?? null,
    validationStatus: asset.validationStatus ?? 'not_checked',
    publicAccess: false,
  };
}

export function technicalRelation(model, stem, knownModels = new Set()) {
  const key = modelKey(model);
  const name = modelKey(stem);
  const optionalB = key.endsWith('(B)');
  if (name === key) return { variantKey: optionalB ? 'ANNOTATED_B_GROUP' : 'DEFAULT', basis: 'exact_filename' };
  if (knownModels.has(name)) return null; // A separately recorded model is not inherited by its neighbour.
  if (optionalB) {
    const base = key.slice(0, -3);
    if (name === base) return { variantKey: 'BASE', basis: 'parenthetical_B_group' };
    if (name === `${base}B`) return { variantKey: 'B', basis: 'parenthetical_B_group' };
    return null;
  }
  if (!name.startsWith(key)) return null;
  const suffix = name.slice(key.length);
  // These tokens are observed filename variants, not approved explanations of their engineering meaning.
  if (/^EI\d/.test(key) && /^(FF|FR)$/.test(suffix)) return { variantKey: suffix, basis: 'observed_suffix' };
  if (/^OVT[CW]\d/.test(key) && /^[ABCDES]MP?$/.test(suffix)) return { variantKey: suffix, basis: 'observed_suffix' };
  if (/^ES\d/.test(key) && suffix === 'F-BN') return { variantKey: suffix, basis: 'observed_suffix' };
  return null;
}

function primaryCandidate(files) {
  const exports = files.filter(file => file.role === 'organized_export_candidate' && file.validationStatus !== 'invalid');
  if (!exports.length) return { status: files.some(file => file.role === 'organized_export_candidate') ? 'invalid_file' : 'supporting_files_only', primaryCandidate: null };
  const rank = Math.min(...exports.map(file => formatOrder[file.format]));
  const preferred = exports.filter(file => formatOrder[file.format] === rank).sort((a, b) => a.path.localeCompare(b.path, 'en'));
  if (preferred.length === 1) return { status: 'proposed', primaryCandidate: preferred[0].path };
  const hashes = preferred.map(file => file.sha256);
  if (hashes.every(hash => /^[a-f0-9]{64}$/.test(hash ?? '')) && new Set(hashes).size === 1) {
    return { status: 'proposed', primaryCandidate: preferred[0].path, duplicatePaths: preferred.slice(1).map(file => file.path) };
  }
  return { status: 'ambiguous_exports', primaryCandidate: null };
}

export function resolveTechnicalAssets(record, inventory, knownModels = new Set()) {
  const scoped = inventory.filter(file => record.kind === 'absorber' ? file.path.startsWith('缓冲器/') : !file.path.startsWith('缓冲器/'));
  const matches = scoped.flatMap(file => {
    const relation = technicalRelation(record.model, file.stemKey, knownModels);
    return relation ? [{ ...file, ...relation }] : [];
  });
  const relatedDesignFiles = scoped.filter(file => file.role.startsWith('native_') && file.stemKey.startsWith(record.model)
    && /^(?:-\d+|橡胶|金属|中模|_CP)/.test(file.stemKey.slice(record.model.length))).map(file => file.path);
  const result = {};
  for (const kind of ['pdf', 'cad', '3d']) {
    const matching = matches.filter(file => file.kind === kind);
    const variants = [...new Set(matching.map(file => file.variantKey))].sort().map(variantKey => {
      const files = matching.filter(file => file.variantKey === variantKey);
      return { variantKey, ...primaryCandidate(files), files };
    });
    const requiresVariantReview = variants.some(variant => variant.variantKey !== 'DEFAULT');
    const status = !variants.length ? 'missing' : requiresVariantReview ? 'variant_review' : variants[0].status;
    const flag = record.declaredAttachments?.[{ pdf: '附件PDF', cad: '附件CAD', '3d': '附件3D' }[kind]] ?? null;
    const declaredPresent = flag === 1 || flag === '1';
    const declaredAbsent = flag === 0 || flag === '0';
    const availability = variants.length ? declaredAbsent ? 'found_despite_absent_flag' : 'candidate_files_found'
      : declaredPresent ? 'declared_present_not_found' : declaredAbsent ? 'source_marks_not_supplied' : 'not_found_unspecified';
    result[kind] = {
      status, requiresVariantReview,
      sourceDeclaredFlag: flag, availability,
      primaryCandidate: status === 'proposed' ? variants[0].primaryCandidate : null,
      variants, matchingBasis: 'filename_and_folder_candidates',
      approvalStatus: 'pending', publicationAllowed: false,
    };
  }
  return { ...result, relatedDesignFiles, roleNote: 'Original design/assembly files may require dependencies and are not automatically customer downloads.' };
}
