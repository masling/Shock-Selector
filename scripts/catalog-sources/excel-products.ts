import * as XLSX from "xlsx";
import { isSelectorSeriesCode } from "../../lib/catalog/status";
import { detectSeriesCode, normalizeModelName, parseCatalogNumber } from "../../lib/catalog/model-normalization";
import type { ImportedModelRow } from "./source-types";

const workbookPath = "data/选型程序算法.xlsx";
const databaseSheetName = "数据库";

const excelSpecMap: Record<string, string> = {
  "缓冲行程（mm)": "strokeMm",
  "每次最大吸收能量(Nm/c)": "energyPerCycleNm",
  "每小时最大吸收能量(Nm/h)": "energyPerHourNm",
  "最大冲击力N": "maxImpactForceN",
  "最大推进力N": "maxThrustForceN",
  "总长度": "totalLengthMm",
  "螺纹尺寸": "threadSize",
};

export function mapExcelRowToImportedModel(row: Record<string, unknown>): ImportedModelRow | null {
  const rawModel = row["产品型号"];
  if (!rawModel) return null;

  const model = normalizeModelName(String(rawModel));
  const seriesCode = detectSeriesCode(model);
  const selectorEligible = isSelectorSeriesCode(seriesCode);

  const specs = Object.entries(excelSpecMap).flatMap(([header, key]) => {
    const raw = row[header];
    if (raw === null || raw === undefined || raw === "") return [];

    const parsed = parseCatalogNumber(raw);
    return [{
      key,
      rawValue: parsed.rawValue,
      valueNumber: parsed.valueNumber,
      valueText: key === "threadSize" ? parsed.rawValue : parsed.valueText,
      sourceType: "EXCEL_SELECTOR" as const,
      sourcePath: workbookPath,
      sourceTitle: "选型程序算法.xlsx 数据库 sheet",
      language: "zh-cn",
      sectionTitle: databaseSheetName,
      confidenceStatus: "EXCEL_SELECTOR_ONLY" as const,
    }];
  });

  return {
    rawModel: model,
    model,
    seriesCode,
    selectorEligible,
    primaryImageUrl: row["产品照片"] ? `/product-images/${row["产品照片"]}.jpg` : null,
    rawData: row,
    specs,
    sourceRefs: [{
      sourceType: "EXCEL_SELECTOR",
      sourcePath: workbookPath,
      sourceTitle: "选型程序算法.xlsx 数据库 sheet",
      language: "zh-cn",
      sectionTitle: databaseSheetName,
      rawText: JSON.stringify(row),
      extractionMethod: "xlsx",
      confidenceStatus: "EXCEL_SELECTOR_ONLY",
    }],
  };
}

export function readExcelProductRows(path = workbookPath) {
  const workbook = XLSX.readFile(path, { cellDates: false });
  const sheet = workbook.Sheets[databaseSheetName];
  if (!sheet) return [];

  return XLSX.utils
    .sheet_to_json<Record<string, unknown>>(sheet, { defval: null })
    .map(mapExcelRowToImportedModel)
    .filter((row): row is ImportedModelRow => row !== null);
}
