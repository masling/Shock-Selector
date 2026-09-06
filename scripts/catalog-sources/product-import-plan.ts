import { createHash } from "node:crypto";
import { modelKey } from "./asset-remarks.mjs";
import { mapProductRow, parseEngineeringValue, productFieldDefinitions, type MappedProduct, type MappedSpec, type MappingIssue } from "./product-field-mapping";

export type ExistingSpec = { key: string; unit: string | null; valueNumber: string | number | null; valueText: string | null; valueJson: unknown; rawValue: string | null };
export type ExistingModel = { id: string; model: string; rawModel: string; seriesId: string; seriesCode: string; specs: ExistingSpec[] };
export type CatalogSnapshot = { branchId: string; branchName: string; database: string; retrievedAt: string; models: ExistingModel[]; series: { id: string; code: string; familyKey: string }[]; specDefinitions: unknown[] };

export const newSeriesFamilyProposals = {
  HS: { familyKey: "heavy_duty_buffers", familyRequiresCreation: false, evidence: "EKD-Heavy Duty Shock Absorber-HS.pdf" },
  OVTW: { familyKey: "wire_rope_vibration_isolators", familyRequiresCreation: false, evidence: "Vibration Isolator 2024.pdf, contents pp. 7-37" },
  OVTC: { familyKey: "wire_rope_vibration_isolators", familyRequiresCreation: false, evidence: "Vibration Isolator 2024.pdf, contents pp. 38-49" },
  OVTS: { familyKey: "special_vibration_isolators", familyRequiresCreation: false, evidence: "Vibration Isolator 2024.pdf, contents pp. 50-53" },
  OVTN: { familyKey: "special_vibration_isolators", familyRequiresCreation: false, evidence: "Vibration Isolator 2024.pdf, contents pp. 54-57" },
  BE: { familyKey: "rubber_vibration_isolators", familyRequiresCreation: true, evidence: "Vibration Isolator 2024.pdf, rubber isolators pp. 64-65" },
  E: { familyKey: "rubber_vibration_isolators", familyRequiresCreation: true, evidence: "Vibration Isolator 2024.pdf, rubber isolators pp. 66-69" },
  EA: { familyKey: "rubber_vibration_isolators", familyRequiresCreation: true, evidence: "Vibration Isolator 2024.pdf, rubber isolators pp. 66-69" },
  "6JX": { familyKey: "rubber_vibration_isolators", familyRequiresCreation: true, evidence: "Vibration Isolator 2024.pdf, rubber isolators pp. 68-69" },
  SH: { familyKey: "rubber_vibration_isolators", familyRequiresCreation: true, evidence: "Vibration Isolator 2024.pdf, rubber isolators pp. 70-71" },
  WH: { familyKey: "rubber_vibration_isolators", familyRequiresCreation: true, evidence: "Vibration Isolator 2024.pdf, rubber isolators pp. 72-73" },
  WHG: { familyKey: "rubber_vibration_isolators", familyRequiresCreation: true, evidence: "Vibration Isolator 2024.pdf, rubber isolators pp. 72-73" },
} as const;

function equivalentUnit(unit: string | null, key: string) {
  if (unit === null || unit === "") return "";
  const normalized = unit.replace(/\s/g, "");
  if (key === "energyPerCycleNm" && ["Nm/C", "Nm/c", "Nm/cycle", "Nm"].includes(normalized)) return "Nm/C";
  if (key === "energyPerHourNm" && ["Nm/h", "Nm/hr"].includes(normalized)) return "Nm/h";
  return normalized;
}
function compareSpec(incoming: MappedSpec, existing: ExistingSpec[]) {
  if (incoming.state !== "valid") return { key: incoming.key, action: "hold_invalid_or_missing", incoming };
  if (!existing.length) return { key: incoming.key, action: "add_candidate", incoming };
  if (existing.length > 1) return { key: incoming.key, action: "duplicate_existing_specs_review", incoming, existing };
  const before = existing[0];
  if (equivalentUnit(before.unit, incoming.key) !== equivalentUnit(incoming.unit, incoming.key)) return { key: incoming.key, action: "unit_review", incoming, existing };
  const old = parseEngineeringValue(before.valueNumber ?? before.valueText ?? before.rawValue, incoming.dataType);
  const same = incoming.valueNumber !== null ? old.state === "valid" && old.valueNumber === incoming.valueNumber
    : incoming.valueJson ? JSON.stringify(old.valueJson ?? before.valueJson) === JSON.stringify(incoming.valueJson)
      : old.valueText?.replace(/\s/g, "").toUpperCase() === incoming.valueText?.replace(/\s/g, "").toUpperCase();
  return { key: incoming.key, action: same ? "unchanged" : "update_candidate", incoming, existing };
}

