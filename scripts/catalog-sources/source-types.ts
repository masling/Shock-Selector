export type ImportedSpecValue = {
  key: string;
  rawValue: string;
  valueNumber: number | null;
  valueText: string | null;
  sourceType: "PDF_ENGLISH" | "PDF_CHINESE_FULL_CATALOG" | "EXCEL_SELECTOR" | "MANUAL_SEED";
  sourcePath: string;
  sourceTitle: string;
  language: string;
  pageNumber?: number;
  sectionTitle?: string;
  confidenceStatus: "PDF_CATALOG_ONLY" | "EXCEL_SELECTOR_ONLY" | "NEEDS_REVIEW";
};

export type ImportedModelRow = {
  rawModel: string;
  model: string;
  seriesCode: string;
  selectorEligible: boolean;
  primaryImageUrl?: string | null;
  rawData: Record<string, unknown>;
  specs: ImportedSpecValue[];
  sourceRefs: Array<{
    sourceType: "PDF_ENGLISH" | "PDF_CHINESE_FULL_CATALOG" | "EXCEL_SELECTOR" | "MANUAL_SEED";
    sourcePath: string;
    sourceTitle: string;
    language: string;
    pageNumber?: number;
    sectionTitle?: string;
    rawText?: string;
    extractionMethod: string;
    confidenceStatus: "PDF_CATALOG_ONLY" | "EXCEL_SELECTOR_ONLY" | "NEEDS_REVIEW";
  }>;
};
