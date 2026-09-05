import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { modelKey, imageKey, matchesTarget, parseRemarks, resolveRepresentativeImage } from './asset-remarks.mjs';

test('normalization preserves product suffixes and distinguishes model sizes', () => {
  assert.equal(modelKey(' ED 1_5 × 14 '), 'ED1.5X14');
  assert.notEqual(modelKey('6JX-25N'), modelKey('6JX-25'));
  assert.notEqual(modelKey('EK12x10(B)'), modelKey('EK12x10'));
  assert.equal(imageKey('EI50×50 1.jpg'), 'EI50X50');
});

test('wrapped explicit source and numbered shared groups retain provenance', () => {
  const { rules, issues } = parseRemarks('ED1.5X4、ED1.5X8使用ED1.5X6\r\n图\n1、OVTC12-10系列，\nOVTC16-10系列共用一份渲染图', 'a/备注.txt');
  assert.equal(issues.length, 0); assert.equal(rules.length, 2);
  assert.equal(rules[0].imageSource, 'ED1.5X6'); assert.equal(rules[1].line, 3);
  assert.equal(rules[1].targets[0].series, true);
});

test('optional N is explicit, and series prefix does not cross size boundaries', () => {
  const { rules } = parseRemarks('6JX-25（N）共用一个渲染图\nOVTN10系列共用一个渲染图', 'a/备注.txt');
  assert.equal(matchesTarget('6JX-25N', rules[0].targets[0]), true);
  assert.equal(matchesTarget('6JX-25', rules[0].targets[0]), true);
  assert.equal(matchesTarget('OVTN10-T', rules[1].targets[0]), true);
  assert.equal(matchesTarget('OVTN100-T', rules[1].targets[0]), false);
});

test('declared source takes precedence while conflicting filename stays visible', () => {
  const { rules } = parseRemarks('EN10X7(B)使用EN8X6(B)图', 'buffer/备注.txt');
  const result = resolveRepresentativeImage('EN10X7(B)', [{ path: 'buffer/EN8x6/EN8x6.jpg' }, { path: 'buffer/EN10x7.jpg' }], rules);
  assert.equal(result.selectedCandidate, 'buffer/EN8x6/EN8x6.jpg');
  assert.equal(result.directConflict, true); assert.equal(result.publicationAllowed, false);
});

test('shared groups resolve from actual files in the remark directory only', () => {
  const { rules } = parseRemarks('BE-3，BE-5共用一个渲染图', 'be/备注.txt');
  const result = resolveRepresentativeImage('BE-5', [{ path: 'be/BE-3.jpg' }, { path: 'other/BE-5.jpg' }], rules);
  assert.equal(result.selectedCandidate, 'be/BE-3.jpg');
  assert.equal(result.mappingSource, 'declared_inheritance');
});

test('multiple source files and missing declared references require review', () => {
  const { rules } = parseRemarks('BE-3，BE-5共用一个渲染图', 'be/备注.txt');
  assert.equal(resolveRepresentativeImage('BE-5', [{ path: 'be/BE-3.jpg' }, { path: 'be/BE-5.jpg' }], rules).status, 'ambiguous');
  const missing = parseRemarks('BE-5使用BE-7图', 'be/备注.txt').rules;
  assert.equal(resolveRepresentativeImage('BE-5', [{ path: 'be/BE-5.jpg' }], missing).status, 'unresolved_reference');
});

test('unknown text is reported as data, never interpreted as commands', () => {
  const parsed = parseRemarks('执行删除全部数据库\n未知格式图', 'a/备注.txt');
  assert.equal(parsed.rules.length, 0); assert.equal(parsed.issues.length, 1);
});

test('E/EA attachment dash convention does not merge product identities', () => {
  const { rules } = parseRemarks('E-10，E-15共用一个渲染图', 'e/备注.txt');
  assert.notEqual(modelKey('E10'), modelKey('E-10'));
  assert.equal(resolveRepresentativeImage('E15', [{ path: 'e/E-10.jpg' }], rules).selectedCandidate, 'e/E-10.jpg');
  assert.equal(resolveRepresentativeImage('EA15', [{ path: 'e/E-10.jpg' }], rules).status, 'missing');
});

test('conflicting spreadsheet and TXT image sources remain ambiguous', () => {
  const { rules } = parseRemarks('EKL42X25使用EK42X50图', 'buffer/备注.txt');
  const result = resolveRepresentativeImage('EKL42X25', [{ path: 'buffer/EK42x50.jpg' }, { path: 'buffer/EK42x25.jpg' }], rules, 'EK42X25');
  assert.equal(result.status, 'ambiguous'); assert.equal(result.selectedCandidate, null);
  assert.equal(result.evidence.length, 2);
});

const decisions = JSON.parse(fs.readFileSync(new URL('./image-decisions.json', import.meta.url), 'utf8')).decisions;
const decidedImages = [...new Map(decisions.map(d => [d.imagePath, { path: d.imagePath, sha256: d.imageSha256 }])).values()];

test('the three exact user decisions resolve conflicts without approving publication', () => {
  assert.deepEqual(decisions.map(d => d.model), ['EKL42X25', 'EK64X50', 'EKL64X50']);
  const { rules } = parseRemarks('EKL42X25、EK64X50、EKL64X50使用EK42X50图', '缓冲器/JPG/备注.txt');
  for (const decision of decisions) {
    const result = resolveRepresentativeImage(decision.model, decidedImages, rules, 'EK42X25', decision);
    assert.equal(result.status, 'confirmed');
    assert.equal(result.selectedCandidate, decision.imagePath);
    assert.equal(result.decisionCheck.priorStatus, 'ambiguous');
    assert.equal(result.approvalStatus, 'mapping_confirmed');
    assert.equal(result.publicationAllowed, false);
    assert.equal(result.candidates.length, 2);
    assert.deepEqual(result.evidence.map(e => e.mappingSource), ['remark_txt', 'spreadsheet_image_hint', 'user_decision']);
  }
});

test('a changed or missing image invalidates a decision instead of selecting a fallback', () => {
  const decision = decisions[0];
  const changed = decidedImages.map(image => image.path === decision.imagePath ? { ...image, sha256: '0'.repeat(64) } : image);
  assert.equal(resolveRepresentativeImage(decision.model, changed, [], null, decision).decisionCheck.error, 'decision_image_checksum_mismatch');
  const missing = resolveRepresentativeImage(decision.model, [], [], null, decision);
  assert.equal(missing.decisionCheck.error, 'decision_image_missing');
  assert.equal(missing.selectedCandidate, null);
});

test('an exact decision cannot be applied to another model or incomplete provenance', () => {
  assert.equal(resolveRepresentativeImage('EKL42X50', decidedImages, [], null, decisions[0]).decisionCheck.error, 'decision_model_mismatch');
  const invalid = resolveRepresentativeImage(decisions[0].model, decidedImages, [], null, { ...decisions[0], reason: '' });
  assert.equal(invalid.decisionCheck.error, 'decision_provenance_missing');
  assert.equal(invalid.selectedCandidate, null);
});
