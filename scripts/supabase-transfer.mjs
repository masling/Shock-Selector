import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

export const sourceIdentity = Object.freeze({ provider: "neon", projectId: "cold-shape-40010361", branchId: "br-old-cloud-aom4g061", database: "shock_selector" });
export const targetProjectId = "nvfbyhprwiyigdcqgjtd";
export const tableOrder = Object.freeze(["ProductFamily", "ProductFamilyTranslation", "ProductSeries", "ProductModel", "ProductSpecDefinition", "ProductSourceReference", "ProductSpecValue", "ImportIssue", "ScenarioFamily", "Scenario", "SelectionLog"]);

const identifier = name => `public."${name}"`;
const literal = value => `'${value.replaceAll("'", "''")}'`;
const payload = name => `(SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.id COLLATE "C"), '[]'::jsonb)::text FROM ${identifier(name)} t)`;

export function validateSnapshot(snapshot, expectedTarget) {
  if (expectedTarget !== targetProjectId || snapshot.target?.projectId !== expectedTarget || snapshot.target?.provider !== "supabase") throw new Error("Target project does not match the approved Frankfurt project");
  for (const [key, value] of Object.entries(sourceIdentity)) {
    if (snapshot.source?.[key] !== value) throw new Error(`Unexpected source ${key}`);
  }
  if (snapshot.version !== 1 || !Array.isArray(snapshot.tables) || snapshot.tables.length !== tableOrder.length) throw new Error("Incomplete snapshot");
  if (new Set(snapshot.tables.map(t => t.table_name)).size !== tableOrder.length) throw new Error("Duplicate snapshot table");
  return tableOrder.map(name => {
    const table = snapshot.tables.find(t => t.table_name === name);
    if (!table || typeof table.payload_json !== "string" || !Number.isSafeInteger(table.row_count) || table.row_count < 0) throw new Error(`Invalid table snapshot: ${name}`);
    const rows = JSON.parse(table.payload_json); // Validation only. Never reserialize numeric values.
    if (!Array.isArray(rows) || rows.length !== table.row_count || rows.some(row => !row || typeof row !== "object" || Array.isArray(row) || typeof row.id !== "string")) throw new Error(`Invalid rows: ${name}`);
    if (new Set(rows.map(row => row.id)).size !== rows.length) throw new Error(`Duplicate row IDs: ${name}`);
    if (Buffer.byteLength(table.payload_json) !== table.payload_bytes || createHash("md5").update(table.payload_json).digest("hex") !== table.payload_md5) throw new Error(`Snapshot integrity check failed: ${name}`);
    return table;
  });
}

export function buildTransferSql(snapshot, expectedTarget) {
  const tables = validateSnapshot(snapshot, expectedTarget);
  const tag = `$transfer_${randomUUID().replaceAll("-", "")}$`;
  if (tables.some(table => table.payload_json.includes(tag))) throw new Error("Unexpected SQL delimiter in source data");
  const empty = tables.map(t => `NOT EXISTS (SELECT 1 FROM ${identifier(t.table_name)})`).join(" AND\n    ");
  const matches = tables.map(t => `((SELECT count(*) FROM ${identifier(t.table_name)}) = ${t.row_count} AND md5(${payload(t.table_name)}) = ${literal(t.payload_md5)})`).join(" AND\n    ");
  const inserts = tables.filter(t => t.row_count > 0).map(t => `  INSERT INTO ${identifier(t.table_name)} SELECT * FROM jsonb_populate_recordset(NULL::${identifier(t.table_name)}, ${literal(t.payload_json)}::jsonb);`).join("\n");
  // One DO statement is atomic; the lock prevents concurrent edits between
  // preflight and verification. Existing divergent rows are never overwritten.
  return `-- Approved target only: ${expectedTarget}. This file contains private data; never commit it.\nSET standard_conforming_strings = on;\nDO ${tag}\nBEGIN\n  LOCK TABLE ${tables.map(t => identifier(t.table_name)).join(", ")} IN SHARE ROW EXCLUSIVE MODE;\n  IF ${matches} THEN\n    RAISE NOTICE 'Snapshot already matches; no changes';\n    RETURN;\n  END IF;\n  IF NOT (${empty}) THEN\n    RAISE EXCEPTION 'Target is not empty and differs from snapshot; refusing overwrite';\n  END IF;\n${inserts}\n  IF NOT (${matches}) THEN\n    RAISE EXCEPTION 'Post-copy row count or content hash mismatch';\n  END IF;\nEND;\n${tag};\n`;
}

export function verificationSql() {
  return tableOrder.map(name => `SELECT ${literal(name)} AS table_name, (SELECT count(*) FROM ${identifier(name)}) AS row_count, md5(${payload(name)}) AS payload_md5`).join("\nUNION ALL\n") + ";\n";
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log("node scripts/supabase-transfer.mjs --snapshot <source-export.json> --target-ref <approved-project-ref>\nOffline only: verifies the snapshot and creates private copy/verification SQL beside it. Never connects to a database.");
    return;
  }
  const options = new Map();
  for (let i = 0; i < args.length; i += 2) {
    if (!["--snapshot", "--target-ref"].includes(args[i]) || !args[i + 1] || options.has(args[i])) throw new Error("Invalid arguments; use --help");
    options.set(args[i], args[i + 1]);
  }
  if (!options.has("--snapshot") || !options.has("--target-ref")) throw new Error("Snapshot and explicit target ref are required");
  const snapshotPath = fs.realpathSync(path.resolve(options.get("--snapshot")));
  const stagingRoot = fs.realpathSync(path.resolve("data/staging"));
  const relative = path.relative(stagingRoot, snapshotPath);
  if (relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) throw new Error("Snapshot must be inside the ignored data/staging directory");
  const snapshotText = fs.readFileSync(snapshotPath, "utf8");
  const snapshot = JSON.parse(snapshotText);
  const sql = buildTransferSql(snapshot, options.get("--target-ref"));
  const output = path.join(path.dirname(snapshotPath), `transfer-${randomUUID().slice(0, 8)}`);
  fs.mkdirSync(output, { mode: 0o700 });
  fs.writeFileSync(path.join(output, "copy.sql"), sql, { flag: "wx", mode: 0o600 });
  fs.writeFileSync(path.join(output, "verify.sql"), verificationSql(), { flag: "wx", mode: 0o600 });
  console.log(JSON.stringify({ output, sourceSha256: createHash("sha256").update(snapshotText).digest("hex"), targetProjectId, tableCount: tableOrder.length, rows: snapshot.tables.reduce((sum, table) => sum + table.row_count, 0), databaseMutations: 0 }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
