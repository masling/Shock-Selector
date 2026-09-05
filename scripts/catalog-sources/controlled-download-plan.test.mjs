import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { approvedDownloadPlan, verifyPlannedFile } from "./controlled-download-plan.mjs";

const decision = (overrides = {}) => ({
  id: "test-pdf", model: "EK42x50", modelId: "model-1", format: "PDF",
  sourcePath: "PDF/EK42x50.pdf", sha256: "a".repeat(64), byteSize: 10,
  reviewStatus: "verified_candidate", publicationAllowed: false, ...overrides,
});

test("only explicit final approvals enter the upload plan", () => {
  assert.deepEqual(approvedDownloadPlan({ schemaVersion: 1, decisions: [decision()] }), []);
  assert.throws(() => approvedDownloadPlan({ schemaVersion: 1, decisions: [decision({ publicationAllowed: true })] }), /lacks final review/);
  const plan = approvedDownloadPlan({ schemaVersion: 1, decisions: [decision({ publicationAllowed: true, reviewStatus: "approved_private_download" })] });
  assert.equal(plan[0].bucketId, "ekd-model-files");
  assert.equal(plan[0].objectKey, `${"a".repeat(64)}.pdf`);
});

test("file verification rejects content drift", (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ekd-download-plan-"));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "PDF"));
  const file = path.join(root, "PDF", "EK42x50.pdf");
  const data = Buffer.from("test-only");
  fs.writeFileSync(file, data);
  const item = approvedDownloadPlan({ schemaVersion: 1, decisions: [decision({
    publicationAllowed: true,
    reviewStatus: "approved_private_download",
    sha256: createHash("sha256").update(data).digest("hex"),
    byteSize: data.length,
  })] })[0];
  assert.equal(verifyPlannedFile(root, item).data.equals(data), true);
  fs.writeFileSync(file, "changed");
  assert.throws(() => verifyPlannedFile(root, item), /source changed/);
});
