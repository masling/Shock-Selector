import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const registry = JSON.parse(fs.readFileSync(new URL("./download-decisions.json", import.meta.url), "utf8"));

test("controlled download decisions fail closed", () => {
  assert.equal(registry.schemaVersion, 1);
  assert.equal(new Set(registry.decisions.map((item) => item.id)).size, registry.decisions.length);
  for (const item of registry.decisions) {
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.equal(Number.isSafeInteger(item.byteSize) && item.byteSize > 0, true);
    if (item.publicationAllowed) {
      assert.equal(item.reviewStatus, "approved_private_download");
      assert.equal(item.verification.some((entry) => entry.startsWith("user_authorized_private_upload_")), true);
    }
  }
});

test("pending and rejected assets remain blocked", () => {
  const blocked = registry.decisions.filter((item) => item.reviewStatus !== "approved_private_download");
  assert.equal(blocked.length > 0, true);
  assert.equal(blocked.every((item) => item.publicationAllowed === false), true);
});

test("EK42x50 STEP mismatch cannot be mistaken for an approved download", () => {
  const step = registry.decisions.find((item) => item.id === "2026-09-05-ek42x50-step");
  assert.equal(step.reviewStatus, "rejected_internal_identity_mismatch");
  assert.equal(step.verification.some((item) => item.includes("OEMXT_1.5M_X_2")), true);
  assert.equal(step.publicationAllowed, false);
});
