// @ts-nocheck
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

// The retained legacy Prisma migrations describe Product/Asset, not the current
// ProductModel catalog. Supabase migrations are now the target's schema history.
// Stop destructive/drift reconciliation before loading any database credentials.
const migrationCommandIndex = process.argv.indexOf("migrate");
const migrationCommand = process.argv[migrationCommandIndex + 1];
if (
  migrationCommandIndex >= 0
  && ["dev", "deploy", "reset", "resolve"].includes(migrationCommand)
  && !process.argv.includes("--help")
  && !process.argv.includes("-h")
) {
  throw new Error("Legacy Prisma migrations are incompatible with the current catalog. Use the reviewed supabase/migrations history; see docs/implementation/product-import-mapping-2026-09-04.md. No database changes were attempted.");
}

const envPath = path.join(process.cwd(), ".env");

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");

  for (const rawLine of envFile.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) {
      continue;
    }

    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

export default defineConfig({
  schema: "schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
