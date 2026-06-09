import process from "node:process";
import { PrismaClient, type Prisma } from "@prisma/client";
import { catalogFamilySeeds, catalogSeriesSeeds } from "../lib/catalog/catalog-seed-data";
import { catalogSpecSeeds } from "../lib/catalog/spec-definitions";
import { selectorRequiredSpecKeys } from "../lib/catalog/status";
import { sortKeyForModel } from "../lib/catalog/model-normalization";
import { readExcelProductRows } from "./catalog-sources/excel-products";
import { pdfCatalogRows } from "./catalog-sources/pdf-catalogs";
import type { ImportedModelRow } from "./catalog-sources/source-types";
import { writeCatalogImportReport } from "./catalog-sources/import-report";

const prisma = new PrismaClient();

function assertNonProductionDatabase() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const label = process.env.DATABASE_BRANCH ?? process.env.NEON_BRANCH ?? process.env.CATALOG_IMPORT_BRANCH ?? "";
  const allowProduction = process.env.ALLOW_PRODUCTION_CATALOG_IMPORT === "true";
  const looksNonProduction = /branch|dev|staging|preview|test|local/i.test(`${databaseUrl} ${label}`);

  console.log(`Catalog import target label: ${label || "not set"}`);

  if (!looksNonProduction && !allowProduction) {
    throw new Error("Refusing catalog import: DATABASE_URL does not look like a non-production database branch. Set CATALOG_IMPORT_BRANCH or use a branch database URL.");
  }
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function mergeRows(rows: ImportedModelRow[]) {
  const byModel = new Map<string, ImportedModelRow>();
  const issues: Array<{ model: string; specKey: string; message: string; rawJson: unknown }> = [];

  for (const row of rows) {
    const existing = byModel.get(row.model);
    if (!existing) {
      byModel.set(row.model, { ...row, specs: [...row.specs], sourceRefs: [...row.sourceRefs] });
      continue;
    }

    existing.rawData = { sources: [existing.rawData, row.rawData] };
    existing.sourceRefs.push(...row.sourceRefs);

    for (const spec of row.specs) {
      const current = existing.specs.find((item) => item.key === spec.key);
      if (!current) {
        existing.specs.push(spec);
        continue;
      }

      const sameNumber = current.valueNumber !== null && spec.valueNumber !== null && current.valueNumber === spec.valueNumber;
      const sameText = (current.valueText ?? current.rawValue) === (spec.valueText ?? spec.rawValue);
      if (sameNumber || sameText) {
        current.confidenceStatus = "PDF_CATALOG_ONLY";
        continue;
      }

      issues.push({
        model: row.model,
        specKey: spec.key,
        message: `Conflicting values for ${row.model}.${spec.key}: ${current.rawValue} vs ${spec.rawValue}`,
        rawJson: { existing: current, incoming: spec },
      });
    }
  }

  return { rows: [...byModel.values()], issues };
}

async function clearCatalogTables() {
  await prisma.importIssue.deleteMany();
  await prisma.productSpecValue.deleteMany();
  await prisma.productSourceReference.deleteMany();
  await prisma.productModel.deleteMany();
  await prisma.productSpecDefinition.deleteMany();
  await prisma.productSeries.deleteMany();
  await prisma.productFamilyTranslation.deleteMany();
  await prisma.productFamily.deleteMany();
}

async function seedFamilies() {
  const familyIds = new Map<string, string>();

  for (const seed of catalogFamilySeeds) {
    const family = await prisma.productFamily.create({
      data: {
        key: seed.key,
        slug: seed.slug,
        sortOrder: seed.sortOrder,
        catalogStatus: "PUBLISHED",
        translations: {
          create: Object.entries(seed.translations).map(([locale, translation]) => ({
            locale,
            ...translation,
          })),
        },
      },
    });

    familyIds.set(seed.key, family.id);
  }

  return familyIds;
}

async function seedSeries(familyIds: Map<string, string>) {
  const seriesIds = new Map<string, string>();

  for (const seed of catalogSeriesSeeds) {
    const familyId = familyIds.get(seed.familyKey);
    if (!familyId) throw new Error(`Missing family for ${seed.familyKey}`);

    const series = await prisma.productSeries.create({
      data: {
        familyId,
        code: seed.code,
        slug: seed.slug,
        name: seed.name,
        sortOrder: seed.sortOrder,
        selectorEligible: seed.selectorEligible,
        selectorDefaultStatus: seed.selectorEligible ? "INCOMPLETE" : "NOT_APPLICABLE",
        catalogStatus: "PUBLISHED",
        overview: seed.overview,
        workingPrinciple: seed.workingPrinciple,
        constructionNotes: seed.constructionNotes,
        materialNotes: seed.materialNotes,
        applicationNotes: seed.applicationNotes,
        featureNotes: seed.featureNotes,
        sourceSummary: seed.sourceSummary,
      },
    });

    seriesIds.set(seed.code, series.id);
  }

  return seriesIds;
}

