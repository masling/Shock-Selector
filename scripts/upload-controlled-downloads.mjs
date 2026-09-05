import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { approvedDownloadPlan, verifyPlannedFile } from "./catalog-sources/controlled-download-plan.mjs";

const registry = JSON.parse(fs.readFileSync(new URL("./catalog-sources/download-decisions.json", import.meta.url), "utf8"));
const plan = approvedDownloadPlan(registry).map((item) => verifyPlannedFile(process.env.ENGINEERING_ASSET_ROOT, item));
if (!plan.length) throw new Error("No controlled downloads have final publication approval");

if (process.env.CONTROLLED_DOWNLOAD_APPLY !== "true") {
  console.log(JSON.stringify({ mode: "plan", files: plan.map(({ data, file, ...item }) => item), uploaded: false }, null, 2));
  process.exit(0);
}

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const bucketId = "ekd-model-files";
const bucket = await client.storage.getBucket(bucketId);
if (bucket.error) {
  const created = await client.storage.createBucket(bucketId, {
    public: false,
    fileSizeLimit: 26214400,
    allowedMimeTypes: ["application/pdf", "application/acad", "application/x-autocad", "application/dwg", "application/octet-stream", "model/step", "application/step"],
  });
  if (created.error) throw new Error(`Could not create private download bucket: ${created.error.name}`);
} else if (bucket.data.public) {
  throw new Error("Controlled download bucket exists but is public");
}

const results = [];
for (const { data, file, ...item } of plan) {
  const existing = await client.from("CatalogDownload").select("id,modelId,format,sha256,bucketId,objectKey,approved").eq("objectKey", item.objectKey).maybeSingle();
  if (existing.error) throw new Error(`Could not inspect download metadata: ${existing.error.code}`);
  if (existing.data) {
    if (existing.data.modelId !== item.modelId || existing.data.format !== item.format || existing.data.sha256 !== item.sha256 || !existing.data.approved) {
      throw new Error(`Existing metadata conflicts with ${item.decisionId}`);
    }
    results.push({ decisionId: item.decisionId, status: "already_present", metadataId: existing.data.id });
    continue;
  }
  const uploaded = await client.storage.from(bucketId).upload(item.objectKey, data, { contentType: item.contentType, cacheControl: "3600", upsert: false });
  if (uploaded.error) throw new Error(`Could not upload ${item.decisionId}: ${uploaded.error.name}`);
  const inserted = await client.from("CatalogDownload").insert({
    modelId: item.modelId, title: item.title, filename: item.filename, format: item.format,
    byteSize: item.byteSize, sha256: item.sha256, bucketId, objectKey: item.objectKey, approved: true,
  }).select("id").single();
  if (inserted.error) throw new Error(`Uploaded object but could not create metadata for ${item.decisionId}: ${inserted.error.code}`);
  results.push({ decisionId: item.decisionId, status: "uploaded", metadataId: inserted.data.id });
}
console.log(JSON.stringify({ mode: "apply", bucketId, private: true, results }));
