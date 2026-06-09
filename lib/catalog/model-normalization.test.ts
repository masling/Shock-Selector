import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectSeriesCode,
  normalizeModelName,
  parseCatalogNumber,
  parseDecimalText,
  sortKeyForModel,
} from "./model-normalization";

describe("catalog model normalization", () => {
  it("normalizes spacing while preserving technical model text", () => {
    assert.equal(normalizeModelName("  EK 10x7   (B) "), "EK 10x7 (B)");
    assert.equal(normalizeModelName("WR6 - 400 - 10"), "WR6-400-10");
    assert.equal(normalizeModelName("JYXR(P)XXX100X-LEA"), "JYXR(P)XXX100X-LEA");
  });

  it("detects series codes from normalized models", () => {
    assert.equal(detectSeriesCode("EK 10x7 (B)"), "EK");
    assert.equal(detectSeriesCode("EKL 33x25"), "EKL");
    assert.equal(detectSeriesCode("WR6-400-10"), "WR");
    assert.equal(detectSeriesCode("HGGN16-206"), "HGGN");
    assert.equal(detectSeriesCode("JYXR(P)XXX100X-LEA"), "JYXR_P");
    assert.equal(detectSeriesCode("JYXR(H)XXX080X-175EC"), "JYXR_H");
  });

  it("parses catalog numbers with commas and spaces", () => {
    assert.equal(parseDecimalText("13 600"), 13600);
    assert.equal(parseDecimalText("1,220"), 1220);
    assert.equal(parseDecimalText("0.08-1.30"), null);
    assert.equal(parseDecimalText("–"), null);
  });

  it("parses range-looking catalog values without losing raw text", () => {
    assert.deepEqual(parseCatalogNumber("0.3-3.30"), {
      valueNumber: null,
      valueText: "0.3-3.30",
      rawValue: "0.3-3.30",
    });
    assert.deepEqual(parseCatalogNumber("215.0"), {
      valueNumber: 215,
      valueText: null,
      rawValue: "215.0",
    });
  });

  it("creates stable sort keys", () => {
    assert.equal(sortKeyForModel("EK 10x7 (B)").startsWith("EK|000010|000007"), true);
    assert.equal(sortKeyForModel("WR6-400-10").startsWith("WR|000006|000400|000010"), true);
  });
});