async function seedSpecDefinitions(familyIds: Map<string, string>, seriesIds: Map<string, string>) {
  const specIds = new Map<string, string>();

  for (const spec of catalogSpecSeeds) {
    const targetSeriesCodes = spec.seriesCodes?.length ? spec.seriesCodes : [null];

    for (const seriesCode of targetSeriesCodes) {
      const seriesId = seriesCode ? seriesIds.get(seriesCode) : null;
      const familyId = !seriesCode && catalogFamilySeeds[0] ? familyIds.get(catalogFamilySeeds[0].key) : null;
      const created = await prisma.productSpecDefinition.create({
        data: {
          key: spec.key,
          labelEn: spec.labelEn,
          labelZh: spec.labelZh,
          unit: spec.unit,
          dataType: spec.dataType,
          familyId: familyId ?? undefined,
          seriesId: seriesId ?? undefined,
          filterable: spec.filterable,
          comparable: spec.comparable,
          requiredForSelector: spec.requiredForSelector ?? false,
          sortOrder: spec.sortOrder,
        },
      });

      specIds.set(`${seriesCode ?? "GLOBAL"}:${spec.key}`, created.id);
    }
  }

  return specIds;
}

function selectorStatusFor(row: ImportedModelRow) {
  if (!row.selectorEligible) return "NOT_APPLICABLE" as const;

  const present = new Set(row.specs.filter((spec) => spec.valueNumber !== null || spec.valueText).map((spec) => spec.key));
  const ready = selectorRequiredSpecKeys.every((key) => present.has(key));
  return ready ? "READY" as const : "INCOMPLETE" as const;
}

async function createModels(rows: ImportedModelRow[], seriesIds: Map<string, string>, specIds: Map<string, string>) {
  for (const row of rows) {
    const seriesId = seriesIds.get(row.seriesCode);
    if (!seriesId) continue;

    const model = await prisma.productModel.create({
      data: {
        seriesId,
        rawModel: row.rawModel,
        model: row.model,
        sortKey: sortKeyForModel(row.model),
        catalogStatus: "PUBLISHED",
        selectorEligible: row.selectorEligible,
        selectorStatus: selectorStatusFor(row),
        primaryImageUrl: row.primaryImageUrl ?? null,
        rawDataJson: toJson(row.rawData),
      },
    });

    const sourceRefs = [];
    for (const ref of row.sourceRefs) {
      sourceRefs.push(await prisma.productSourceReference.create({
        data: {
          seriesId,
          modelId: model.id,
          sourceType: ref.sourceType,
          sourcePath: ref.sourcePath,
          sourceTitle: ref.sourceTitle,
          language: ref.language,
          pageNumber: ref.pageNumber,
          sectionTitle: ref.sectionTitle,
          rawText: ref.rawText,
          extractionMethod: ref.extractionMethod,
          confidenceStatus: ref.confidenceStatus,
        },
      }));
    }

    for (const spec of row.specs) {
      const specDefinitionId = specIds.get(`${row.seriesCode}:${spec.key}`) ?? specIds.get(`GLOBAL:${spec.key}`);
      if (!specDefinitionId) continue;

      await prisma.productSpecValue.create({
        data: {
          modelId: model.id,
          specDefinitionId,
          valueNumber: spec.valueNumber === null ? undefined : spec.valueNumber.toFixed(6),
          valueText: spec.valueText,
          rawValue: spec.rawValue,
          sourceRefId: sourceRefs[0]?.id,
          confidenceStatus: spec.confidenceStatus,
        },
      });
    }
  }
}

async function main() {
  assertNonProductionDatabase();
  const excelRows = readExcelProductRows();
  const { rows, issues } = mergeRows([...pdfCatalogRows, ...excelRows]);

  await clearCatalogTables();
  const familyIds = await seedFamilies();
  const seriesIds = await seedSeries(familyIds);
  const specIds = await seedSpecDefinitions(familyIds, seriesIds);
  await createModels(rows, seriesIds, specIds);

  for (const issue of issues) {
    const model = await prisma.productModel.findUnique({ where: { model: issue.model } });
    await prisma.importIssue.create({
      data: {
        severity: "WARNING",
        issueType: "SPEC_CONFLICT",
        modelId: model?.id,
        specKey: issue.specKey,
        message: issue.message,
        rawJson: toJson(issue.rawJson),
      },
    });
  }

  const models = await prisma.productModel.findMany({ include: { series: true, specValues: true, sourceReferences: true } });
  const modelsBySeries = Object.fromEntries(
    [...new Set(models.map((model) => model.series.code))].map((code) => [code, models.filter((model) => model.series.code === code).length]),
  );

  await writeCatalogImportReport({
    familyCount: await prisma.productFamily.count(),
    seriesCount: await prisma.productSeries.count(),
    modelCount: models.length,
    modelsBySeries,
    selectorEligibleCount: models.filter((model) => model.selectorEligible).length,
    selectorReadyCount: models.filter((model) => model.selectorStatus === "READY").length,
    selectorIncompleteCount: models.filter((model) => model.selectorStatus === "INCOMPLETE").length,
    selectorConflictCount: models.filter((model) => model.selectorStatus === "CONFLICT").length,
    pdfOnlyAbsorberModels: models.filter((model) => model.selectorEligible && model.sourceReferences.some((ref) => ref.sourceType === "PDF_ENGLISH") && !model.sourceReferences.some((ref) => ref.sourceType === "EXCEL_SELECTOR")).map((model) => model.model),
    excelOnlyAbsorberModels: models.filter((model) => model.selectorEligible && model.sourceReferences.some((ref) => ref.sourceType === "EXCEL_SELECTOR") && !model.sourceReferences.some((ref) => ref.sourceType === "PDF_ENGLISH")).map((model) => model.model),
    modelsWithoutSourceRefs: models.filter((model) => model.sourceReferences.length === 0).map((model) => model.model),
    modelsWithoutSpecs: models.filter((model) => model.specValues.length === 0).map((model) => model.model),
    unresolvedIssueCount: await prisma.importIssue.count(),
  });

  console.log(`Imported ${models.length} catalog models.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
