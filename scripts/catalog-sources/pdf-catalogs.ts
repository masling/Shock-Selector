import { isSelectorSeriesCode } from "../../lib/catalog/status";
import { normalizeModelName, parseCatalogNumber } from "../../lib/catalog/model-normalization";
import type { ImportedModelRow, ImportedSpecValue } from "./source-types";

type PdfSeedRow = {
  model: string;
  seriesCode: string;
  sourceTitle: string;
  sourcePath: string;
  language: string;
  pageNumber: number;
  sectionTitle: string;
  specs: Record<string, string | number>;
};

const seedRows: PdfSeedRow[] = [
  { model: "EK 10x7 (B)", seriesCode: "EK", sourceTitle: "Shock Absorber", sourcePath: "uploads/files/20230609/2b1a848ef3d6e28b3a13e15e8fc52e0a.pdf", language: "en", pageNumber: 6, sectionTitle: "EK 10 to EKL 27 Technical Data", specs: { strokeMm: 7, optimalVelocityRange: "0.3-3.30", energyPerCycleNm: 7, energyPerHourNm: 13600, maxImpactForceN: 1220, maxThrustForceN: 350, threadSize: "M10 x 1.0", totalLengthMm: 57 } },
  { model: "EKL 14x10 (B)", seriesCode: "EKL", sourceTitle: "Shock Absorber", sourcePath: "uploads/files/20230609/2b1a848ef3d6e28b3a13e15e8fc52e0a.pdf", language: "en", pageNumber: 6, sectionTitle: "EK 10 to EKL 27 Technical Data", specs: { strokeMm: 10, optimalVelocityRange: "0.08-1.30", energyPerCycleNm: 7, energyPerHourNm: 22000, maxImpactForceN: 890, maxThrustForceN: 440, threadSize: "M14 x 1.5" } },
  { model: "EN 8x6", seriesCode: "EN", sourceTitle: "Shock Absorber", sourcePath: "uploads/files/20230609/2b1a848ef3d6e28b3a13e15e8fc52e0a.pdf", language: "en", pageNumber: 22, sectionTitle: "EN 8 to EN 27 Technical Data", specs: { strokeMm: 6 } },
  { model: "ES18985", seriesCode: "ES", sourceTitle: "Shock Absorber", sourcePath: "uploads/files/20230609/2b1a848ef3d6e28b3a13e15e8fc52e0a.pdf", language: "en", pageNumber: 37, sectionTitle: "ES Series Technical Data", specs: { strokeMm: 4, energyPerCycleNm: 16, energyPerHourNm: 28800, maxImpactForceN: 2200, maxThrustForceN: 300, totalLengthMm: 72.4, threadSize: "M12 x 1.0" } },
  { model: "EI 50 x 50", seriesCode: "EI", sourceTitle: "Heavy Duty Shock Absorber", sourcePath: "uploads/files/20230609/d4efb9d66fa65e5c45b93ed096d5efc9.pdf", language: "en", pageNumber: 6, sectionTitle: "EI 50 x 50 to EI 120 x 1000 Technical Data", specs: { strokeMm: 50, energyPerCycleNm: 3500, maxImpactForceN: 70000, weight: "5 kg" } },
  { model: "ED 1.5 x 2", seriesCode: "ED", sourceTitle: "Heavy Duty Shock Absorber", sourcePath: "uploads/files/20230609/d4efb9d66fa65e5c45b93ed096d5efc9.pdf", language: "en", pageNumber: 9, sectionTitle: "ED 1.5 Technical Data", specs: {} },
  { model: "WR2-100-10", seriesCode: "WR", sourceTitle: "Wire Rope Vibration Isolator", sourcePath: "uploads/files/20230609/3d6903fa68882f5178cc43ee08809849.pdf", language: "en", pageNumber: 7, sectionTitle: "WR2 Series Technical Data", specs: { mountingOption: "B, D, E" } },
  { model: "CR3-100", seriesCode: "CR", sourceTitle: "Wire Rope Vibration Isolator", sourcePath: "uploads/files/20230609/3d6903fa68882f5178cc43ee08809849.pdf", language: "en", pageNumber: 39, sectionTitle: "CR3 Series Technical Data", specs: {} },
  { model: "HGGS-5", seriesCode: "HGGS", sourceTitle: "Special Vibration Isolator", sourcePath: "uploads/files/20230609/e06516c7e70f0df4447b94fafef9129e.pdf", language: "en", pageNumber: 8, sectionTitle: "HGGS Series Technical Data", specs: { maxStaticLoadN: 50 } },
  { model: "HGGN6-200", seriesCode: "HGGN", sourceTitle: "Special Vibration Isolator", sourcePath: "uploads/files/20230609/e06516c7e70f0df4447b94fafef9129e.pdf", language: "en", pageNumber: 12, sectionTitle: "HGGN6 Series Technical Data", specs: { weight: "0.2 kg" } },
  { model: "JYXR(P)XXX065X-LEA", seriesCode: "JYXR_P", sourceTitle: "Special Vibration Isolator", sourcePath: "uploads/files/20230609/e06516c7e70f0df4447b94fafef9129e.pdf", language: "en", pageNumber: 27, sectionTitle: "JYXR(P) Standard Product Structure Data", specs: { nominalDiameterDn: 65, flangeOuterDiameterMm: 175, boltHolePattern: "8-Φ17", interfaceStandard: "GB569-65" } },
  { model: "JYXR(H)XXX040X-155EC", seriesCode: "JYXR_H", sourceTitle: "Special Vibration Isolator", sourcePath: "uploads/files/20230609/e06516c7e70f0df4447b94fafef9129e.pdf", language: "en", pageNumber: 29, sectionTitle: "JYXR(H) Standard Product Technical Data", specs: { nominalDiameterDn: 40 } },
];

function toImportedSpec(seed: PdfSeedRow, key: string, value: string | number): ImportedSpecValue {
  const parsed = parseCatalogNumber(value);
  return {
    key,
    rawValue: parsed.rawValue,
    valueNumber: parsed.valueNumber,
    valueText: typeof value === "string" ? value : parsed.valueText,
    sourceType: seed.language === "zh-cn" ? "PDF_CHINESE_FULL_CATALOG" as const : "PDF_ENGLISH" as const,
    sourcePath: seed.sourcePath,
    sourceTitle: seed.sourceTitle,
    language: seed.language,
    pageNumber: seed.pageNumber,
    sectionTitle: seed.sectionTitle,
    confidenceStatus: "PDF_CATALOG_ONLY" as const,
  };
}

export const pdfCatalogRows: ImportedModelRow[] = seedRows.map((seed) => {
  const model = normalizeModelName(seed.model);
  return {
    rawModel: seed.model,
    model,
    seriesCode: seed.seriesCode,
    selectorEligible: isSelectorSeriesCode(seed.seriesCode),
    rawData: seed,
    specs: Object.entries(seed.specs).map(([key, value]) => toImportedSpec(seed, key, value)),
    sourceRefs: [{
      sourceType: seed.language === "zh-cn" ? "PDF_CHINESE_FULL_CATALOG" as const : "PDF_ENGLISH" as const,
      sourcePath: seed.sourcePath,
      sourceTitle: seed.sourceTitle,
      language: seed.language,
      pageNumber: seed.pageNumber,
      sectionTitle: seed.sectionTitle,
      rawText: JSON.stringify(seed),
      extractionMethod: "manual_pdf_table_seed",
      confidenceStatus: "PDF_CATALOG_ONLY" as const,
    }],
  };
});
