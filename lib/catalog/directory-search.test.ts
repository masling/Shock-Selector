import assert from "node:assert/strict";
import test from "node:test";
import { directoryKeySpecs, directoryModelHref, directoryQuoteHref, directorySearchHref, parseDirectorySearch } from "./directory-search";

test("directory search accepts Unicode size notation and guards query length and pagination", () => {
  assert.deepEqual(parseDirectorySearch({ q: " EK42×50 ", page: "2" }), { query: "EK42×50", modelQuery: "EK42X50", page: 2, valid: true });
  for (const page of ["-1", "0", "Infinity", "nope", "1.2", "10001"]) assert.equal(parseDirectorySearch({ page }).page, 1);
  assert.equal(parseDirectorySearch({ q: ["EK", "EN"] }).query, "EK");
  assert.equal(parseDirectorySearch({ q: "X".repeat(81) }).valid, false);
  assert.equal(parseDirectorySearch({ q: "  " }).query, "");
});

test("model and RFQ links keep the exact model and existing localized destinations", () => {
  const model = { familySlug: "shock-absorbers", seriesSlug: "ek", model: "EK42X50(B)" };
  const details = new URL(directoryModelHref("de", model), "https://example.com");
  assert.equal(details.pathname, "/de/products/shock-absorbers/ek");
  assert.equal(details.searchParams.get("model"), model.model);
  assert.ok(details.hash);
  const quote = new URL(directoryQuoteHref("fr", "EK42X50 & test"), "https://example.com");
  assert.equal(quote.pathname, "/fr/contact");
  assert.equal(quote.searchParams.get("models"), "EK42X50 & test");
  const page = new URL(directorySearchHref("en", "EK+EN", 2), "https://example.com");
  assert.equal(page.searchParams.get("q"), "EK+EN");
  assert.equal(page.searchParams.get("page"), "2");
});

test("key specs prefer sizing dimensions, preserve zero, and fall back to other families' actual data", () => {
  const spec = (key: string, value: number | null) => ({ key, value, label: key, unit: null, rawValue: null });
  assert.deepEqual(directoryKeySpecs({ specs: [spec("weight", 3), spec("threadSize", null), spec("energyPerCycleNm", 0), spec("strokeMm", 50)] }).map(s => s.key), ["strokeMm", "energyPerCycleNm", "weight"]);
  assert.deepEqual(directoryKeySpecs({ specs: [spec("loadKg", 20), spec("heightMm", 50)] }).map(s => s.key), ["loadKg", "heightMm"]);
});
