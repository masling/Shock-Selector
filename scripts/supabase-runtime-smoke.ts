import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { findCatalogFamilies, findCatalogSeriesBySlug, getCatalogModelCount, listCatalogThreadSizes } from "../lib/catalog/catalog-repository";
import { catalogModelSearchService } from "../lib/catalog/catalog-service";
import { linearFreeHorizontalCalculator } from "../lib/calculators/linear-free-horizontal";
import { createEngineerSelectionLog } from "../lib/selection-logs/selection-log-repository";
import type { CalculateResponse } from "../lib/calculators/types";

async function main() {
  const [identity] = await prisma.$queryRaw<Array<{ role: string; database: string }>>`SELECT current_user::text AS role, current_database()::text AS database`;
  assert.equal(identity.role, "vibro_runtime");
  assert.equal(identity.database, "postgres");
  const families = await findCatalogFamilies("en");
  const count = await getCatalogModelCount();
  assert.ok(count > 0 && families.length > 0);
  const search = await catalogModelSearchService({ locale: "en", modelQuery: "EK", minStrokeMm: 25, pageSize: 10 });
  assert.ok(search.items.length > 0);
  assert.ok(search.items.every(item => item.catalogStatus === "PUBLISHED"));
  const first = search.items[0];
  assert.ok(await findCatalogSeriesBySlug(first.familySlug, first.seriesSlug));
  const threads = await listCatalogThreadSizes();
  assert.ok(threads.length > 0);

  const calculator = linearFreeHorizontalCalculator;
  const normalizedInput = calculator.validateInput({ absorberCount: 2, cyclesPerHour: 200, impactObjectWeightKg: 1800, speedMs: 1.5 });
  const calculation = calculator.calculate(normalizedInput);
  const filter = calculator.buildFilter(calculation);
  const matches = await catalogModelSearchService({ ...filter, locale: "en", selectorOnly: true });
  const result: CalculateResponse = { variantKey: calculator.key, familyKey: calculator.familyKey, normalizedInput, calculation, filter, matches, explanations: [] };
  const rollback = new Error("rollback_runtime_smoke");
  await assert.rejects(prisma.$transaction(async tx => {
    const inserted = await createEngineerSelectionLog(result, tx);
    assert.equal(inserted.count, 1);
    throw rollback;
  }, { timeout: 20000, maxWait: 10000 }), error => error === rollback);

  const [rights] = await prisma.$queryRaw<Array<{ canReadLogs: boolean; canWriteCatalog: boolean; canCreateTables: boolean; bypassRls: boolean }>>`
    SELECT has_table_privilege(current_user, 'public."SelectionLog"', 'SELECT') AS "canReadLogs",
      has_table_privilege(current_user, 'public."ProductModel"', 'INSERT, UPDATE, DELETE') AS "canWriteCatalog",
      has_schema_privilege(current_user, 'public', 'CREATE') AS "canCreateTables",
      (SELECT rolbypassrls FROM pg_roles WHERE rolname=current_user) AS "bypassRls"`;
  assert.deepEqual(rights, { canReadLogs: false, canWriteCatalog: false, canCreateTables: false, bypassRls: false });
  console.log(JSON.stringify({ runtimeRole: identity.role, publishedModels: count, families: families.length, filteredMatches: search.total, threadSizes: threads.length, calculator: calculator.key, requiredEnergyPerCycleNm: calculation.requiredEnergyPerCycleNm, selectionLogInsert: "passed and rolled back", rights }, null, 2));
}

main().catch(error => {
  // Prisma diagnostics can include request context. Keep connection credentials
  // and data out of the terminal; report only a code or assertion category.
  console.error("Runtime smoke failed:", typeof error.code === "string" ? error.code : error.name);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
