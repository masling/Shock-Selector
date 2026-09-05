import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { modelKey } from "./catalog-sources/asset-remarks.mjs";

export const reviewTarget = "nvfbyhprwiyigdcqgjtd";
const hash = text => createHash("sha256").update(text).digest("hex");
const literal = text => `'${text.replaceAll("'", "''")}'`;
const json = value => `${literal(JSON.stringify(value))}::jsonb`;
const block = body => {
  const tag = `$queue_${randomUUID().replaceAll("-", "")}$`;
  if (body.includes(tag)) throw new Error("Unexpected SQL delimiter");
  return `SET standard_conforming_strings = on;\nDO ${tag}\n${body}\n${tag};\n`;
};

export function prepareReviewData(planText, sourceText, target) {
  if (target !== reviewTarget) throw new Error("Unexpected target project");
  const plan = JSON.parse(planText), source = JSON.parse(sourceText);
  if (plan.version !== 1 || plan.mode !== "local_dry_run" || plan.productionExecutionAllowed !== false || !Array.isArray(plan.candidates) || !Array.isArray(source)) throw new Error("Invalid source plan");
  if (plan.sourceProductsSha256 !== hash(sourceText)) throw new Error("Source product file hash changed");
  const byModel = new Map(source.map(row => [modelKey(row.model), row]));
  if (byModel.size !== source.length || source.length !== plan.candidates.length || !source.length) throw new Error("Source model identities do not match the candidate set");
  const seen = new Set();
  const records = plan.candidates.map(candidateData => {
    const sourceModel = candidateData.model, sourceData = byModel.get(sourceModel);
    if (!sourceData || seen.has(sourceModel) || sourceData.kind !== candidateData.kind) throw new Error("Candidate has missing or ambiguous source data");
    seen.add(sourceModel);
    if (candidateData.catalogStatus !== "DRAFT" || candidateData.selectorEligible !== false || candidateData.executionAllowed !== false || candidateData.implicitDeletesAllowed !== false) throw new Error("Candidate is not a non-executable draft");
    if (!["new_candidate", "existing_candidate", "identity_review"].includes(candidateData.status)) throw new Error("Unknown proposed action");
    return { sourceModel, sourceKind: candidateData.kind, proposedAction: candidateData.status, rowSha256: hash(JSON.stringify({ candidateData, sourceData })), candidateData, sourceData };
  });
  const sorted = [...records].sort((a, b) => Buffer.compare(Buffer.from(a.sourceModel), Buffer.from(b.sourceModel)));
  return {
    sourceSha256: hash(planText), sourceProductsSha256: hash(sourceText), records,
    rowsFingerprint: createHash("md5").update(sorted.map(r => `${r.sourceModel}:${r.rowSha256}`).join("\n")).digest("hex"),
    summary: plan.summary,
    meta: { planVersion: plan.version, generatedAt: plan.generatedAt, sourceBatch: plan.sourceBatch, snapshot: plan.snapshot, fieldDefinitions: plan.fieldDefinitions, rules: plan.rules },
  };
}