function chooseCanonicalExisting(models: ExistingModel[], normalizedTarget: string) {
  return [...models].sort((left, right) => {
    const score = (item: ExistingModel) => {
      const compactModel = item.model.replace(/\s+/g, "").toUpperCase();
      return (compactModel === normalizedTarget ? 0 : 10) + (item.model.includes(" ") ? 1 : 0);
    };
    return score(left) - score(right) || left.id.localeCompare(right.id);
  })[0] ?? null;
}

export function buildProductImportPlan(inputs: unknown[], snapshot: CatalogSnapshot) {
  const index = new Map<string, ExistingModel[]>();
  for (const existing of snapshot.models) { const key = modelKey(existing.model); index.set(key, [...(index.get(key) ?? []), existing]); }
  const duplicateExistingIdentities = [...index].filter(([, rows]) => rows.length > 1).map(([key, models]) => ({ key, models: models.map(model => ({ id: model.id, model: model.model })) }));
  const mapped: MappedProduct[] = [], rejectedRows: { index: number; issues: MappingIssue[] }[] = [];
  inputs.forEach((input, position) => { const result = mapProductRow(input); if (result.row) mapped.push(result.row); else rejectedRows.push({ index: position, issues: result.issues }); });
  const incomingCounts = new Map<string, number>();
  for (const row of mapped) incomingCounts.set(row.model, (incomingCounts.get(row.model) ?? 0) + 1);
  const referenced = new Set<string>();
  const candidates = mapped.map(row => {
    const exact = index.get(row.model) ?? [];
    const groupKeys = row.entityKind === "source_group" ? [row.model.slice(0, -3), `${row.model.slice(0, -3)}B`] : [];
    const possibleGroupMembers = groupKeys.flatMap(key => index.get(key) ?? []);
    for (const model of [...exact, ...possibleGroupMembers]) referenced.add(model.id);
    const targetSeries = snapshot.series.filter(series => series.code === row.targetSeriesCodeCandidate);
    const seriesProposal = newSeriesFamilyProposals[row.sourceSeriesCode as keyof typeof newSeriesFamilyProposals] ?? null;
    const identityReview = exact.length > 1 || possibleGroupMembers.length > 0 || row.entityKind === "source_group" || incomingCounts.get(row.model)! > 1;
    const status = identityReview ? "identity_review" : exact.length === 1 ? "existing_candidate" : "new_candidate";
    const specDiffs = !identityReview && exact.length === 1 ? row.specs.map(spec => compareSpec(spec, exact[0].specs.filter(value => value.key === spec.key))) : [];
    const groupBaseKey = row.entityKind === "source_group" ? row.model.slice(0, -3) : null;
    const groupTargets = groupBaseKey ? [groupBaseKey, `${groupBaseKey}B`].map(targetModel => {
      const matches = index.get(targetModel) ?? [];
      const canonical = chooseCanonicalExisting(matches, targetModel);
      return {
        model: targetModel,
        canonicalExistingId: canonical?.id ?? null,
        duplicateExistingIds: matches.filter(item => item.id !== canonical?.id).map(item => item.id),
        createRequired: canonical === null,
      };
    }) : [];
    const duplicateCanonical = row.entityKind === "source_model" && exact.length > 1 ? chooseCanonicalExisting(exact, row.model) : null;
    const identityProposal = row.entityKind === "source_group"
      ? { action: "fan_out_source_group", targets: groupTargets, retireSourceGroupIds: exact.map(item => item.id), requiresReview: true }
      : duplicateCanonical
        ? { action: "merge_normalization_duplicates", canonicalExistingId: duplicateCanonical.id, mergeExistingIds: exact.filter(item => item.id !== duplicateCanonical.id).map(item => item.id), requiresReview: true }
        : null;
    return {
      ...row, status, executionAllowed: false,
      existingMatches: exact.map(model => ({ id: model.id, model: model.model })),
      possibleGroupMembers: possibleGroupMembers.map(model => ({ id: model.id, model: model.model })),
      targetSeriesId: targetSeries.length === 1 ? targetSeries[0].id : null,
      seriesReviewRequired: targetSeries.length !== 1,
      seriesProposal,
      identityProposal,
      seriesMappingBasis: row.sourceSeriesCode === "EKL" ? "existing_catalog_combines_EK_and_EKL" : targetSeries.length === 1 ? "exact_series_code" : seriesProposal ? "catalog_evidence_new_series_proposal" : "unmapped_source_series_no_alias_assumed",
      specDiffs,
      preserveExistingSpecKeys: exact.length === 1 ? exact[0].specs.filter(spec => !row.specs.some(value => value.key === spec.key)).map(spec => spec.key) : [],
    };
  });
  const countBy = <T>(items: T[], selector: (item: T) => string) => items.reduce<Record<string, number>>((counts, item) => { const key = selector(item); counts[key] = (counts[key] ?? 0) + 1; return counts; }, {});
  const allIssues = candidates.flatMap(row => row.issues);
  return {
    version: 1, mode: "local_dry_run", databaseMutations: 0, productionExecutionAllowed: false,
    snapshot: { branchId: snapshot.branchId, branchName: snapshot.branchName, database: snapshot.database, retrievedAt: snapshot.retrievedAt, fingerprint: createHash("sha256").update(JSON.stringify({ models: snapshot.models, series: snapshot.series, specDefinitions: snapshot.specDefinitions })).digest("hex") },
    fieldDefinitions: productFieldDefinitions,
    summary: {
      sourceRows: inputs.length, mappedRows: mapped.length, rejectedRows: rejectedRows.length,
      existingRows: snapshot.models.length, existingNormalizedIdentities: index.size,
      statuses: countBy(candidates, row => row.status), fieldStates: countBy(candidates.flatMap(row => row.specs), spec => spec.state),
      fieldChanges: countBy(candidates.flatMap(row => row.specDiffs), diff => diff.action), issues: countBy(allIssues, issue => issue.code),
      identityProposals: countBy(candidates.filter(row => row.identityProposal), row => row.identityProposal!.action),
      sourceSeriesRequiringMapping: [...new Set(candidates.filter(row => row.seriesReviewRequired).map(row => row.sourceSeriesCode))].sort(),
      rowsRequiringSeriesMapping: candidates.filter(row => row.seriesReviewRequired).length,
      proposedNewFamilyKeys: [...new Set(candidates.flatMap(row => row.seriesProposal?.familyRequiresCreation ? [row.seriesProposal.familyKey] : []))].sort(),
      existingRowsRetainedOutsideIncoming: snapshot.models.filter(model => !referenced.has(model.id)).length,
    },
    duplicateExistingIdentities, candidates, rejectedRows,
    retainExistingModels: snapshot.models.filter(model => !referenced.has(model.id)).map(model => ({ id: model.id, model: model.model, seriesCode: model.seriesCode, action: "retain_no_implicit_delete" })),
    rules: ["All candidates remain DRAFT; NEEDS_REVIEW is not a privacy boundary in the current repository.", "Do not merge (B) source groups with existing base/B models automatically.", "Catalog evidence proposes families for the 12 new source series, but each series still requires review and explicit creation.", "Do not merge OVTW/OVTC into WR/CR automatically even though they share the same product families.", "Axis-specific N/mm fields retain their units and are not copied into legacy N/m fields.", "Missing source fields such as totalLengthMm never erase existing values.", "No production write or automatic selection/publication approval is included."],
  };
}
