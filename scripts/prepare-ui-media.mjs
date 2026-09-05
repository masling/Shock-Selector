import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { modelKey } from "./catalog-sources/asset-remarks.mjs";

const sourceRoot = process.argv[2];
const batchFile = process.argv[3];
if (!sourceRoot || !batchFile) throw new Error("Usage: node scripts/prepare-ui-media.mjs <engineering root> <product-staging.json>");
const root = fs.realpathSync(sourceRoot);
const rows = JSON.parse(fs.readFileSync(batchFile, "utf8"));
const output = path.resolve("data/staging/ui-media");
fs.mkdirSync(output, { recursive: true, mode: 0o700 });
const manifest = {};
for (const row of rows) {
  const image = row.representativeImage;
  const relative = image?.selectedCandidate ?? (image?.candidates?.length === 1 ? image.candidates[0] : null);
  if (!relative) continue;
  const file = fs.realpathSync(path.join(root, relative));
  if (!file.startsWith(root + path.sep)) throw new Error("Image path is outside source root");
  const bytes = fs.readFileSync(file);
  const digest = createHash("sha256").update(bytes).digest("hex");
  const filename = `${digest}${path.extname(file).toLowerCase()}`;
  const target = path.join(output, filename);
  if (!fs.existsSync(target)) { fs.copyFileSync(file, target, fs.constants.COPYFILE_EXCL); fs.chmodSync(target, 0o600); }
  manifest[modelKey(row.model)] = { file: filename, source: relative, sha256: digest, approval: image.approvalStatus, previewOnly: true };
}
fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", { mode: 0o600 });
console.log(JSON.stringify({ output, modelMappings: Object.keys(manifest).length, publicationApproved: false }));