export function buildReviewSql(data, maxChunkBytes = 180000) {
  const sourceHash = literal(data.sourceSha256);
  const setup = block(`BEGIN
  INSERT INTO public."ProductImportBatch" ("sourceSha256", "sourceProductsSha256", "sourceRowCount", "summaryJson", "sourceMetaJson")
    VALUES (${sourceHash}, ${literal(data.sourceProductsSha256)}, ${data.records.length}, ${json(data.summary)}, ${json(data.meta)})
    ON CONFLICT ("sourceSha256") DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public."ProductImportBatch" WHERE "sourceSha256"=${sourceHash}
    AND "sourceProductsSha256"=${literal(data.sourceProductsSha256)} AND "sourceRowCount"=${data.records.length}
    AND "summaryJson"=${json(data.summary)} AND "sourceMetaJson"=${json(data.meta)}) THEN
    RAISE EXCEPTION 'Existing review batch differs; refusing overwrite';
  END IF;
END;`);
  const chunks = [];
  const ranges = [];
  for (let offset = 0; offset < data.records.length;) {
    const start = offset;
    const records = [];
    while (offset < data.records.length) {
      const next = data.records[offset];
      if (records.length && Buffer.byteLength(JSON.stringify([...records, next])) > maxChunkBytes) break;
      records.push(next);
      offset++;
    }
    ranges.push({ from: start, to: offset });
    chunks.push(block(`DECLARE
  incoming jsonb := ${json(records)};
  batch public."ProductImportBatch"%ROWTYPE;
BEGIN
  SELECT * INTO STRICT batch FROM public."ProductImportBatch" WHERE "sourceSha256"=${sourceHash} FOR UPDATE;
  IF batch.state='DRAFT' AND EXISTS (SELECT 1 FROM jsonb_array_elements(incoming) r
    LEFT JOIN public."ProductImportCandidate" c ON c."batchId"=batch.id AND c."sourceModel"=r->>'sourceModel'
    WHERE c.id IS NULL) THEN RAISE EXCEPTION 'Completed review batch is incomplete; refusing repair'; END IF;
  INSERT INTO public."ProductImportCandidate" ("batchId", "sourceModel", "sourceKind", "proposedAction", "rowSha256", "candidateData", "sourceData")
    SELECT batch.id, r->>'sourceModel', r->>'sourceKind', r->>'proposedAction', r->>'rowSha256', r->'candidateData', r->'sourceData'
    FROM jsonb_array_elements(incoming) r ON CONFLICT ("batchId", "sourceModel") DO NOTHING;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(incoming) r
    LEFT JOIN public."ProductImportCandidate" c ON c."batchId"=batch.id AND c."sourceModel"=r->>'sourceModel'
    WHERE c.id IS NULL OR c."rowSha256" IS DISTINCT FROM r->>'rowSha256'
      OR c."candidateData" IS DISTINCT FROM r->'candidateData' OR c."sourceData" IS DISTINCT FROM r->'sourceData'
      OR c."sourceKind" IS DISTINCT FROM r->>'sourceKind' OR c."proposedAction" IS DISTINCT FROM r->>'proposedAction'
      OR c."catalogStatus"<>'DRAFT' OR c."selectorEligible") THEN
    RAISE EXCEPTION 'Review candidate differs; refusing overwrite';
  END IF;
END;`));
  }
  const finish = block(`DECLARE batch public."ProductImportBatch"%ROWTYPE;
BEGIN
  SELECT * INTO STRICT batch FROM public."ProductImportBatch" WHERE "sourceSha256"=${sourceHash} FOR UPDATE;
  IF (SELECT count(*) FROM public."ProductImportCandidate" WHERE "batchId"=batch.id)<>${data.records.length}
    OR (SELECT md5(string_agg("sourceModel" || ':' || "rowSha256", E'\\n' ORDER BY "sourceModel" COLLATE "C")) FROM public."ProductImportCandidate" WHERE "batchId"=batch.id) IS DISTINCT FROM ${literal(data.rowsFingerprint)} THEN
    RAISE EXCEPTION 'Review batch count/fingerprint mismatch';
  END IF;
  IF EXISTS (SELECT 1 FROM public."ProductImportCandidate" c,
    LATERAL jsonb_array_elements(COALESCE(c."candidateData"->'existingMatches','[]') || COALESCE(c."candidateData"->'possibleGroupMembers','[]')) ref
    LEFT JOIN public."ProductModel" m ON m.id=ref->>'id'
    WHERE c."batchId"=batch.id AND (m.id IS NULL OR m.model IS DISTINCT FROM ref->>'model')) THEN
    RAISE EXCEPTION 'Existing catalog references have changed; review required';
  END IF;
  IF EXISTS (SELECT 1 FROM public."ProductImportCandidate" c WHERE c."batchId"=batch.id
    AND c."candidateData"->>'targetSeriesId' IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public."ProductSeries" s WHERE s.id=c."candidateData"->>'targetSeriesId')) THEN
    RAISE EXCEPTION 'Target series reference is missing';
  END IF;
  UPDATE public."ProductImportBatch" SET state='DRAFT', "completedAt"=now() WHERE id=batch.id AND state='IMPORTING';
END;`);
  return { setup, chunks, ranges, finish };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) { console.log("node scripts/prepare-review-queue.mjs --plan <import-plan.json> --source <product-staging.json> --target-ref <approved-project-ref>\nOffline SQL generation only. Does not connect, publish or mutate the product catalog."); return; }
  const options = new Map();
  for (let i=0;i<args.length;i+=2) {
    if (!["--plan","--source","--target-ref"].includes(args[i]) || !args[i+1] || options.has(args[i])) throw new Error("Invalid arguments");
    options.set(args[i],args[i+1]);
  }
  if (options.size!==3) throw new Error("Plan, source and target are required");
  const staging = fs.realpathSync(path.resolve("data/staging"));
  const read = key => {
    const file = fs.realpathSync(path.resolve(options.get(key)));
    const relative = path.relative(staging,file);
    if (relative===".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error("Inputs must be in ignored data/staging");
    return fs.readFileSync(file,"utf8");
  };
  const data = prepareReviewData(read("--plan"),read("--source"),options.get("--target-ref"));
  const sql = buildReviewSql(data);
  const output=path.join(staging,`review-queue-${new Date().toISOString().replace(/[:.]/g,"-")}-${randomUUID().slice(0,8)}`);
  fs.mkdirSync(output,{mode:0o700});
  const entries=[{name:"00-setup.sql",sql:sql.setup},...sql.chunks.map((chunk,i)=>({name:`${String(i+1).padStart(2,"0")}-candidates.sql`,sql:chunk,range:sql.ranges[i]})),{name:"99-finish.sql",sql:sql.finish}];
  for (const entry of entries) fs.writeFileSync(path.join(output,entry.name),entry.sql,{flag:"wx",mode:0o600});
  const manifest={output,targetProjectId:reviewTarget,sourceSha256:data.sourceSha256,sourceProductsSha256:data.sourceProductsSha256,rowsFingerprint:data.rowsFingerprint,candidates:data.records.length,summary:data.summary,files:entries.map(e=>({name:e.name,sha256:hash(e.sql),bytes:Buffer.byteLength(e.sql),range:e.range})),databaseMutations:0};
  fs.writeFileSync(path.join(output,"manifest.json"),JSON.stringify(manifest,null,2)+"\n",{flag:"wx",mode:0o600});
  console.log(JSON.stringify(manifest,null,2));
}

if (process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch(error) { console.error(error.message); process.exitCode=1; }
}
