import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { describeTechnicalAsset, resolveTechnicalAssets } from './catalog-sources/technical-assets.mjs';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('node scripts/reconcile-technical-assets.mjs --batch <existing local staging batch> [--integrity-manifest <directory migration JSON>]');
  process.exit(0);
}
const options = new Map();
for (let i = 0; i < args.length; i += 2) {
  if (!['--batch', '--integrity-manifest'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Invalid arguments; use --help');
  options.set(args[i], args[i + 1]);
}
if (!options.has('--batch')) throw new Error('--batch is required; this command never connects to a database');
const sourceBatch = await fs.realpath(path.resolve(options.get('--batch')));
const read = async name => JSON.parse(await fs.readFile(path.join(sourceBatch, name), 'utf8'));
const originalSummary = await read('summary.json');
const originalRecords = await read('product-staging.json');
const originalManifest = await read('asset-manifest.json');
const originalIssues = await read('review-issues.json');
const sourceRoot = await fs.realpath(originalSummary.sourceRoot);
const engineeringRoot = await fs.realpath(path.join(sourceRoot, 'engineering'));
if (!path.relative(sourceRoot, path.dirname(sourceBatch)).startsWith(`..${path.sep}`)) throw new Error('Staging output cannot be inside raw sources');
const baseline = options.has('--integrity-manifest') ? JSON.parse(await fs.readFile(options.get('--integrity-manifest'), 'utf8')) : null;
const baselineByPath = new Map((baseline?.files ?? []).map(file => [file.newPath, file]));

async function digest(file) {
  const hash = createHash('sha256');
  let header = Buffer.alloc(0), tail = Buffer.alloc(0), bytes = 0;
  for await (const chunk of createReadStream(file)) {
    hash.update(chunk); bytes += chunk.length;
    if (header.length < 1024) header = Buffer.concat([header, chunk]).subarray(0, 1024);
    tail = chunk.length >= 256 ? chunk.subarray(chunk.length - 256) : Buffer.concat([tail, chunk]).subarray(-256);
  }
  return { sha256: hash.digest('hex'), bytes, header, tail };
}
for (const source of originalSummary.sourceWorkbooks) {
  const actual = await digest(path.join(sourceRoot, source.path));
  if (actual.sha256 !== source.sha256) throw new Error(`Workbook changed since staging: ${source.path}. Run a new preflight before reconciliation.`);
}

const inventory = [], assets = [], fileIssues = [];
let checked = 0, baselineMatches = 0;
for (const source of originalManifest.assets) {
  const descriptor = describeTechnicalAsset(source);
  if (!descriptor) { assets.push(source); continue; }
  const asset = { ...source, kind: descriptor.kind };
  try {
    if (path.isAbsolute(asset.path) || asset.path.split('/').some(part => part === '..')) throw new Error('unsafe_relative_path');
    const file = await fs.realpath(path.join(engineeringRoot, asset.path));
    const relative = path.relative(engineeringRoot, file);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('source_outside_engineering_root');
    const actual = await digest(file);
    asset.sha256 = actual.sha256;
    asset.checksumStatus = 'verified_this_run';
    asset.actualBytes = actual.bytes;
    if (!actual.bytes || actual.bytes !== asset.bytes) throw new Error('size_changed_or_empty');
    const old = baselineByPath.get(`data/raw/engineering/${asset.path}`);
    asset.migrationChecksumStatus = old ? actual.sha256 === old.sha256 ? 'matches' : 'mismatch' : 'not_available';
    if (asset.migrationChecksumStatus === 'mismatch') throw new Error('migration_checksum_mismatch');
    if (old) baselineMatches++;
    const head = actual.header.toString('latin1');
    const tail = actual.tail.toString('latin1');
    let signature = null;
    if (descriptor.format === 'PDF') signature = head.includes('%PDF-');
    if (descriptor.format === 'DWG') signature = /^AC10\d{2}/.test(head);
    if (descriptor.format === 'STEP') signature = head.includes('ISO-10303-21;') && tail.includes('END-ISO-10303-21;');
    // Native CAD storage varies by version/export/protection. Without the native
    // application, an unfamiliar header is not evidence that the file is corrupt.
    if (signature === false) throw new Error('file_signature_mismatch');
    asset.formatCheck = ['SLDPRT', 'SLDASM'].includes(descriptor.format) ? 'native_not_parsed' : signature === null ? 'not_supported' : 'signature_only';
    asset.validationStatus = 'file_present_and_hashed';
  } catch (error) {
    asset.validationStatus = 'invalid';
    asset.validationError = error.code ?? error.message;
    fileIssues.push({ code: 'technical_file_validation', path: asset.path, reason: asset.validationError });
  }
  asset.publicAccess = false;
  assets.push(asset);
  inventory.push(describeTechnicalAsset(asset));
  checked++;
  if (checked % 500 === 0) console.log(`Checked ${checked} technical files`);
}

const knownModels = new Set(originalRecords.map(record => record.model));
const technicalIssues = [];
const records = originalRecords.map(record => {
  const technicalAssets = resolveTechnicalAssets(record, inventory, knownModels);
  const declaredMissing = ['pdf', 'cad', '3d'].filter(kind => technicalAssets[kind].availability === 'declared_present_not_found');
  const unspecifiedMissing = ['pdf', 'cad', '3d'].filter(kind => technicalAssets[kind].availability === 'not_found_unspecified');
  const variantFormats = ['pdf', 'cad', '3d'].filter(kind => technicalAssets[kind].requiresVariantReview);
  const blocked = ['pdf', 'cad', '3d'].filter(kind => technicalAssets[kind].variants.some(variant => variant.status !== 'proposed'));
  if (declaredMissing.length) technicalIssues.push({ code: 'declared_attachment_not_found', model: record.model, formats: declaredMissing });
  if (unspecifiedMissing.length) technicalIssues.push({ code: 'technical_assets_missing', model: record.model, formats: unspecifiedMissing });
  if (variantFormats.length) technicalIssues.push({ code: 'technical_variant_review', model: record.model, formats: variantFormats, variantKeys: [...new Set(variantFormats.flatMap(kind => technicalAssets[kind].variants.map(variant => variant.variantKey)))] });
  if (blocked.length) technicalIssues.push({ code: 'technical_export_review', model: record.model, formats: blocked });
  return { ...record, technicalAssets, technicalAssetStatus: 'structured_candidates_not_approved' };
});
const countBy = (items, selector) => items.reduce((counts, item) => { const key = selector(item); counts[key] = (counts[key] ?? 0) + 1; return counts; }, {});
const issues = [...originalIssues.filter(issue => !['technical_file_validation', 'technical_assets_missing', 'declared_attachment_not_found', 'technical_variant_review', 'technical_export_review'].includes(issue.code)), ...fileIssues, ...technicalIssues];
const generatedAt = new Date().toISOString();
const summary = {
  ...originalSummary, generatedAt, mode: 'filesystem_technical_asset_reconciliation', sourceBatch: path.basename(sourceBatch),
  reconciliationNote: 'Reused product rows and representative-image decisions. Rehashed technical files and checked supported file signatures; no geometry, engineering qualification or publication approval inferred.',
  technicalFilesChecked: checked, technicalFilesMatchingMigration: baselineMatches,
  assetsByKind: countBy(assets, asset => asset.kind),
  technicalFilesByKind: countBy(inventory, file => file.kind),
  technicalFilesByRole: countBy(inventory, file => file.role),
  nativeFilesNotParsed: inventory.filter(file => file.role.startsWith('native_')).length,
  technicalAssetsByStatus: Object.fromEntries(['pdf', 'cad', '3d'].map(kind => [kind, countBy(records, record => record.technicalAssets[kind].status)])),
  technicalModelsWithVariantReview: records.filter(record => ['pdf', 'cad', '3d'].some(kind => record.technicalAssets[kind].requiresVariantReview)).length,
  technicalModelsWithMissingFormats: records.filter(record => ['pdf', 'cad', '3d'].some(kind => record.technicalAssets[kind].status === 'missing')).map(record => record.model),
  modelsWithDeclaredMissingAttachments: records.filter(record => ['pdf', 'cad', '3d'].some(kind => record.technicalAssets[kind].availability === 'declared_present_not_found')).map(record => record.model),
  technicalAvailability: Object.fromEntries(['pdf', 'cad', '3d'].map(kind => [kind, countBy(records, record => record.technicalAssets[kind].availability)])),
  issueCounts: countBy(issues, issue => issue.code),
  limitations: ['Technical mappings are filename/folder candidates, not geometry verification or public-release approval.', 'B, FF/FR and mounting/material suffixes remain explicit choices with no assumed default or technical equivalence.', 'Native CAD/assembly dependencies have not been resolved and are not automatically customer downloads.', 'Representative-image mappings were preserved; they are never used to inherit technical drawings.', 'Only supported file signatures were checked; readable geometry and all PDF title blocks were not audited.', 'Original workbook hashes matched the source batch; technical fields, prices and calculator support were not reinterpreted.', 'No database import, source-file modification or website publication occurred.'],
};
const output = path.join(path.dirname(sourceBatch), `catalog-${generatedAt.replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`);
await fs.mkdir(output, { mode: 0o700 });
const outputs = { 'summary.json': summary, 'product-staging.json': records, 'asset-manifest.json': { ...originalManifest, assets }, 'technical-asset-index.json': inventory, 'review-issues.json': issues };
for (const [name, value] of Object.entries(outputs)) await fs.writeFile(path.join(output, name), `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
for (const name of ['image-remarks.json', 'image-decisions.json', 'resolved-image-issues.json']) {
  try { await fs.writeFile(path.join(output, name), await fs.readFile(path.join(sourceBatch, name)), { flag: 'wx', mode: 0o600 }); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
console.log(JSON.stringify({ output, models: records.length, technicalFilesChecked: checked, baselineMatches, byStatus: summary.technicalAssetsByStatus, missingModels: summary.technicalModelsWithMissingFormats, variantModels: summary.technicalModelsWithVariantReview, issues: summary.issueCounts }, null, 2));
