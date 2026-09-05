import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { prepareReviewData, buildReviewSql, reviewTarget } from "./prepare-review-queue.mjs";

function fixture() {
  const source=JSON.stringify([{model:"EK42X25",kind:"absorber",representativeImage:{status:"mapping_confirmed",sourceModel:"EK42X25"},technicalAssets:{CAD:{public:false}}}]);
  const plan={version:1,mode:"local_dry_run",productionExecutionAllowed:false,sourceProductsSha256:createHash("sha256").update(source).digest("hex"),summary:{sourceRows:1},candidates:[{model:"EK42X25",kind:"absorber",catalogStatus:"DRAFT",selectorEligible:false,executionAllowed:false,implicitDeletesAllowed:false,status:"identity_review",existingMatches:[],possibleGroupMembers:[]}]};
  return {source,plan};
}

test("retains image decisions and technical asset evidence separately from proposed changes",()=>{
  const f=fixture(),data=prepareReviewData(JSON.stringify(f.plan),f.source,reviewTarget);
  assert.equal(data.records[0].sourceData.representativeImage.status,"mapping_confirmed");
  assert.equal(data.records[0].sourceData.technicalAssets.CAD.public,false);
  assert.equal(data.records[0].candidateData.executionAllowed,false);
});

test("rejects executable/published candidates, source hash changes and wrong target",()=>{
  for (const key of ["executionAllowed","selectorEligible","implicitDeletesAllowed"]) {
    const f=fixture(); f.plan.candidates[0][key]=true;
    assert.throws(()=>prepareReviewData(JSON.stringify(f.plan),f.source,reviewTarget),/draft/);
  }
  const f=fixture();f.plan.candidates[0].catalogStatus="PUBLISHED";
  assert.throws(()=>prepareReviewData(JSON.stringify(f.plan),f.source,reviewTarget),/draft/);
  assert.throws(()=>prepareReviewData(JSON.stringify(f.plan),f.source+" ",reviewTarget),/hash/);
  assert.throws(()=>prepareReviewData(JSON.stringify(f.plan),f.source,"other"),/target/);
});

test("only writes review queue tables and finishes after count, fingerprint and reference checks",()=>{
  const f=fixture(),sql=buildReviewSql(prepareReviewData(JSON.stringify(f.plan),f.source,reviewTarget));
  const all=[sql.setup,...sql.chunks,sql.finish].join("\n");
  assert.ok(all.includes("ON CONFLICT"));
  assert.ok(all.includes("refusing overwrite"));
  assert.ok(sql.finish.includes("count/fingerprint mismatch"));
  assert.ok(sql.finish.includes("Existing catalog references have changed"));
  assert.doesNotMatch(all,/\b(?:INSERT INTO|UPDATE|DELETE FROM|TRUNCATE) public\."ProductModel"/);
});

test("byte-limited chunks cover each source row exactly once",()=>{
  const f=fixture(),data=prepareReviewData(JSON.stringify(f.plan),f.source,reviewTarget);
  data.records=Array.from({length:20},(_,i)=>({...data.records[0],sourceModel:`EK-${i}`}));
  const sql=buildReviewSql(data,1600);
  assert.ok(sql.chunks.length>1);
  assert.equal(sql.ranges[0].from,0);
  assert.equal(sql.ranges.at(-1).to,20);
  sql.ranges.forEach((range,i)=>{
    assert.ok(range.to>range.from);
    if(i)assert.equal(range.from,sql.ranges[i-1].to);
  });
});
