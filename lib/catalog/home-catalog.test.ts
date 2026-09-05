import assert from "node:assert/strict";
import test from "node:test";
import { buildHomeCatalog } from "./home-catalog";

test("homepage keeps every published category when the catalog grows, including categories without translations or series", () => {
  const families = Array.from({ length: 7 }, (_, index) => ({
    slug: `family-${index}`, translations: [{ locale: "en", name: `Family ${index}`, summary: "Description" }], series: [{ code: `S${index}` }],
  }));
  const result = buildHomeCatalog([...families, { slug: "new-family", translations: [], series: [] }], "de");
  assert.equal(result.length, 8);
  assert.deepEqual(result.map((family) => family.slug), [...families.map((family) => family.slug), "new-family"]);
  assert.equal(result[0].language, "en");
  assert.equal(result.at(-1)?.name, "new-family");
  assert.deepEqual(result.at(-1)?.seriesCodes, []);
});
