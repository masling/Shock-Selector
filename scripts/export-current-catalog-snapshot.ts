import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

async function main() {
  const [models, series, specDefinitions] = await Promise.all([
    prisma.productModel.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true, model: true, rawModel: true, seriesId: true, catalogStatus: true,
        selectorStatus: true, selectorEligible: true, isActive: true,
        series: { select: { code: true } },
        specValues: {
          orderBy: { specDefinitionId: "asc" },
          select: {
            valueNumber: true, valueText: true, valueJson: true, rawValue: true,
            specDefinition: { select: { key: true, unit: true } },
          },
        },
      },
    }),
    prisma.productSeries.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true, code: true, slug: true, familyId: true, selectorEligible: true,
        family: { select: { key: true } },
      },
    }),
    prisma.productSpecDefinition.findMany({
      orderBy: { id: "asc" },
      select: { id: true, key: true, unit: true, dataType: true, familyId: true, seriesId: true },
    }),
  ]);

  const snapshot = {
    branchId: `supabase:${process.env.SUPABASE_PROJECT_REF}`,
    branchName: "main",
    database: "postgres",
    retrievedAt: new Date().toISOString(),
    models: models.map((item) => ({
      id: item.id,
      model: item.model,
      rawModel: item.rawModel,
      seriesId: item.seriesId,
      seriesCode: item.series.code,
      catalogStatus: item.catalogStatus,
      selectorStatus: item.selectorStatus,
      selectorEligible: item.selectorEligible,
      isActive: item.isActive,
      specs: item.specValues.map((value) => ({
        key: value.specDefinition.key,
        unit: value.specDefinition.unit,
        valueNumber: value.valueNumber?.toString() ?? null,
        valueText: value.valueText,
        valueJson: value.valueJson,
        rawValue: value.rawValue,
      })),
    })),
    series: series.map((item) => ({
      id: item.id, code: item.code, slug: item.slug, familyId: item.familyId,
      familyKey: item.family.key, selectorEligible: item.selectorEligible,
    })),
    specDefinitions,
  };

  const outputDir = path.resolve("data/staging/db-snapshots");
  await fs.mkdir(outputDir, { recursive: true, mode: 0o700 });
  const output = path.join(outputDir, `supabase-${snapshot.retrievedAt.replace(/[:.]/g, "")}.json`);
  await fs.writeFile(output, `${JSON.stringify(snapshot, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  console.log(JSON.stringify({ output, models: models.length, series: series.length, specDefinitions: specDefinitions.length, databaseMutations: 0 }));
}

main().finally(() => prisma.$disconnect()).catch((error) => {
  console.error(error instanceof Error ? error.message : "Catalog snapshot failed");
  process.exitCode = 1;
});
