import test from "node:test";
import assert from "node:assert/strict";
import { validateStorageEnvironment } from "./with-storage.mjs";

const fixture = () => ({
  SUPABASE_PROJECT_REF: "nvfbyhprwiyigdcqgjtd",
  NEXT_PUBLIC_SUPABASE_URL: "https://nvfbyhprwiyigdcqgjtd.supabase.co",
  SUPABASE_SECRET_KEY: `sb_secret_${"x".repeat(32)}`,
  ENGINEERING_ASSET_ROOT: "/test/engineering",
});

test("storage config is pinned to the non-production Frankfurt project", () => {
  assert.equal(validateStorageEnvironment(fixture()).projectRef, "nvfbyhprwiyigdcqgjtd");
  for (const change of [
    (values) => { values.SUPABASE_PROJECT_REF = "other"; },
    (values) => { values.NEXT_PUBLIC_SUPABASE_URL = "https://other.supabase.co"; },
    (values) => { values.SUPABASE_SECRET_KEY = "legacy-or-missing"; },
    (values) => { values.ENGINEERING_ASSET_ROOT = "relative/path"; },
  ]) { const values = fixture(); change(values); assert.throws(() => validateStorageEnvironment(values)); }
});
