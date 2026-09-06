import test from "node:test";
import assert from "node:assert/strict";
import { mapProductRow, parseEngineeringValue, productFieldDefinitions } from "./product-field-mapping";
import { buildProductImportPlan, type CatalogSnapshot, type ExistingModel } from "./product-import-plan";

const source = (model = "EK42X50", specs: unknown[] = [{ label: "缓冲行程 mm", cell: "C2", value: 50 }]) => ({ model, rawModel: model, kind: "absorber", source: { file: "product-data/source.xlsx", sheet: "data", row: 2, modelCell: "A2" }, specs, sourceSelectorFlag: 1 });
const existing = (id: string, model: string): ExistingModel => ({ id, model, rawModel: model, seriesId: "ek", seriesCode: "EK", specs: [] });
const snapshot = (models: ExistingModel[] = []): CatalogSnapshot => ({ branchId: "test", branchName: "snapshot", database: "test", retrievedAt: "2026-09-04", models, series: [{ id: "ek", code: "EK", familyKey: "shock_absorbers" }], specDefinitions: [] });

test("range, tolerance and one-sided bound retain their different meanings", () => {
  assert.deepEqual(parseEngineeringValue("5～9", "RANGE").valueJson, { kind: "range", min: 5, max: 9 });
  assert.deepEqual(parseEngineeringValue("7±1.5", "RANGE").valueJson, { kind: "tolerance", nominal: 7, minus: 1.5, plus: 1.5, min: 5.5, max: 8.5 });
  assert.deepEqual(parseEngineeringValue("≥0.18", "RANGE").valueJson, { kind: "bound", operator: "gte", bound: 0.18 });
  assert.equal(parseEngineeringValue("0.3-3.3", "RANGE").valueNumber, null);
});

test("missing, placeholders and malformed input never become plausible zero values", () => {
  assert.equal(parseEngineeringValue(null, "NUMBER").state, "missing");
  assert.equal(parseEngineeringValue("待定", "TEXT").state, "placeholder");
  const invalid = parseEngineeringValue("21.+", "NUMBER");
  assert.equal(invalid.state, "invalid"); assert.equal(invalid.valueNumber, null); assert.equal(invalid.rawValue, "21.+");
  for (const value of ["9-5", "1±2", "=1+1", "Infinity", "1,2"]) assert.equal(parseEngineeringValue(value, "RANGE").state, "invalid");
  assert.equal(parseEngineeringValue("1,000.5", "NUMBER").valueNumber, 1000.5);
  assert.equal(parseEngineeringValue(0, "NUMBER").valueNumber, 0);
  assert.equal(parseEngineeringValue(`1-${"9".repeat(400)}`, "RANGE").state, "invalid");
});

test("axis-specific N/mm values are not folded into the legacy N/m key", () => {
  const row = mapProductRow({ ...source("6JX-25", [{ label: "X\n静刚度\nN/mm", cell: "B2", value: 19 }]), kind: "isolator" }).row!;
  assert.equal(row.specs[0].key, "staticStiffnessXNPerMm"); assert.equal(row.specs[0].unit, "N/mm"); assert.equal(row.specs[0].valueNumber, 19);
  assert.equal(row.sourceSelectorFlag, 1); assert.equal(row.runtimeSelectorSupported, false); assert.equal(row.selectorEligible, false);
  assert.equal(row.catalogStatus, "DRAFT"); assert.equal(row.selectorStatus, "NOT_APPLICABLE");
  assert.equal(productFieldDefinitions.length, 26);
});

test("a source typo is corrected only by an exact evidence-backed rule", () => {
  const row = mapProductRow({ ...source("OVTW24-70-10", [{ label: "X\n最大允许变形\nmm", cell: "L143", value: "21.+" }]), kind: "isolator" }).row!;
  assert.equal(row.specs[0].state, "valid");
  assert.equal(row.specs[0].valueNumber, 21.8);
  assert.equal(row.specs[0].correction?.originalRawValue, "21.+");
  assert.match(row.specs[0].correction?.evidence ?? "", /OVTW24 technical data/);
  assert.equal(row.issues[0].code, "spec_corrected_from_evidence");
  const unmatched = mapProductRow({ ...source("OVTW24-70-10", [{ label: "X\n最大允许变形\nmm", cell: "L144", value: "21.+" }]), kind: "isolator" }).row!;
  assert.equal(unmatched.specs[0].state, "invalid");
});

