import test from 'node:test';
import assert from 'node:assert/strict';
import { describeTechnicalAsset, resolveTechnicalAssets, technicalRelation } from './technical-assets.mjs';
const describe = (...paths) => paths.map(path => describeTechnicalAsset({ path }));
const absorber = model => ({ model, kind: 'absorber' });
const isolator = model => ({ model, kind: 'isolator' });

test('B group preserves base, B and annotated CAD instead of choosing one', () => {
  const files = describe('缓冲器/PDF/EK10x7.pdf', '缓冲器/PDF/EK10x7B.pdf', '缓冲器/CAD/EK10x7(B).dwg');
  const result = resolveTechnicalAssets(absorber('EK10X7(B)'), files);
  assert.equal(result.pdf.status, 'variant_review');
  assert.deepEqual(result.pdf.variants.map(v => v.variantKey), ['B', 'BASE']);
  assert.equal(result.pdf.primaryCandidate, null);
  assert.equal(result.cad.variants[0].variantKey, 'ANNOTATED_B_GROUP');
});

test('size boundaries and N variants cannot leak into another model', () => {
  assert.equal(technicalRelation('EI50X50', 'EI50X500FF'), null);
  assert.equal(technicalRelation('6JX-25', '6JX-25N'), null);
  assert.equal(technicalRelation('OVTC12-10', 'OVTC12-100AM'), null);
  assert.equal(technicalRelation('OVTC12-10', 'OVTC12-10AM', new Set(['OVTC12-10AM'])), null);
});

test('flange and mounting suffixes remain separate unapproved variants', () => {
  const result = resolveTechnicalAssets(absorber('EI100X100'), describe('缓冲器/PDF/EI100X100FF.pdf', '缓冲器/PDF/EI100X100FR.pdf'));
  assert.deepEqual(result.pdf.variants.map(v => v.variantKey), ['FF', 'FR']);
  assert.equal(result.pdf.publicationAllowed, false);
  assert.deepEqual(technicalRelation('OVTW16-10-10', 'OVTW16-10-10AMP'), { variantKey: 'AMP', basis: 'observed_suffix' });
  assert.equal(technicalRelation('OVTC12-10', 'OVTC12-10未知'), null);
});

test('curated neutral 3D export is separate from native assembly and child parts', () => {
  const result = resolveTechnicalAssets(isolator('EA25'), describe('03-E&EA/03-3D/EA25.STEP', '03-E&EA/其他/EA25.SLDASM', '03-E&EA/其他/EA25-01.SLDPRT'));
  assert.equal(result['3d'].status, 'proposed');
  assert.equal(result['3d'].primaryCandidate, '03-E&EA/03-3D/EA25.STEP');
  assert.equal(result['3d'].variants[0].files.length, 2);
  assert.deepEqual(result.relatedDesignFiles, ['03-E&EA/其他/EA25-01.SLDPRT']);
});

test('native-only data does not masquerade as a neutral download', () => {
  const result = resolveTechnicalAssets(isolator('EA25'), describe('03-E&EA/其他/EA25.SLDASM'));
  assert.equal(result['3d'].status, 'supporting_files_only');
  assert.equal(result['3d'].primaryCandidate, null);
});

test('duplicate exports collapse only when complete hashes are equal', () => {
  const files = describe('x/03-3D/a/EA25.STEP', 'x/03-3D/b/EA25.stp');
  assert.equal(resolveTechnicalAssets(isolator('EA25'), files)['3d'].status, 'ambiguous_exports');
  for (const file of files) file.sha256 = 'a'.repeat(64);
  assert.equal(resolveTechnicalAssets(isolator('EA25'), files)['3d'].status, 'proposed');
  files[1].sha256 = 'b'.repeat(64);
  assert.equal(resolveTechnicalAssets(isolator('EA25'), files)['3d'].status, 'ambiguous_exports');
});

test('invalid files and unclassified export folders are not default downloads', () => {
  const files = describe('x/03-3D/EA25.STEP'); files[0].validationStatus = 'invalid';
  assert.equal(resolveTechnicalAssets(isolator('EA25'), files)['3d'].status, 'invalid_file');
  assert.equal(resolveTechnicalAssets(isolator('EA25'), describe('x/其他/EA25.STEP'))['3d'].status, 'supporting_files_only');
});

test('material folder evidence is preserved without assigning suffix meaning', () => {
  const file = describeTechnicalAsset({ path: '08-OVTW/OVTW16/03-3D/02-不锈钢夹板/OVTW16-10-10AMP.STEP' });
  assert.equal(file.materialFolderLabel, '02-不锈钢夹板');
  assert.equal(file.role, 'organized_export_candidate');
  assert.equal(file.publicAccess, false);
});

test('an absent file is distinguished from a broken source presence declaration', () => {
  const record = { ...absorber('HS09075'), declaredAttachments: { 附件PDF: 1, 附件CAD: 0, 附件3D: 1 } };
  const result = resolveTechnicalAssets(record, describe('缓冲器/PDF/HS09075.pdf'));
  assert.equal(result.pdf.availability, 'candidate_files_found');
  assert.equal(result.cad.availability, 'source_marks_not_supplied');
  assert.equal(result['3d'].availability, 'declared_present_not_found');
  assert.equal(result.cad.sourceDeclaredFlag, 0);
});

test('shared representative image decisions never redirect technical documents', () => {
  const record = { ...absorber('EK64X50'), representativeImage: { selectedCandidate: '缓冲器/JPG/EK42x50/EK42x50.jpg' } };
  const result = resolveTechnicalAssets(record, describe('缓冲器/PDF/EK64x50.pdf', '缓冲器/PDF/EK42x50.pdf'));
  assert.equal(result.pdf.primaryCandidate, '缓冲器/PDF/EK64x50.pdf');
  assert.equal(result.pdf.variants[0].files.length, 1);
});
