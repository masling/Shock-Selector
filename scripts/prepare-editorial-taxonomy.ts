import fs from "node:fs/promises";
import { seriesEditorial } from "../lib/catalog/series-editorial";

// Add catalogue navigation only. No ProductModel, spec value, or selector edits.
const q = (value: string) => `'${value.replace(/'/g,"''")}'`;
const familyId = "catalog-family-rubber-vibration-isolators";
const translations = [
  ["en","Rubber Vibration Isolators","Rubber mounts","Elastomer mounts for machinery vibration isolation.","BE, E, EA, 6JX, SH, WH and WHG rubber mounts support machinery with model-specific loads, deflections and installation arrangements."],
  ["zh-cn","橡胶隔振器","橡胶支座","用于机械减振的弹性体支撑。","包含 BE、E、EA、6JX、SH、WH 和 WHG 系列，应依据具体型号的承载、变形与安装形式选型。"],
  ["de","Gummi-Schwingungsisolatoren","Gummilager","Elastomerlager zur Schwingungsisolierung von Maschinen.","Die Baureihen BE, E, EA, 6JX, SH, WH und WHG bieten modellspezifische Last-, Verformungs- und Montagekonfigurationen."],
  ["fr","Isolateurs antivibratoires en caoutchouc","Supports élastomères","Supports élastomères pour l’isolation vibratoire des machines.","Les séries BE, E, EA, 6JX, SH, WH et WHG présentent des charges, déformations et montages propres à chaque modèle."],
  ["it","Isolatori antivibranti in gomma","Supporti elastomerici","Supporti elastomerici per l’isolamento delle vibrazioni delle macchine.","Le serie BE, E, EA, 6JX, SH, WH e WHG prevedono carichi, deformazioni e configurazioni di montaggio specifici per modello."],
];
const sql = ["BEGIN;",
  `INSERT INTO public."ProductFamily" (id,key,slug,"sortOrder","isActive","catalogStatus","createdAt","updatedAt") VALUES (${q(familyId)},'rubber_vibration_isolators','rubber-vibration-isolators',60,true,'PUBLISHED',now(),now()) ON CONFLICT (key) DO NOTHING;`,
  ...translations.map(([locale,name,tag,summary,description]) => `INSERT INTO public."ProductFamilyTranslation" (id,"familyId",locale,name,tag,summary,description,"createdAt","updatedAt") SELECT ${q(familyId+'-'+locale)},id,${[locale,name,tag,summary,description].map(q).join(',')},now(),now() FROM public."ProductFamily" WHERE key='rubber_vibration_isolators' ON CONFLICT ("familyId",locale) DO NOTHING;`),
  ...seriesEditorial.map((s,i) => `INSERT INTO public."ProductSeries" (id,"familyId",code,slug,name,"sortOrder","selectorEligible","selectorDefaultStatus","catalogStatus",overview,"workingPrinciple","applicationNotes","sourceSummary","createdAt","updatedAt") SELECT ${q('catalog-series-'+s.code.toLowerCase())},id,${[s.code,s.slug,s.name.en].map(q).join(',')},${100+i},false,'NOT_APPLICABLE','PUBLISHED',${[s.overview.en,s.principle.en,s.applications.en,`${s.source.catalog}; PDF pages ${s.source.pages.join(', ')}`].map(q).join(',')},now(),now() FROM public."ProductFamily" WHERE key=${q(s.familyKey)} ON CONFLICT ("familyId",code) DO NOTHING;`),
  "COMMIT;",
];
async function main() {
  await fs.mkdir('data/staging',{recursive:true});
  await fs.writeFile('data/staging/editorial-taxonomy.sql',sql.join('\n')+'\n');
  console.log(JSON.stringify({sourceSeries:seriesEditorial.length,expectedNewSeries:15,newFamilies:1,modelOrSpecChanges:0,output:'data/staging/editorial-taxonomy.sql'}));
}
main().catch(error => { console.error(error.message); process.exitCode=1; });
