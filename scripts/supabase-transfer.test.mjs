import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { sourceIdentity, targetProjectId, tableOrder, validateSnapshot, buildTransferSql, verificationSql } from "./supabase-transfer.mjs";

function snapshot(payload = '[{"id":"test","valueNumber":999999999999.123456}]') {
  return { version: 1, source: { ...sourceIdentity }, target: { provider: "supabase", projectId: targetProjectId }, tables: tableOrder.map((table_name, i) => {
    const payload_json = i === 0 ? payload : "[]";
    return { table_name, payload_json, row_count: JSON.parse(payload_json).length, payload_bytes: Buffer.byteLength(payload_json), payload_md5: createHash("md5").update(payload_json).digest("hex") };
  }) };
}

test("keeps decimal source bytes unchanged and enforces atomic empty-or-exact-match copy", () => {
  const sql = buildTransferSql(snapshot(), targetProjectId);
  assert.ok(sql.includes("999999999999.123456"));
  assert.ok(sql.includes("LOCK TABLE"));
  assert.ok(sql.includes("Snapshot already matches; no changes"));
  assert.ok(sql.includes("refusing overwrite"));
  assert.ok(sql.includes("Post-copy row count or content hash mismatch"));
  assert.doesNotMatch(sql, /ON CONFLICT|TRUNCATE TABLE|DELETE FROM|DROP TABLE/i);
});

test("escapes SQL-looking payloads as data", () => {
  const sql = buildTransferSql(snapshot(JSON.stringify([{ id: "test", text: "it's a file'); SELECT 1; -- \\path" }])), targetProjectId);
  assert.ok(sql.includes("it''s a file''); SELECT 1; --"));
  assert.ok(sql.includes("SET standard_conforming_strings = on"));
});

test("rejects old branch, wrong target, duplicate tables and changed payload", () => {
  const source = snapshot(); source.source.branchId = "catalog-rebuild";
  assert.throws(() => validateSnapshot(source, targetProjectId), /source/);
  assert.throws(() => validateSnapshot(snapshot(), "jjgfppzujzljqonfxgzv"), /Target/);
  const duplicate = snapshot(); duplicate.tables[1] = duplicate.tables[0];
  assert.throws(() => validateSnapshot(duplicate, targetProjectId), /Duplicate/);
  const tampered = snapshot(); tampered.tables[0].payload_json = '[{"id":"changed"}]';
  assert.throws(() => validateSnapshot(tampered, targetProjectId), /integrity/);
});

test("verification covers all 11 tables in stable C ordering", () => {
  const sql = verificationSql();
  assert.equal((sql.match(/AS table_name/g) ?? []).length, 11);
  assert.equal((sql.match(/COLLATE "C"/g) ?? []).length, 11);
});
