import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { modelKey, parseRemarks, resolveRepresentativeImage } from './catalog-sources/asset-remarks.mjs';
import { describeTechnicalAsset, resolveTechnicalAssets } from './catalog-sources/technical-assets.mjs';

// Local staging only. This program does not load .env, Prisma, or database clients.
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('ARTIFACT_TOOL_NODE_MODULES=<bundled node_modules> node scripts/catalog-preflight.mjs --source-root <data/raw> [--output-root data/staging]');
  process.exit(0);
}
function option(name, fallback) {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${name}`);
  return args[i + 1];
}
for (let i = 0; i < args.length; i += 2) {
  if (!['--source-root', '--output-root'].includes(args[i])) throw new Error(`Unknown option: ${args[i]}`);
}
const sourceRoot = await fs.realpath(path.resolve(option('--source-root', 'data/raw')));
const outputRoot = path.resolve(option('--output-root', 'data/staging'));
let existingOutputAncestor = outputRoot;
const pendingSegments = [];
while (true) {
  try { existingOutputAncestor = await fs.realpath(existingOutputAncestor); break; }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    pendingSegments.unshift(path.basename(existingOutputAncestor));
    existingOutputAncestor = path.dirname(existingOutputAncestor);
  }
}
const physicalOutput = path.join(existingOutputAncestor, ...pendingSegments);
if (!path.relative(sourceRoot, physicalOutput).startsWith(`..${path.sep}`)) throw new Error('Output must be outside the read-only raw source tree, including symlinks');
const runtimeModules = process.env.ARTIFACT_TOOL_NODE_MODULES;
if (!runtimeModules) throw new Error('Set ARTIFACT_TOOL_NODE_MODULES to the bundled dependency directory returned by load_workspace_dependencies');
const runtimeRequire = createRequire(path.join(path.resolve(runtimeModules), '__catalog_reader__.cjs'));
const { FileBlob, SpreadsheetFile } = await import(pathToFileURL(runtimeRequire.resolve('@oai/artifact-tool')).href);

const issues = [];
const sources = [];
const records = [];
const ignoredFiles = [];
const imageDecisions = JSON.parse(await fs.readFile(new URL('./catalog-sources/image-decisions.json', import.meta.url), 'utf8'));
if (imageDecisions.schemaVersion !== 1 || !Array.isArray(imageDecisions.decisions)) throw new Error('Unsupported image decision register');
const decisionsByModel = new Map(imageDecisions.decisions.map(decision => [modelKey(decision.model), decision]));
if (decisionsByModel.size !== imageDecisions.decisions.length) throw new Error('Duplicate model in image decision register');
async function checksum(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
function columnName(index) {
  let value = index + 1, name = '';
  while (value > 0) { value--; name = String.fromCharCode(65 + value % 26) + name; value = Math.floor(value / 26); }
  return name;
}
const books = [
  { file: '缓冲器数据库.xlsx', kind: 'absorber' },
  { file: '隔振器数据库.xlsx', kind: 'isolator' },
];
for (const book of books) {
  const relativeFile = `product-data/${book.file}`;
  const file = path.join(sourceRoot, relativeFile);
  const hashBefore = await checksum(file);
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(file));
  const meta = await workbook.inspect({ kind: 'sheet', include: 'id,name', maxChars: 12000 });
  const sheets = meta.ndjson.split('\n').filter(Boolean).map(line => JSON.parse(line)).filter(row => row.kind === 'sheet');
  let importedRows = 0;
  for (const sheetMeta of sheets) {
    // Query is an auxiliary SQL-text worksheet, not product data.
    if (sheetMeta.name === 'Query') continue;
    const values = workbook.worksheets.getItem(sheetMeta.name).getUsedRange().values;
    const header = values[0]?.map(value => String(value ?? '').trim()) ?? [];
    const modelColumn = header.findIndex(value => value === '型号' || value.toLowerCase() === 'id');
    if (modelColumn < 0) { issues.push({ code: 'unknown_product_sheet', sourceFile: relativeFile, sheet: sheetMeta.name }); continue; }
    const selectorColumn = header.indexOf('是否参与选型');
    const priceColumn = header.indexOf('参考价');
    for (let index = 1; index < values.length; index++) {
      const row = values[index];
      if (row.every(value => value == null || value === '')) continue;
      const source = { file: relativeFile, sheet: sheetMeta.name, row: index + 1, modelCell: `${columnName(modelColumn)}${index + 1}` };
      if (typeof row[modelColumn] !== 'string' || !row[modelColumn].trim()) {
        issues.push({ code: 'invalid_model_row', ...source }); continue;
      }
      const rawModel = row[modelColumn].trim();
      const model = modelKey(rawModel);
      const specs = header.flatMap((label, column) => !label || column === modelColumn || column === priceColumn || column === selectorColumn || label.startsWith('附件') ? [] : [{ label, cell: `${columnName(column)}${index + 1}`, value: row[column] ?? null }]);
      const price = row[priceColumn];
      const referencePriceStatus = typeof price === 'number' && Number.isFinite(price) && price > 0 ? 'present_unapproved' : 'missing_or_invalid';
      const declaredAttachments = Object.fromEntries(header.flatMap((label, column) => label.startsWith('附件') ? [[label, row[column] ?? null]] : []));
      const imageHint = book.kind === 'absorber' && !header[1] && typeof row[1] === 'string' ? row[1].trim() : null;
      const unresolved = specs.filter(spec => typeof spec.value === 'string' && /待定|待确认|TBD/i.test(spec.value));
      for (const spec of unresolved) issues.push({ code: 'unresolved_specification', model, ...source, cell: spec.cell, label: spec.label });
      if (referencePriceStatus === 'missing_or_invalid') issues.push({ code: 'reference_price_review', model, ...source });
      records.push({ model, rawModel, kind: book.kind, source, specs, sourceSelectorFlag: selectorColumn < 0 ? null : row[selectorColumn] ?? null, runtimeSelectorStatus: book.kind === 'isolator' ? 'not_implemented' : 'requires_validation', declaredAttachments, spreadsheetImageHint: imageHint, referencePriceStatus, publicationStatus: 'pending_review' });
      importedRows++;
    }
  }
  const hashAfter = await checksum(file);
  if (hashBefore !== hashAfter) throw new Error(`Source workbook changed during extraction: ${relativeFile}`);
  sources.push({ path: relativeFile, sha256: hashAfter, bytes: (await fs.stat(file)).size, productRows: importedRows });
  console.log(`Read ${book.file}: ${importedRows} product rows`);
}

const engineeringRoot = await fs.realpath(path.join(sourceRoot, 'engineering'));
const assets = [], noteFiles = [];
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff']);
const cadExtensions = new Set(['.dwg', '.dxf', '.exb']);
const threeDExtensions = new Set(['.stp', '.step', '.igs', '.iges', '.sldprt', '.sldasm']);
async function walk(directory) {
  for (const entry of (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const file = path.join(directory, entry.name);
    const relative = path.relative(engineeringRoot, file).split(path.sep).join('/');
    if (entry.isSymbolicLink()) { issues.push({ code: 'symlink_skipped', path: relative }); continue; }
    if (entry.isDirectory()) { await walk(file); continue; }
    if (/^(?:\.DS_Store|Thumbs\.db|desktop\.ini)$|^~\$/i.test(entry.name)) { ignoredFiles.push(relative); continue; }
    const extension = path.extname(entry.name).toLowerCase();
    const stat = await fs.stat(file);
    if (extension === '.txt') {
      const bytes = await fs.readFile(file);
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      noteFiles.push({ path: relative, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: stat.size, text });
      continue;
    }
    const kind = imageExtensions.has(extension) ? 'image' : extension === '.pdf' ? 'pdf' : cadExtensions.has(extension) ? 'cad' : threeDExtensions.has(extension) ? '3d' : 'other';
    assets.push({ path: relative, kind, bytes: stat.size, modifiedAt: stat.mtime.toISOString(), sha256: kind === 'image' ? await checksum(file) : null, checksumStatus: kind === 'image' ? 'verified_this_run' : 'not_hashed_this_run', publicAccess: false });
  }
}
await walk(engineeringRoot);
const parsedNotes = noteFiles.map(note => ({ ...note, ...parseRemarks(note.text, note.path) }));
const rules = parsedNotes.flatMap(note => note.rules);
issues.push(...parsedNotes.flatMap(note => note.issues));
const images = assets.filter(asset => asset.kind === 'image');
const technicalInventory = assets.map(describeTechnicalAsset).filter(Boolean);
const knownModels = new Set(records.map(record => record.model));
const identityRows = new Map();
for (const record of records) {
  if (identityRows.has(record.model)) issues.push({ code: 'model_identity_collision', model: record.model, sources: [identityRows.get(record.model), record.source] });
  else identityRows.set(record.model, record.source);
  const scopedAssets = assets.filter(asset => record.kind === 'absorber' ? asset.path.startsWith('缓冲器/') : !asset.path.startsWith('缓冲器/'));
  record.representativeImage = resolveRepresentativeImage(record.model, scopedAssets.filter(asset => asset.kind === 'image'), rules, record.spreadsheetImageHint, decisionsByModel.get(record.model));
  if (!['proposed', 'confirmed'].includes(record.representativeImage.status)) issues.push({ code: `image_${record.representativeImage.status}`, model: record.model, source: record.source, candidates: record.representativeImage.candidates });
  if (record.representativeImage.directConflict) issues.push({ code: 'remark_overrides_filename_candidate', model: record.model, evidence: record.representativeImage.evidence });
  record.technicalAssetCandidates = Object.fromEntries(['pdf', 'cad', '3d'].map(kind => [kind, scopedAssets.filter(asset => asset.kind === kind && modelKey(path.basename(asset.path, path.extname(asset.path))) === record.model).map(asset => asset.path)]));
  record.technicalAssets = resolveTechnicalAssets(record, technicalInventory, knownModels);
  record.technicalAssetStatus = 'structured_candidates_not_approved';
}

const by = (items, key) => items.reduce((counts, item) => { const value = key(item); counts[value] = (counts[value] ?? 0) + 1; return counts; }, {});
const summary = {
  generatedAt: new Date().toISOString(), mode: 'filesystem_staging_only', sourceRoot,
  databaseAccessed: false, sourceFilesModified: false, pricesIncluded: false, publicationApproved: false,
  sourceWorkbooks: sources, productRows: records.length, uniqueModels: identityRows.size,
  productsByKind: by(records, record => record.kind), assetsByKind: by(assets, asset => asset.kind),
  textFiles: noteFiles.length, parsedImageRules: rules.length, unparsedRemarkSections: parsedNotes.reduce((total, note) => total + note.issues.length, 0),
  representativeImagesByStatus: by(records, record => record.representativeImage.status),
  representativeImagesBySource: by(records, record => record.representativeImage.mappingSource),
  confirmedImageMappings: records.filter(record => record.representativeImage.status === 'confirmed').length,
  technicalAssetsByStatus: Object.fromEntries(['pdf', 'cad', '3d'].map(kind => [kind, by(records, record => record.technicalAssets[kind].status)])),
  imageMatchingConventions: ['NFKC, whitespace, multiplication sign and decimal underscore normalization', 'Image-only optional (B) annotation and trailing export-copy number', 'Explicit optional (N) remark target expansion', 'E/EA attachment-only dash spelling bridge; product identities preserved'],
  referencePriceStatus: by(records, record => record.referencePriceStatus), issueCounts: by(issues, issue => issue.code), ignoredFiles: ignoredFiles.length,
  limitations: ['Representative image candidates are not independent model photographs or publication approvals.', 'Technical mappings use filenames, explicit suffixes and folder roles only; variants and engineering suitability require review.', 'Only source workbooks, TXT notes and images are hashed in this run; run catalog:reconcile-assets to verify technical files.', 'Original selection flags are preserved separately from implemented calculator support.', 'Price amounts are excluded; no OVT price reconciliation or business approval was performed.', 'No database import or website publication occurred.'],
};
await fs.mkdir(outputRoot, { recursive: true, mode: 0o700 });
const batchId = `catalog-${summary.generatedAt.replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
const batchDirectory = path.join(outputRoot, batchId);
await fs.mkdir(batchDirectory, { mode: 0o700 });
for (const [name, value] of Object.entries({ 'summary.json': summary, 'product-staging.json': records, 'asset-manifest.json': { source: 'engineering', assets, ignoredFiles }, 'image-remarks.json': parsedNotes, 'image-decisions.json': imageDecisions, 'review-issues.json': issues })) {
  await fs.writeFile(path.join(batchDirectory, name), `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
}
console.log(JSON.stringify({ output: batchDirectory, productRows: summary.productRows, uniqueModels: summary.uniqueModels, rules: rules.length, representativeImages: summary.representativeImagesByStatus, issues: summary.issueCounts }, null, 2));
