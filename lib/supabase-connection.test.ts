import test from "node:test";
import assert from "node:assert/strict";
import { supabasePoolConfig } from "./supabase-connection";

test("legacy connections remain unchanged until the Supabase target is explicitly selected", () => {
  const legacy = "postgresql://test:example@localhost:5432/test";
  assert.equal(supabasePoolConfig(legacy, undefined), undefined);
});

test("Supabase connections use the official CA with strict verification", () => {
  const input = "postgresql://vibro_runtime.nvfbyhprwiyigdcqgjtd:test-only@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&sslaccept=strict";
  const config = supabasePoolConfig(input, "nvfbyhprwiyigdcqgjtd")!;
  assert.ok(config.ssl && typeof config.ssl === "object");
  assert.equal(config.ssl.rejectUnauthorized, true);
  assert.equal(config.ssl.servername, "aws-0-eu-central-1.pooler.supabase.com");
  assert.match(String(config.ssl.ca), /BEGIN CERTIFICATE/);
  assert.equal(new URL(config.connectionString!).searchParams.has("sslmode"), false);
  assert.equal(new URL(config.connectionString!).searchParams.has("pgbouncer"), false);
  assert.throws(() => supabasePoolConfig(input, "wrong-project"));
  assert.throws(() => supabasePoolConfig(input.replace("vibro_runtime.", "postgres."), "nvfbyhprwiyigdcqgjtd"));
});
