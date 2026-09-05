import test from "node:test";
import assert from "node:assert/strict";
import { approvedProject, poolerHost, validateRuntimeEnvironment } from "./with-supabase.mjs";

const fixture = () => ({ SUPABASE_PROJECT_REF: approvedProject,
  DATABASE_URL: `postgresql://vibro_runtime.${approvedProject}:test-only-secret@${poolerHost}:6543/postgres?pgbouncer=true&sslmode=require&sslaccept=strict`,
  DIRECT_URL: `postgresql://vibro_runtime.${approvedProject}:test-only-secret@${poolerHost}:5432/postgres?sslmode=require&sslaccept=strict` });

test("accepts only the approved Frankfurt runtime role", () => {
  assert.equal(validateRuntimeEnvironment(fixture()).role, "vibro_runtime");
  for (const change of [
    v => { v.SUPABASE_PROJECT_REF = "another-project"; },
    v => { v.DATABASE_URL = v.DATABASE_URL.replace("vibro_runtime.", "postgres."); },
    v => { v.DIRECT_URL = v.DIRECT_URL.replace(poolerHost, "example.com"); },
    v => { v.DATABASE_URL = v.DATABASE_URL.replace("sslaccept=strict", "sslaccept=accept_invalid_certs"); },
    v => { v.DATABASE_URL = v.DATABASE_URL.replace("6543", "5432"); },
    v => { delete v.DIRECT_URL; },
  ]) { const values = fixture(); change(values); assert.throws(() => validateRuntimeEnvironment(values)); }
});

test("errors do not print connection strings or passwords", () => {
  const values = fixture(); values.DATABASE_URL = "postgresql://private-password@invalid:badport";
  assert.throws(() => validateRuntimeEnvironment(values), error => !error.message.includes("private-password") && !error.message.includes("postgresql://"));
});
