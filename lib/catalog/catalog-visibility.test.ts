import test from "node:test";
import assert from "node:assert/strict";
import { publishedFamilyWhere, publishedModelWhere, publishedSeriesWhere } from "./catalog-visibility";

test("public catalog requires active published families and published series/models", () => {
  assert.deepEqual(publishedFamilyWhere(), { isActive: true, catalogStatus: "PUBLISHED" });
  assert.deepEqual(publishedModelWhere(), { isActive: true, catalogStatus: "PUBLISHED", series: { catalogStatus: "PUBLISHED", family: { isActive: true, catalogStatus: "PUBLISHED" } } });
});

test("family, series slug and series code constraints coexist instead of overwriting each other", () => {
  const input = { familySlug: "shock-absorbers", seriesSlug: "ek", seriesCode: "ek" };
  assert.deepEqual(publishedSeriesWhere(input), { catalogStatus: "PUBLISHED", family: { isActive: true, catalogStatus: "PUBLISHED", slug: "shock-absorbers" }, slug: "ek", code: "EK" });
  assert.deepEqual(publishedModelWhere(input).series, publishedSeriesWhere(input));
});
