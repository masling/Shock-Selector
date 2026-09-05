import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { buildProductImportPlan, type CatalogSnapshot } from "./catalog-sources/product-import-plan";

// Local dry run only: no .env, Prisma client, SQL execution, or publishing.
async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) { console.log("tsx scripts/prepare-product-import.ts --batch <staging batch> --snapshot <read-only catalog snapshot JSON>"); return; }
  const options = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    if (!["--batch", "--snapshot"].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith("--")) throw new Error("Invalid arguments; use --help");
    options.set(args[i], args[i + 1]);
  }
  if (!options.has("--batch") || !options.has("--snapshot")) throw new Error("Both --batch and --snapshot are required");
  const batch = await fs.realpath(path.resolve(options.get("--batch")!));
  const snapshotPath = await fs.realpath(path.resolve(options.get("--snapshot")!));
  const source = await fs.readFile(path.join(batch, "product-staging.json"), "utf8");
  const rows: unknown = JSON.parse(source);
  if (!Array.isArray(rows)) throw new Error("Source must be an array of product rows");
  const snapshot: CatalogSnapshot = JSON.parse(await fs.readFile(snapshotPath, "utf8"));
  if (!Array.isArray(snapshot.models) || !Array.isArray(snapshot.series) || !Array.isArray(snapshot.specDefinitions) || !snapshot.branchId) throw new Error("Catalog snapshot is incomplete");
  const result = buildProductImportPlan(rows, snapshot);
  const generatedAt = new Date().toISOString();
  const output = path.resolve("data/staging", `import-plan-${generatedAt.replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`);
  await fs.mkdir(output, { recursive: true, mode: 0o700 });
  const document = { ...result, generatedAt, sourceBatch: batch, sourceProductsSha256: createHash("sha256").update(source).digest("hex"), sourceSnapshot: snapshotPath };
  await fs.writeFile(path.join(output, "import-plan.json"), `${JSON.stringify(document, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  await fs.writeFile(path.join(output, "field-definitions.json"), `${JSON.stringify(result.fieldDefinitions, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  console.log(JSON.stringify({ output, ...result.summary, duplicateExistingIdentities: result.duplicateExistingIdentities, databaseMutations: 0 }, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