test("unknown columns and invalid rows are reported without stopping other rows", () => {
  const plan = buildProductImportPlan([{}, source(), source("EK42X25", [{ label: "未知字段", cell: "Z2", value: 42 }])], snapshot());
  assert.equal(plan.summary.rejectedRows, 1); assert.equal(plan.summary.mappedRows, 2);
  assert.equal(plan.candidates[1].unmappedFields.length, 1);
});

test("B groups do not overwrite existing base and B identities", () => {
  const plan = buildProductImportPlan([source("EK10X7(B)")], snapshot([existing("a", "EK10x7"), existing("b", "EK10x7B")]));
  assert.equal(plan.candidates[0].status, "identity_review");
  assert.equal(plan.candidates[0].possibleGroupMembers.length, 2);
  assert.equal(plan.candidates[0].specDiffs.length, 0);
  assert.equal(plan.candidates[0].executionAllowed, false);
  assert.deepEqual(plan.candidates[0].identityProposal, {
    action: "fan_out_source_group",
    targets: [
      { model: "EK10X7", canonicalExistingId: "a", duplicateExistingIds: [], createRequired: false },
      { model: "EK10X7B", canonicalExistingId: "b", duplicateExistingIds: [], createRequired: false },
    ],
    retireSourceGroupIds: [],
    requiresReview: true,
  });
});

test("normalization collisions retain all existing IDs for review", () => {
  const plan = buildProductImportPlan([source("ED1.5X2")], snapshot([existing("a", "ED 1.5 x 2"), existing("b", "ED1.5x2")]));
  assert.equal(plan.duplicateExistingIdentities.length, 1);
  assert.equal(plan.candidates[0].existingMatches.length, 2);
  assert.equal(plan.candidates[0].status, "identity_review");
  assert.deepEqual(plan.candidates[0].identityProposal, {
    action: "merge_normalization_duplicates",
    canonicalExistingId: "b",
    mergeExistingIds: ["a"],
    requiresReview: true,
  });
  assert.deepEqual(plan.summary.identityProposals, { merge_normalization_duplicates: 1 });
});

test("field diffs preserve absent fields and models rather than deleting", () => {
  const item = existing("a", "EK42x50");
  item.specs = [
    { key: "strokeMm", unit: "mm", valueNumber: "25", valueText: null, valueJson: null, rawValue: "25" },
    { key: "totalLengthMm", unit: "mm", valueNumber: "150", valueText: null, valueJson: null, rawValue: "150" },
  ];
  const plan = buildProductImportPlan([source()], snapshot([item, existing("b", "WR-legacy")]));
  assert.equal(plan.candidates[0].specDiffs[0].action, "update_candidate");
  assert.deepEqual(plan.candidates[0].preserveExistingSpecKeys, ["totalLengthMm"]);
  assert.equal(plan.retainExistingModels[0].action, "retain_no_implicit_delete");
  assert.equal(plan.databaseMutations, 0);
});

test("units cannot be silently changed even when numbers happen to match", () => {
  const item = existing("a", "EK42X50");
  item.specs = [{ key: "strokeMm", unit: "m", valueNumber: "50", valueText: null, valueJson: null, rawValue: "50" }];
  assert.equal(buildProductImportPlan([source()], snapshot([item])).candidates[0].specDiffs[0].action, "unit_review");
});

test("EKL uses the existing combined EK series but unknown isolator series are not aliased", () => {
  const plan = buildProductImportPlan([source("EKL42X50"), { ...source("OVTC12-10"), kind: "isolator" }, { ...source("6JX-25"), kind: "isolator" }], snapshot());
  assert.equal(plan.candidates[0].targetSeriesId, "ek");
  assert.equal(plan.candidates[1].targetSeriesId, null);
  assert.equal(plan.candidates[1].seriesReviewRequired, true);
  assert.equal(plan.candidates[1].sourceSeriesCode, "OVTC");
  assert.deepEqual(plan.candidates[1].seriesProposal, {
    familyKey: "wire_rope_vibration_isolators",
    familyRequiresCreation: false,
    evidence: "Vibration Isolator 2024.pdf, contents pp. 38-49",
  });
  assert.equal(plan.candidates[1].seriesMappingBasis, "catalog_evidence_new_series_proposal");
  assert.equal(plan.candidates[2].seriesProposal?.familyKey, "rubber_vibration_isolators");
  assert.equal(plan.candidates[2].seriesProposal?.familyRequiresCreation, true);
  assert.deepEqual(plan.summary.proposedNewFamilyKeys, ["rubber_vibration_isolators"]);
});
