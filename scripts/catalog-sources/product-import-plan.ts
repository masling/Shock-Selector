import { createHash } from "node:crypto";
import { modelKey } from "./asset-remarks.mjs";
import { mapProductRow, parseEngineeringValue, productFieldDefinitions, type MappedProduct, type MappedSpec, type MappingIssue } from "./product-field-mapping";

export type ExistingSpec = { key: string; unit: string | null; valueNumber: string | number | null; valueText: string | null; valueJson: unknown; rawValue: string | null };
export type ExistingModel = { id: string; model: string; rawModel: string; seriesId: string; seriesCode: string; specs: ExistingSpec[] };
export type CatalogSnapshot = { branchId: string; branchName: string; database: string; retrievedAt: string; models: ExistingModel[]; series: { id: string; code: string; familyKey: string }[]; specDefinitions: unknown[] };

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
    const identityReview = exact.length > 1 || possibleGroupMembers.length > 0 || row.entityKind === "source_group" || incomingCounts.get(row.model)! > 1;
    const status = identityReview ? "identity_review" : exact.length === 1 ? "existing_candidate" : "new_candidate";
    const specDiffs = !identityReview && exact.length === 1 ? row.specs.map(spec => compareSpec(spec, exact[0].specs.filter(value => value.key === spec.key))) : [];
    return {
      ...row, status, executionAllowed: false,
      existingMatches: exact.map(model => ({ id: model.id, model: model.model })),
      possibleGroupMembers: possibleGroupMembers.map(model => ({ id: model.id, model: model.model })),
      targetSeriesId: targetSeries.length === 1 ? targetSeries[0].id : null,
      seriesReviewRequired: targetSeries.length !== 1,
      seriesMappingBasis: row.sourceSeriesCode === "EKL" ? "existing_catalog_combines_EK_and_EKL" : targetSeries.length === 1 ? "exact_series_code" : "unmapped_source_series_no_alias_assumed",
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
      sourceSeriesRequiringMapping: [...new Set(candidates.filter(row => row.seriesReviewRequired).map(row => row.sourceSeriesCode))].sort(),
      rowsRequiringSeriesMapping: candidates.filter(row => row.seriesReviewRequired).length,
      existingRowsRetainedOutsideIncoming: snapshot.models.filter(model => !referenced.has(model.id)).length,
    },
    duplicateExistingIdentities, candidates, rejectedRows,
    retainExistingModels: snapshot.models.filter(model => !referenced.has(model.id)).map(model => ({ id: model.id, model: model.model, seriesCode: model.seriesCode, action: "retain_no_implicit_delete" })),
    rules: ["All candidates remain DRAFT; NEEDS_REVIEW is not a privacy boundary in the current repository.", "Do not merge (B) source groups with existing base/B models automatically.", "Do not map new source isolator series to WR/CR/HGGS/HGGN without evidence.", "Axis-specific N/mm fields retain their units and are not copied into legacy N/m fields.", "Missing source fields such as totalLengthMm never erase existing values.", "No production write or automatic selection/publication approval is included."],
  };
}
