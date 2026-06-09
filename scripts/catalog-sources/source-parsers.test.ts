import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapExcelRowToImportedModel } from "./excel-products";
import { pdfCatalogRows } from "./pdf-catalogs";

describe("catalog source parsers", () => {
  it("maps Excel absorber rows into selector-eligible imported models", () => {
    const row = mapExcelRowToImportedModel({
      "产品型号": "ES18985",
      "类型": "固定型",
      "缓冲行程（mm)": 4,
      "每次最大吸收能量(Nm/c)": 16,
      "每小时最大吸收能量(Nm/h)": 28800,
      "最大冲击力N": 2200,
      "最大推进力N": 300,
      "总长度": 72.4,
      "螺纹尺寸": "M12x1.0",
      "产品照片": 3006,
    });

    assert.equal(row?.model, "ES18985");
    assert.equal(row?.seriesCode, "ES");
    assert.equal(row?.selectorEligible, true);
    assert.equal(row?.specs.find((spec) => spec.key === "strokeMm")?.valueNumber, 4);
    assert.equal(row?.specs.find((spec) => spec.key === "threadSize")?.valueText, "M12x1.0");
  });

  it("contains PDF-derived rows for every required series", () => {
    const seriesCodes = new Set(pdfCatalogRows.map((row) => row.seriesCode));
    for (const code of ["EK", "EKL", "EN", "ES", "EI", "ED", "WR", "CR", "HGGS", "HGGN", "JYXR_P", "JYXR_H"]) {
      assert.equal(seriesCodes.has(code), true, `missing ${code}`);
    }
  });

  it("marks PDF-only absorber rows as selector eligible", () => {
    const row = pdfCatalogRows.find((item) => item.model === "EK 10x7 (B)");
    assert.equal(row?.selectorEligible, true);
    assert.equal(row?.specs.find((spec) => spec.key === "energyPerCycleNm")?.valueNumber, 7);
  });
});
