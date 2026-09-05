import path from 'node:path';

export function modelKey(value) {
  return String(value ?? '').normalize('NFKC').trim().toUpperCase()
    .replace(/[×✕]/g, 'X').replace(/[‐‑–—]/g, '-').replace(/(?<=\d)_(?=\d)/g, '.')
    .replace(/\s+/g, '');
}

// Image export conventions do not change product identity.
export function imageKey(file) {
  const stem = path.basename(file, path.extname(file)).replace(/\s+\d+$/, '').replace(/系列$/, '');
  return modelKey(stem).replace(/\(B\)$/, '');
}

// In this source package, E/EA workbook IDs omit the dash used in image notes.
// This is an attachment spelling bridge, never a database identity merge.
function attachmentKey(value) {
  return modelKey(value).replace(/^(EA?)-(\d+)$/, '$1$2');
}

function token(value) {
  const series = /系列\s*$/.test(value);
  return { raw: value.trim(), key: modelKey(value.replace(/系列\s*$/, '')), series };
}

export function matchesTarget(model, target) {
  const key = attachmentKey(model);
  if (/\(N\)$/.test(target.key)) {
    const base = target.key.slice(0, -3);
    return key === base || key === `${base}N` || key === target.key;
  }
  if (!target.series) return key === attachmentKey(target.key);
  // A following digit belongs to a different size, not this series.
  return key === target.key || (key.startsWith(target.key) && !/[\d.]/.test(key.slice(target.key.length, target.key.length + 1)));
}

export function parseRemarks(text, sourcePath) {
  const rules = [], issues = [];
  let buffer = '', startLine = 0;
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (!buffer) startLine = i + 1;
    buffer += line;
    if (!/图\s*$/.test(buffer)) continue;
    const rawText = buffer;
    const cleaned = buffer.replace(/^\d+[、．.]\s*/, '');
    buffer = '';
    const explicit = cleaned.match(/^(.+?)使用(.+?)图$/);
    const shared = cleaned.match(/^(.+?)(?:共用|用)(?:一份|一个)渲染图$/);
    const match = explicit ?? shared;
    if (!match) {
      issues.push({ code: 'unparsed_remark', sourcePath, line: startLine, rawText });
      continue;
    }
    const targets = match[1].split(/[、，,]/).map(x => x.trim()).filter(Boolean).map(token);
    if (!targets.length || targets.some(x => !/^[A-Z0-9][A-Z0-9().-]*$/.test(x.key))) {
      issues.push({ code: 'invalid_remark_target', sourcePath, line: startLine, rawText });
      continue;
    }
    rules.push({ id: `${sourcePath}:${startLine}`, sourcePath, line: startLine, rawText, scope: path.posix.dirname(sourcePath), kind: explicit ? 'explicit_source' : 'shared_group', targets, imageSource: explicit ? modelKey(explicit[2]) : null, approvalStatus: 'pending' });
  }
  if (buffer) issues.push({ code: 'unparsed_remark', sourcePath, line: startLine, rawText: buffer });
  return { rules, issues };
}

function sourceMatches(asset, source) {
  return attachmentKey(imageKey(asset.path)) === attachmentKey(modelKey(source).replace(/\(B\)$/, ''));
}

export function resolveRepresentativeImage(model, images, rules, sourceHint = null, decision = null) {
  const direct = images.filter(asset => sourceMatches(asset, model));
  const matchedRules = rules.filter(rule => rule.targets.some(target => matchesTarget(model, target)));
  const evidence = matchedRules.map(rule => {
    const candidates = images.filter(asset => asset.path.startsWith(`${rule.scope}/`) && (
      rule.imageSource ? sourceMatches(asset, rule.imageSource) : rule.targets.some(target => target.series
        ? matchesTarget(imageKey(asset.path), target)
        : sourceMatches(asset, target.key) || (/\(N\)$/.test(target.key) && sourceMatches(asset, target.key.slice(0, -3)))
      )
    ));
    return { ruleId: rule.id, mappingSource: 'remark_txt', sourcePath: rule.sourcePath, line: rule.line, rawText: rule.rawText, candidates: candidates.map(x => x.path) };
  });
  if (sourceHint) evidence.push({ mappingSource: 'spreadsheet_image_hint', sourceHint, candidates: images.filter(asset => sourceMatches(asset, sourceHint)).map(x => x.path) });
  const declared = [...new Set(evidence.flatMap(x => x.candidates))];
  const missingEvidence = evidence.some(x => x.candidates.length === 0);
  const candidates = declared.length ? declared : direct.map(x => x.path);
  const status = missingEvidence ? 'unresolved_reference' : candidates.length === 0 ? 'missing' : candidates.length > 1 ? 'ambiguous' : 'proposed';
  const result = {
    status,
    selectedCandidate: status === 'proposed' ? candidates[0] : null,
    mappingSource: evidence.length ? 'declared_inheritance' : 'filename_candidate',
    candidates, directCandidates: direct.map(x => x.path), evidence,
    directConflict: declared.length > 0 && direct.some(x => !declared.includes(x.path)),
    imageRole: 'representative_candidate', approvalStatus: 'pending',
    publicationAllowed: false,
  };
  if (!decision) return result;

  const asset = images.find(image => image.path === decision.imagePath);
  const error = modelKey(decision.model) !== modelKey(model) ? 'decision_model_mismatch'
    : !asset ? 'decision_image_missing'
      : !/^[a-f0-9]{64}$/.test(decision.imageSha256 ?? '') || asset.sha256 !== decision.imageSha256 ? 'decision_image_checksum_mismatch'
        : !decision.id || !decision.confirmedBy || !decision.confirmedOn || !decision.reason ? 'decision_provenance_missing' : null;
  return {
    ...result,
    status: error ? 'decision_invalid' : 'confirmed',
    selectedCandidate: error ? null : decision.imagePath,
    mappingSource: 'user_decision',
    approvalStatus: error ? 'pending' : 'mapping_confirmed',
    candidates: error ? result.candidates : [...new Set([...result.candidates, decision.imagePath])],
    evidence: [...result.evidence, { mappingSource: 'user_decision', ...decision }],
    decisionCheck: { status: error ? 'invalid' : 'valid', error, priorStatus: result.status },
  };
}
