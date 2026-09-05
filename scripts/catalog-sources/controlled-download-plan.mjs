import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const formats = {
  PDF: { extension: "pdf", contentType: "application/pdf" },
  DWG: { extension: "dwg", contentType: "application/acad" },
  STEP: { extension: "step", contentType: "model/step" },
};

export function approvedDownloadPlan(registry) {
  if (registry?.schemaVersion !== 1 || !Array.isArray(registry.decisions)) throw new Error("Invalid controlled-download registry");
  return registry.decisions.filter((item) => item.publicationAllowed === true).map((item) => {
    const format = formats[item.format];
    if (!format || !/^[a-f0-9]{64}$/.test(item.sha256) || !Number.isSafeInteger(item.byteSize) || item.byteSize <= 0) {
      throw new Error(`Invalid approved decision: ${item.id}`);
    }
    if (item.reviewStatus !== "approved_private_download") throw new Error(`Approved decision lacks final review: ${item.id}`);
    return {
      decisionId: item.id,
      model: item.model,
      modelId: item.modelId,
      title: `${item.model} ${item.format} technical drawing`,
      filename: `${item.model}.${format.extension}`,
      format: item.format,
      sourcePath: item.sourcePath,
      sha256: item.sha256,
      byteSize: item.byteSize,
      bucketId: "ekd-model-files",
      objectKey: `${item.sha256}.${format.extension}`,
      contentType: format.contentType,
    };
  });
}

export function verifyPlannedFile(assetRoot, item) {
  const root = fs.realpathSync(assetRoot);
  const file = fs.realpathSync(path.join(root, item.sourcePath));
  const relative = path.relative(root, file);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error("Controlled download source escaped the approved root");
  const data = fs.readFileSync(file);
  const sha256 = createHash("sha256").update(data).digest("hex");
  if (data.length !== item.byteSize || sha256 !== item.sha256) throw new Error(`Controlled download source changed: ${item.decisionId}`);
  return { ...item, file, data };
}
