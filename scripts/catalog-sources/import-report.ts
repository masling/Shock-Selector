import fs from "node:fs/promises";
import path from "node:path";

export type CatalogImportReport = {
  familyCount: number;
  seriesCount: number;
  modelCount: number;
  modelsBySeries: Record<string, number>;
  selectorEligibleCount: number;
  selectorReadyCount: number;
  selectorIncompleteCount: number;
  selectorConflictCount: number;
  pdfOnlyAbsorberModels: string[];
  excelOnlyAbsorberModels: string[];
  modelsWithoutSourceRefs: string[];
  modelsWithoutSpecs: string[];
  unresolvedIssueCount: number;
};

export async function writeCatalogImportReport(report: CatalogImportReport) {
  const outDir = path.join(process.cwd(), "data/generated");
  await fs.mkdir(outDir, { recursive: true });

  await fs.writeFile(
    path.join(outDir, "catalog-import-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  const markdown = [
    "# Catalog Import Report",
    "",
    `- Families: ${report.familyCount}`,
    `- Series: ${report.seriesCount}`,
    `- Models: ${report.modelCount}`,
    `- Selector eligible: ${report.selectorEligibleCount}`,
    `- Selector ready: ${report.selectorReadyCount}`,
    `- Selector incomplete: ${report.selectorIncompleteCount}`,
    `- Selector conflicts: ${report.selectorConflictCount}`,
    `- Unresolved issues: ${report.unresolvedIssueCount}`,
    "",
    "## Models by Series",
    ...Object.entries(report.modelsBySeries).map(([series, count]) => `- ${series}: ${count}`),
    "",
    "## PDF-only Absorber Models",
    ...(report.pdfOnlyAbsorberModels.length ? report.pdfOnlyAbsorberModels.map((model) => `- ${model}`) : ["- None"]),
    "",
    "## Excel-only Absorber Models",
    ...(report.excelOnlyAbsorberModels.length ? report.excelOnlyAbsorberModels.map((model) => `- ${model}`) : ["- None"]),
    "",
    "## Models Without Source References",
    ...(report.modelsWithoutSourceRefs.length ? report.modelsWithoutSourceRefs.map((model) => `- ${model}`) : ["- None"]),
    "",
    "## Models Without Specs",
    ...(report.modelsWithoutSpecs.length ? report.modelsWithoutSpecs.map((model) => `- ${model}`) : ["- None"]),
    "",
  ].join("\n");

  await fs.writeFile(path.join(outDir, "catalog-import-report.md"), markdown, "utf8");
}
