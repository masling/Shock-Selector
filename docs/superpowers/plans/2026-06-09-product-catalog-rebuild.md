# Product Catalog Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the absorber-only product database with a complete PDF-backed catalog that supports product-family pages, product-series pages, buyer filtering, and absorber selector recommendations.

**Architecture:** Replace the old `Product`-centric catalog with `ProductFamily`, `ProductSeries`, `ProductModel`, dynamic spec definitions/values, source references, and import issues. A new multi-source import script seeds family/series copy, imports Excel selector data, imports PDF-derived model rows, writes an import report, and refuses to run unless the target database is identified as a non-production branch. Product pages and selector services read from the rebuilt catalog tables only.

**Tech Stack:** Next.js App Router, TypeScript, Prisma 6, PostgreSQL, Zod, TSX scripts, Node test runner, XLSX.

---

## File Structure

Create or replace these units:

- `schema.prisma` — replace old absorber-only `Product` model with rebuilt catalog models and enums.
- `lib/catalog/status.ts` — shared status constants and selector-required spec keys.
- `lib/catalog/model-normalization.ts` — model normalization, series detection, numeric parsing, and sort key helpers.
- `lib/catalog/model-normalization.test.ts` — node:test coverage for normalization and parsing.
- `lib/catalog/catalog-seed-data.ts` — manual family/series bilingual copy and source metadata for the 11 required series.
- `lib/catalog/spec-definitions.ts` — spec definitions used by import and UI.
- `lib/catalog/catalog-schemas.ts` — Zod schemas and public result types for family, series, and model search.
- `lib/catalog/catalog-repository.ts` — Prisma reads for families, series, specs, models, and selector candidates.
- `lib/catalog/catalog-service.ts` — validates search input and maps repository records into API-friendly results.
- `scripts/catalog-sources/excel-products.ts` — parse `data/选型程序算法.xlsx` database sheet into normalized catalog model rows.
- `scripts/catalog-sources/pdf-catalogs.ts` — import PDF-derived model rows and source refs from deterministic seed tables extracted from the four English PDFs and Chinese full catalog.
- `scripts/catalog-sources/import-report.ts` — aggregate import counts and issue lists into JSON/Markdown reports.
- `scripts/import-catalog.ts` — guarded import entry point that checks DB branch, clears/reseeds catalog tables, merges PDF and Excel rows, and writes reports.
- `app/api/products/search/route.ts` — switch to the new catalog model search service.
- `app/products/page.tsx` — show rebuilt product-family/series architecture.
- `app/products/[familySlug]/page.tsx` — show family content and series cards from DB.
- `app/products/[familySlug]/[seriesSlug]/page.tsx` — new series detail page with dynamic technical model table.
- `app/selector/buyer/page.tsx` — use new filter options from catalog service.
- `components/marketing/buyer-search-client.tsx` — update filter payload/table rendering to the new dynamic model result shape.
- `lib/calculators/types.ts` — keep calculator filter shape compatible with absorber spec keys.
- `lib/calculators/calculator-service.ts` — call selector candidate search so only `selectorStatus = ready` models are recommended.
- `lib/selection-logs/selection-log-repository.ts` — keep selected product IDs as model IDs from the new table.
- `package.json` — replace `import:excel` with `import:catalog`, add `test:catalog`.

Do not keep `lib/products/*` as the primary catalog path. Delete or leave unused only after all imports compile; the new code path should use `lib/catalog/*`.

---

### Task 1: Replace Prisma catalog schema

**Files:**
- Modify: `schema.prisma:47-237`
- Keep: `schema.prisma:255-300` scenario and selection log models

- [ ] **Step 1: Replace product enums and product models**

Edit `schema.prisma` so the product/catalog section contains these enums and models. Preserve the existing scenario enums, `ScenarioFamily`, `Scenario`, and `SelectionLog` models after this section.

```prisma
enum CatalogStatus {
  PUBLISHED
  DRAFT
  NEEDS_REVIEW
}

enum SelectorStatus {
  NOT_APPLICABLE
  READY
  INCOMPLETE
  CONFLICT
}

enum SpecDataType {
  NUMBER
  TEXT
  RANGE
  JSON
}

enum SourceType {
  PDF_ENGLISH
  PDF_CHINESE_FULL_CATALOG
  EXCEL_SELECTOR
  MANUAL_SEED
}

enum ConfidenceStatus {
  VERIFIED_BY_PDF_AND_EXCEL
  PDF_CATALOG_ONLY
  EXCEL_SELECTOR_ONLY
  CONFLICT_NEEDS_REVIEW
  NEEDS_REVIEW
}

enum ImportIssueSeverity {
  INFO
  WARNING
  ERROR
}

model ProductFamily {
  id           String                     @id @default(cuid())
  key          String                     @unique
  slug         String                     @unique
  sortOrder    Int                        @default(0)
  isActive     Boolean                    @default(true)
  catalogStatus CatalogStatus             @default(PUBLISHED)
  createdAt    DateTime                   @default(now())
  updatedAt    DateTime                   @updatedAt
  translations ProductFamilyTranslation[]
  series       ProductSeries[]
  specDefinitions ProductSpecDefinition[]

  @@index([isActive, sortOrder])
  @@index([catalogStatus])
}

model ProductFamilyTranslation {
  id                String        @id @default(cuid())
  familyId          String
  family            ProductFamily @relation(fields: [familyId], references: [id], onDelete: Cascade)
  locale            String
  name              String
  tag               String?
  summary           String
  description       String
  applicationNotes  String?
  workingPrinciple  String?
  constructionNotes String?
  featureNotes      String?
  seoSummary        String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@unique([familyId, locale])
  @@index([locale])
}

model ProductSeries {
  id                    String                     @id @default(cuid())
  familyId              String
  family                ProductFamily              @relation(fields: [familyId], references: [id], onDelete: Cascade)
  code                  String
  slug                  String                     @unique
  name                  String
  sortOrder             Int                        @default(0)
  selectorEligible      Boolean                    @default(false)
  selectorDefaultStatus SelectorStatus             @default(NOT_APPLICABLE)
  catalogStatus         CatalogStatus              @default(PUBLISHED)
  overview              String?
  workingPrinciple      String?
  constructionNotes     String?
  materialNotes         String?
  applicationNotes      String?
  featureNotes          String?
  sourceSummary         String?
  createdAt             DateTime                   @default(now())
  updatedAt             DateTime                   @updatedAt
  models                ProductModel[]
  specDefinitions       ProductSpecDefinition[]
  sourceReferences      ProductSourceReference[]
  importIssues          ImportIssue[]

  @@unique([familyId, code])
  @@index([familyId, sortOrder])
  @@index([selectorEligible, catalogStatus])
}

model ProductModel {
  id               String                   @id @default(cuid())
  seriesId         String
  series           ProductSeries            @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  rawModel         String
  model            String                   @unique
  sortKey          String
  catalogStatus    CatalogStatus            @default(PUBLISHED)
  selectorStatus   SelectorStatus           @default(NOT_APPLICABLE)
  selectorEligible Boolean                  @default(false)
  isActive         Boolean                  @default(true)
  primaryImageUrl  String?
  rawDataJson      Json?
  createdAt        DateTime                 @default(now())
  updatedAt        DateTime                 @updatedAt
  specValues       ProductSpecValue[]
  sourceReferences ProductSourceReference[]
  importIssues     ImportIssue[]

  @@index([seriesId, sortKey])
  @@index([catalogStatus, isActive])
  @@index([selectorEligible, selectorStatus])
  @@index([model])
}

model ProductSpecDefinition {
  id                String             @id @default(cuid())
  key               String
  labelEn           String
  labelZh           String
  unit              String?
  dataType          SpecDataType
  familyId          String?
  family            ProductFamily?     @relation(fields: [familyId], references: [id], onDelete: Cascade)
  seriesId          String?
  series            ProductSeries?     @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  filterable        Boolean            @default(false)
  comparable        Boolean            @default(false)
  requiredForSelector Boolean          @default(false)
  sortOrder         Int                @default(0)
  values            ProductSpecValue[]

  @@unique([key, familyId, seriesId])
  @@index([familyId, sortOrder])
  @@index([seriesId, sortOrder])
  @@index([filterable])
}

model ProductSpecValue {
  id               String                @id @default(cuid())
  modelId          String
  model            ProductModel          @relation(fields: [modelId], references: [id], onDelete: Cascade)
  specDefinitionId String
  specDefinition   ProductSpecDefinition @relation(fields: [specDefinitionId], references: [id], onDelete: Cascade)
  valueNumber      Decimal?              @db.Decimal(18, 6)
  valueText        String?
  valueJson        Json?
  rawValue         String?
  sourceRefId      String?
  sourceRef        ProductSourceReference? @relation(fields: [sourceRefId], references: [id], onDelete: SetNull)
  confidenceStatus ConfidenceStatus      @default(NEEDS_REVIEW)

  @@unique([modelId, specDefinitionId])
  @@index([specDefinitionId, valueNumber])
  @@index([confidenceStatus])
}

model ProductSourceReference {
  id               String             @id @default(cuid())
  seriesId         String?
  series           ProductSeries?     @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  modelId          String?
  model            ProductModel?      @relation(fields: [modelId], references: [id], onDelete: Cascade)
  sourceType       SourceType
  sourcePath       String
  sourceTitle      String
  language         String
  pageNumber       Int?
  sectionTitle     String?
  rawText          String?
  extractionMethod String
  confidenceStatus ConfidenceStatus   @default(NEEDS_REVIEW)
  specValues       ProductSpecValue[]

  @@index([seriesId, sourceType])
  @@index([modelId, sourceType])
  @@index([sourceType, pageNumber])
}

model ImportIssue {
  id        String              @id @default(cuid())
  severity  ImportIssueSeverity
  issueType String
  modelId   String?
  model     ProductModel?       @relation(fields: [modelId], references: [id], onDelete: Cascade)
  seriesId  String?
  series    ProductSeries?      @relation(fields: [seriesId], references: [id], onDelete: Cascade)
  specKey   String?
  message   String
  sourceRefs Json?
  rawJson   Json?
  createdAt DateTime            @default(now())

  @@index([severity, issueType])
  @@index([modelId])
  @@index([seriesId])
}
```

- [ ] **Step 2: Generate Prisma client to verify schema syntax**

Run:

```bash
pnpm prisma:generate
```

Expected: command exits 0 and Prisma client generation succeeds. If it fails because old relation names remain, remove only the stale old `Product`, `Asset`, `ProductAsset`, `ProductTranslation`, `ProductFamilyAsset`, and `ProductSourceSnapshot` references.

- [ ] **Step 3: Create migration on a database branch only**

Do not run this against production. Confirm `DATABASE_URL` points to a non-production branch, then run:

```bash
pnpm prisma:migrate --name product_catalog_rebuild
```

Expected: migration is created and applied to the branch. If Prisma asks for reset because local branch state differs, stop and ask the user before continuing.

- [ ] **Step 4: Commit schema change**

```bash
git add schema.prisma prisma/migrations
 git commit -m "rebuild product catalog schema"
```

---

### Task 2: Add catalog normalization utilities and tests

**Files:**
- Create: `lib/catalog/status.ts`
- Create: `lib/catalog/model-normalization.ts`
- Create: `lib/catalog/model-normalization.test.ts`
- Modify: `package.json:10-15`

- [ ] **Step 1: Add shared statuses and selector keys**

Create `lib/catalog/status.ts`:

```ts
export const selectorSeriesCodes = ["EK", "EKL", "EN", "ES", "EI", "ED"] as const;

export const selectorRequiredSpecKeys = [
  "strokeMm",
  "energyPerCycleNm",
  "energyPerHourNm",
  "maxImpactForceN",
] as const;

export function isSelectorSeriesCode(seriesCode: string) {
  const normalized = seriesCode.trim().toUpperCase();
  return selectorSeriesCodes.some((code) => code === normalized);
}
```

- [ ] **Step 2: Write failing normalization tests**

Create `lib/catalog/model-normalization.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectSeriesCode,
  normalizeModelName,
  parseCatalogNumber,
  parseDecimalText,
  sortKeyForModel,
} from "./model-normalization";

describe("catalog model normalization", () => {
  it("normalizes spacing while preserving technical model text", () => {
    assert.equal(normalizeModelName("  EK 10x7   (B) "), "EK 10x7 (B)");
    assert.equal(normalizeModelName("WR6 - 400 - 10"), "WR6-400-10");
    assert.equal(normalizeModelName("JYXR(P)XXX100X-LEA"), "JYXR(P)XXX100X-LEA");
  });

  it("detects series codes from normalized models", () => {
    assert.equal(detectSeriesCode("EK 10x7 (B)"), "EK");
    assert.equal(detectSeriesCode("EKL 33x25"), "EKL");
    assert.equal(detectSeriesCode("WR6-400-10"), "WR");
    assert.equal(detectSeriesCode("HGGN16-206"), "HGGN");
    assert.equal(detectSeriesCode("JYXR(P)XXX100X-LEA"), "JYXR_P");
    assert.equal(detectSeriesCode("JYXR(H)XXX080X-175EC"), "JYXR_H");
  });

  it("parses catalog numbers with commas and spaces", () => {
    assert.equal(parseDecimalText("13 600"), 13600);
    assert.equal(parseDecimalText("1,220"), 1220);
    assert.equal(parseDecimalText("0.08-1.30"), null);
    assert.equal(parseDecimalText("–"), null);
  });

  it("parses range-looking catalog values without losing raw text", () => {
    assert.deepEqual(parseCatalogNumber("0.3-3.30"), {
      valueNumber: null,
      valueText: "0.3-3.30",
      rawValue: "0.3-3.30",
    });
    assert.deepEqual(parseCatalogNumber("215.0"), {
      valueNumber: 215,
      valueText: null,
      rawValue: "215.0",
    });
  });

  it("creates stable sort keys", () => {
    assert.equal(sortKeyForModel("EK 10x7 (B)").startsWith("EK|000010|000007"), true);
    assert.equal(sortKeyForModel("WR6-400-10").startsWith("WR|000006|000400|000010"), true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run:

```bash
pnpm tsx --test lib/catalog/model-normalization.test.ts
```

Expected: FAIL because `lib/catalog/model-normalization.ts` does not exist.

- [ ] **Step 4: Implement normalization utilities**

Create `lib/catalog/model-normalization.ts`:

```ts
export type ParsedCatalogValue = {
  valueNumber: number | null;
  valueText: string | null;
  rawValue: string;
};

export function normalizeModelName(input: string) {
  return input
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+\)/g, ")")
    .replace(/\(\s+/g, "(");
}

export function detectSeriesCode(model: string) {
  const normalized = normalizeModelName(model).toUpperCase();

  if (normalized.startsWith("JYXR(P)")) return "JYXR_P";
  if (normalized.startsWith("JYXR(H)")) return "JYXR_H";
  if (normalized.startsWith("HGGN")) return "HGGN";
  if (normalized.startsWith("HGGS")) return "HGGS";
  if (normalized.startsWith("EKL")) return "EKL";

  const match = normalized.match(/^[A-Z]+/);
  return match?.[0] ?? "UNKNOWN";
}

export function parseDecimalText(input: unknown) {
  if (typeof input === "number") return input;
  if (input === null || input === undefined) return null;

  const text = String(input).trim();
  if (!text || text === "–" || text === "-") return null;
  if (/\d\s*-\s*\d/.test(text)) return null;

  const parsed = Number(text.replace(/,/g, "").replace(/\s+/g, ""));
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseCatalogNumber(input: unknown): ParsedCatalogValue {
  const rawValue = input === null || input === undefined ? "" : String(input).trim();
  const valueNumber = parseDecimalText(input);

  return {
    valueNumber,
    valueText: valueNumber === null && rawValue ? rawValue : null,
    rawValue,
  };
}

function padNumber(value: string) {
  return value.padStart(6, "0");
}

export function sortKeyForModel(model: string) {
  const normalized = normalizeModelName(model).toUpperCase();
  const series = detectSeriesCode(normalized);
  const numbers = normalized.match(/\d+/g) ?? [];
  return [series, ...numbers.map(padNumber), normalized].join("|");
}
```

- [ ] **Step 5: Add catalog test script**

Modify `package.json` scripts:

```json
"test:catalog": "tsx --test lib/catalog/*.test.ts",
"import:catalog": "tsx scripts/import-catalog.ts"
```

Keep existing scripts and remove `"import:excel"` only after `import:catalog` is present.

- [ ] **Step 6: Run tests**

Run:

```bash
pnpm test:catalog
```

Expected: PASS.

- [ ] **Step 7: Commit normalization utilities**

```bash
git add package.json lib/catalog/status.ts lib/catalog/model-normalization.ts lib/catalog/model-normalization.test.ts
 git commit -m "add catalog normalization utilities"
```

---

### Task 3: Add family, series, and spec seed data

**Files:**
- Create: `lib/catalog/catalog-seed-data.ts`
- Create: `lib/catalog/spec-definitions.ts`

- [ ] **Step 1: Create family and series seed data**

Create `lib/catalog/catalog-seed-data.ts`:

```ts
export type CatalogFamilySeed = {
  key: string;
  slug: string;
  sortOrder: number;
  translations: Record<"en" | "zh-cn", {
    name: string;
    tag?: string;
    summary: string;
    description: string;
    applicationNotes?: string;
    workingPrinciple?: string;
    constructionNotes?: string;
    featureNotes?: string;
    seoSummary?: string;
  }>;
};

export type CatalogSeriesSeed = {
  familyKey: string;
  code: string;
  slug: string;
  name: string;
  sortOrder: number;
  selectorEligible: boolean;
  overview: string;
  workingPrinciple?: string;
  constructionNotes?: string;
  materialNotes?: string;
  applicationNotes?: string;
  featureNotes?: string;
  sourceSummary: string;
};

export const catalogFamilySeeds: CatalogFamilySeed[] = [
  {
    key: "shock_absorbers",
    slug: "shock-absorbers",
    sortOrder: 10,
    translations: {
      en: {
        name: "Shock Absorbers",
        tag: "Hydraulic energy absorption",
        summary: "Adjustable, non-adjustable and long-life hydraulic shock absorbers for machine motion protection.",
        description: "This family covers compact hydraulic shock absorbers used to decelerate moving loads, protect precision components and stabilize end-stop motion in automation, packaging and machinery applications.",
        applicationNotes: "Automation axes, pneumatic cylinders, motor-driven slides, packaging equipment, robotics and repeatable machine stops.",
        workingPrinciple: "Hydraulic oil is forced through calibrated or adjustable orifices as the piston moves, converting kinetic energy into heat and controlling deceleration.",
        constructionNotes: "Threaded cylinders, piston rods, bearings, orifice systems, return springs or accumulators, optional caps and mounting accessories.",
        featureNotes: "EK/EKL models are adjustable, EN models are self-compensating and ES models emphasize high cycle life.",
      },
      "zh-cn": {
        name: "液压缓冲器",
        tag: "液压能量吸收",
        summary: "覆盖可调、固定型和超长寿命液压缓冲器，用于机械运动防护。",
        description: "该产品族用于吸收运动负载冲击能量，保护精密部件，并改善自动化、包装和机械设备的端部停止过程。",
        applicationNotes: "自动化轴、气缸、电机滑台、包装设备、机器人和重复性端部停止。",
        workingPrinciple: "活塞运动时油液通过节流孔产生阻尼，将动能转化为热量并控制减速。",
        constructionNotes: "外螺纹缸体、活塞杆、轴承、节流系统、复位弹簧或蓄能器，以及可选消音帽和安装附件。",
        featureNotes: "EK/EKL 为可调系列，EN 为自补偿固定型，ES 强调高循环寿命。",
      },
    },
  },
  {
    key: "heavy_duty_buffers",
    slug: "heavy-duty-buffers",
    sortOrder: 20,
    translations: {
      en: {
        name: "Heavy Duty Buffers",
        tag: "Large-energy stopping protection",
        summary: "Heavy industry and heavy duty hydraulic buffers for large moving masses and safety-critical stops.",
        description: "This family covers EI and ED hydraulic buffers for cranes, rail equipment, steel plants, stacker cranes and large production systems.",
        applicationNotes: "Cranes, rail systems, steel industry, coal handling, automated storage, trolley cranes and heavy production lines.",
        workingPrinciple: "Large bore hydraulic damping and gas or air/oil accumulator systems absorb high impact energy while controlling return behavior.",
        constructionNotes: "Heavy cylinders, piston rods, oil chambers, gas or air accumulators, custom orifices, flanges, bellows and safety cables.",
      },
      "zh-cn": {
        name: "重型与重工业缓冲器",
        tag: "大能量安全停止",
        summary: "面向大质量运动结构和安全关键停止场景的重型液压缓冲产品。",
        description: "该产品族覆盖 EI 和 ED 系列，适用于起重、轨道、钢铁、堆垛机和大型生产系统。",
        applicationNotes: "起重机、轨道设备、钢铁行业、煤炭输送、自动仓储、台车和重载生产线。",
        workingPrinciple: "通过大缸径液压阻尼和气体或空气/油液蓄能系统吸收高冲击能量并控制复位。",
        constructionNotes: "重型缸体、活塞杆、油腔、气体或空气蓄能器、定制节流孔、法兰、防护套和安全绳。",
      },
    },
  },
  {
    key: "wire_rope_vibration_isolators",
    slug: "wire-rope-vibration-isolators",
    sortOrder: 30,
    translations: {
      en: {
        name: "Wire Rope Vibration Isolators",
        tag: "Multi-axis shock and vibration isolation",
        summary: "Wire rope isolators for shock resistance, vibration isolation and environmental durability.",
        description: "This family covers WR and CR wire rope isolators made from stainless steel cable and retaining bars for multi-axis equipment protection.",
        applicationNotes: "Transport equipment, electronics, marine installations, military equipment and harsh-environment mounting.",
        workingPrinciple: "Stainless steel cable bends and rubs under load, producing nonlinear stiffness and damping across compression, shear and roll axes.",
        constructionNotes: "Stainless steel cable, aluminum alloy or compact retaining bars, threaded or thru-hole mounting, optional bellmouth holes.",
      },
      "zh-cn": {
        name: "钢丝绳隔振器",
        tag: "多方向冲击与振动隔离",
        summary: "用于抗冲击、隔振和耐环境设备保护的钢丝绳隔振产品。",
        description: "该产品族覆盖 WR 和 CR 系列，由不锈钢钢丝绳和夹板组成，适合多方向设备防护。",
        applicationNotes: "运输设备、电子设备、船舶安装、军用装备和复杂环境安装。",
        workingPrinciple: "钢丝绳在载荷下弯曲并产生摩擦，形成非线性刚度和多轴阻尼。",
        constructionNotes: "不锈钢钢丝绳、铝合金或紧凑夹板、螺纹或通孔安装，可选圆角孔口结构。",
      },
    },
  },
  {
    key: "special_vibration_isolators",
    slug: "special-vibration-isolators",
    sortOrder: 40,
    translations: {
      en: {
        name: "Special Vibration Isolators",
        tag: "Marine and high-impact isolation",
        summary: "Special stainless steel and compound isolators for stricter shock and vibration requirements.",
        description: "This family covers HGGS stainless steel wire rope isolators and HGGN compound anti-impact isolators for demanding equipment installations.",
        applicationNotes: "Marine power equipment, shipboard systems, low natural frequency soft-deck applications and critical equipment isolation.",
        workingPrinciple: "HGGS relies on all-metal wire rope deformation. HGGN combines helical wire rope with elastomer to increase damping, stiffness and energy absorption.",
        constructionNotes: "Stainless steel cable, stainless structures and compound elastomer-encased wire rope constructions.",
      },
      "zh-cn": {
        name: "特种隔振器",
        tag: "船舶与高冲击隔振",
        summary: "面向更严格冲击和隔振要求的不锈钢及复合隔振产品。",
        description: "该产品族覆盖 HGGS 不锈钢钢绳隔振器和 HGGN 复合抗冲隔振器。",
        applicationNotes: "船舶动力设备、舰载系统、低固有频率软甲板应用和关键设备隔振。",
        workingPrinciple: "HGGS 依靠全金属钢绳变形耗能；HGGN 通过钢绳与弹性体复合结构提高阻尼、刚度和吸能效率。",
        constructionNotes: "不锈钢钢缆、不锈钢结构件和弹性体包覆钢绳复合结构。",
      },
    },
  },
  {
    key: "flexible_pipe_connections",
    slug: "flexible-pipe-connections",
    sortOrder: 50,
    translations: {
      en: {
        name: "Flexible Pipe Connections",
        tag: "Single-flanged flexible pipe links",
        summary: "JYXR flexible pipe connections for pipe movement compensation and vibration reduction.",
        description: "This family covers balanced and large-deflection single-flanged flexible connecting pipes used in pipe systems requiring movement tolerance.",
        applicationNotes: "Industrial and marine pipe systems where flange geometry, nominal diameter and interface standards matter.",
        workingPrinciple: "The flexible pipe section reduces rigid transmission and compensates displacement between connected pipe sections.",
        constructionNotes: "Single flange, flexible pipe body, bolt-hole patterns and interface standards such as GB569-65 and GB2501-89.",
      },
      "zh-cn": {
        name: "挠性接管",
        tag: "单法兰挠性连接",
        summary: "用于管路位移补偿和减振的 JYXR 单法兰挠性接管。",
        description: "该产品族覆盖平衡式和大变形单法兰挠性接管，适用于需要位移容许的管路系统。",
        applicationNotes: "工业和船舶管路系统，关注法兰尺寸、公称通径和接口标准。",
        workingPrinciple: "挠性管段降低刚性传递，并补偿连接管段之间的位移。",
        constructionNotes: "单法兰、挠性管体、螺栓孔结构和 GB569-65、GB2501-89 等接口标准。",
      },
    },
  },
];

export const catalogSeriesSeeds: CatalogSeriesSeed[] = [
  {
    familyKey: "shock_absorbers",
    code: "EK",
    slug: "ek-adjustable-shock-absorbers",
    name: "EK / EKL Adjustable Hydraulic Shock Absorbers",
    sortOrder: 10,
    selectorEligible: true,
    overview: "Adjustable hydraulic shock absorbers with standard EK and low-speed EKL variants for changing payload, velocity and force conditions.",
    workingPrinciple: "Turning the adjustment knob changes the effective orifice area, increasing or decreasing damping force while oil flow controls deceleration.",
    constructionNotes: "Piston rod, bearing, piston head, oil chamber, check valve or check ring, foam accumulator, adjustment cam or ball, and threaded cylinder.",
    materialNotes: "Nickel-plated finishes are standard for corrosion resistance; stainless steel versions are available for harsh environments.",
    applicationNotes: "Cylinder-driven, motor-driven and inertia-load machinery where tuning is required.",
    featureNotes: "Adjustment scale supports damping changes without replacing the unit.",
    sourceSummary: "English Shock Absorber PDF pages 4-19; Chinese full catalog pages 4-19.",
  },
  {
    familyKey: "shock_absorbers",
    code: "EN",
    slug: "en-non-adjustable-shock-absorbers",
    name: "EN Non-Adjustable Hydraulic Shock Absorbers",
    sortOrder: 20,
    selectorEligible: true,
    overview: "Self-compensating non-adjustable shock absorbers for repeatable machine stops and high-frequency equipment.",
    workingPrinciple: "Multiple orifices are progressively closed by piston movement, adapting the available flow area to impact conditions.",
    constructionNotes: "Integrated non-detachable structure with piston rod, coil spring, foam accumulator, check ring and multiple-orifice shock tube.",
    materialNotes: "Nickel-plated finishes and optional stainless steel materials are available.",
    applicationNotes: "High-frequency precision equipment, automation stops, food processing and conveyor systems.",
    featureNotes: "Tamperproof design and long service life up to 25-30 million cycles in catalog descriptions.",
    sourceSummary: "English Shock Absorber PDF pages 20-35; Chinese full catalog pages 20-35.",
  },
  {
    familyKey: "shock_absorbers",
    code: "ES",
    slug: "es-super-long-life-shock-absorbers",
    name: "ES Super Long Life Shock Absorbers",
    sortOrder: 30,
    selectorEligible: true,
    overview: "Non-adjustable long-life hydraulic shock absorbers for harsh high-cycle packaging and precision machinery applications.",
    workingPrinciple: "Maintenance-free integrated hydraulic damping absorbs repeated machine impacts over long cycle-life requirements.",
    constructionNotes: "Compact integrated units with application-specific stroke, rod length, thread and cap variants.",
    applicationNotes: "Beverage packaging, mold clamping, clam shell and stretching rod positions.",
    featureNotes: "Catalog models show 15-25 million cycle service-life targets.",
    sourceSummary: "English Shock Absorber PDF pages 36-37; Chinese full catalog pages 36-37.",
  },
  {
    familyKey: "heavy_duty_buffers",
    code: "EI",
    slug: "ei-heavy-industry-buffers",
    name: "EI Heavy Industry Shock Absorbers",
    sortOrder: 10,
    selectorEligible: true,
    overview: "Gas-charged heavy industry buffers for large or super-large equipment safety stops.",
    workingPrinciple: "A nitrogen-charged return system enables controlled deceleration and positive return in a maintenance-free package.",
    constructionNotes: "Cylinder, piston rod, oil chamber, nitrogen gas chamber, separating piston, flanges, optional bellows and safety cables.",
    materialNotes: "Epoxy-coated housings, hard-chrome piston rods and optional galvanized finishes support corrosive environments.",
    applicationNotes: "Cranes, rail equipment, steel industry, coal handling and railway systems.",
    sourceSummary: "English Heavy Duty Shock Absorber PDF pages 4-7; Chinese full catalog pages 38-41.",
  },
  {
    familyKey: "heavy_duty_buffers",
    code: "ED",
    slug: "ed-heavy-duty-shock-absorbers",
    name: "ED Heavy Duty Shock Absorbers",
    sortOrder: 20,
    selectorEligible: true,
    overview: "Compact heavy duty shock absorbers with internal air/oil accumulator for smooth high-energy damping.",
    workingPrinciple: "Internal accumulator and custom orifices provide smooth deceleration over long strokes and high energy inputs.",
    constructionNotes: "Cylinder, piston rod, bearing, piston head, check ring, oil orifice holes, shock tube and optional sensor systems.",
    materialNotes: "Painted or galvanized external components, special rod materials and optional seal packages are available.",
    applicationNotes: "Automated storage, rail equipment, trolley cranes and automatic production lines.",
    sourceSummary: "English Heavy Duty Shock Absorber PDF pages 8-16; Chinese full catalog pages 42-51.",
  },
  {
    familyKey: "wire_rope_vibration_isolators",
    code: "WR",
    slug: "wr-wire-rope-vibration-isolators",
    name: "WR Wire Rope Vibration Isolators",
    sortOrder: 10,
    selectorEligible: false,
    overview: "Standard multi-axis wire rope vibration isolators built from stainless steel cable and retaining bars.",
    workingPrinciple: "Nonlinear cable deformation and friction provide vibration stiffness for small deflections and shock stiffness for larger impacts.",
    constructionNotes: "Stainless steel cable threaded through retaining bars with thru-hole, countersunk or threaded mounting options.",
    materialNotes: "302/304 stainless steel wire rope, anodized aluminum alloy mount bars and zinc-plated alloy steel hardware.",
    applicationNotes: "Civil and military equipment requiring corrosion resistance and multi-axis shock isolation.",
    sourceSummary: "English Wire Rope Vibration Isolator PDF pages 4-34; Chinese full catalog pages 52-82.",
  },
  {
    familyKey: "wire_rope_vibration_isolators",
    code: "CR",
    slug: "cr-compact-wire-rope-vibration-isolators",
    name: "CR Compact Wire Rope Vibration Isolators",
    sortOrder: 20,
    selectorEligible: false,
    overview: "Compact wire rope isolators for smaller equipment envelopes.",
    workingPrinciple: "Compact cable loop geometry provides nonlinear stiffness and damping in multiple axes.",
    constructionNotes: "Compact retaining bar and cable construction with model-specific mounting dimensions.",
    applicationNotes: "Smaller equipment needing wire rope isolation in restricted spaces.",
    sourceSummary: "English Wire Rope Vibration Isolator PDF pages 35-46; Chinese full catalog pages 83-95.",
  },
  {
    familyKey: "special_vibration_isolators",
    code: "HGGS",
    slug: "hggs-stainless-steel-wire-rope-vibration-isolators",
    name: "HGGS Stainless Steel Wire Rope Vibration Isolators",
    sortOrder: 10,
    selectorEligible: false,
    overview: "All-stainless steel wire rope vibration isolators for marine and corrosion-sensitive equipment.",
    workingPrinciple: "All-metal wire rope deformation provides nonlinear stiffness, long life and environmental stability.",
    materialNotes: "Stainless steel construction for water, salt fog, oil and sunlight resistance.",
    applicationNotes: "Marine power equipment and general electrical equipment vibration isolation.",
    sourceSummary: "English Special Vibration Isolator PDF pages 6-9; Chinese full catalog pages 96-99.",
  },
  {
    familyKey: "special_vibration_isolators",
    code: "HGGN",
    slug: "hggn-anti-impact-vibration-isolators",
    name: "HGGN Anti-Impact Vibration Isolators",
    sortOrder: 20,
    selectorEligible: false,
    overview: "Compound high-energy anti-impact isolators combining helical wire rope with elastomer.",
    workingPrinciple: "The stainless cable provides rugged structure while elastomer increases damping, stiffness and energy absorption efficiency.",
    constructionNotes: "Helical wire rope isolator encased in a proprietary elastomeric compound.",
    applicationNotes: "Shipboard equipment and 12-16 Hz soft-deck applications requiring output acceleration reduction.",
    sourceSummary: "English Special Vibration Isolator PDF pages 10-26; Chinese full catalog pages 100-116.",
  },
  {
    familyKey: "flexible_pipe_connections",
    code: "JYXR_P",
    slug: "jyxr-p-balanced-flexible-connecting-pipes",
    name: "JYXR(P) Single-Flanged Balanced Flexible Connecting Pipes",
    sortOrder: 10,
    selectorEligible: false,
    overview: "Single-flanged balanced flexible connecting pipes with cataloged flange and nominal diameter dimensions.",
    workingPrinciple: "The flexible pipe body compensates displacement and reduces vibration transmission in pipe connections.",
    constructionNotes: "One flange and one flexible connecting pipe body with GB569-65 or GB2501-89 interface dimensions.",
    applicationNotes: "Pipe systems requiring fixed standard length and flange geometry.",
    sourceSummary: "English Special Vibration Isolator PDF pages 27-28; Chinese full catalog pages 117-118.",
  },
  {
    familyKey: "flexible_pipe_connections",
    code: "JYXR_H",
    slug: "jyxr-h-large-deflection-flexible-connecting-pipes",
    name: "JYXR(H) Single-Flanged Flexible Connecting Pipes",
    sortOrder: 20,
    selectorEligible: false,
    overview: "Single-flanged flexible connecting pipes with greater deflection capability.",
    workingPrinciple: "A larger-deflection flexible pipe body compensates movement and reduces rigid pipe connection transmission.",
    constructionNotes: "Single flange and flexible pipe body with model-specific nominal diameter and length variants.",
    applicationNotes: "Pipe systems where larger movement compensation is required.",
    sourceSummary: "English Special Vibration Isolator PDF page 29; Chinese full catalog page 119.",
  },
];
```

- [ ] **Step 2: Create spec definitions**

Create `lib/catalog/spec-definitions.ts`:

```ts
export type CatalogSpecSeed = {
  key: string;
  labelEn: string;
  labelZh: string;
  unit?: string;
  dataType: "NUMBER" | "TEXT" | "RANGE" | "JSON";
  filterable: boolean;
  comparable: boolean;
  requiredForSelector?: boolean;
  sortOrder: number;
  seriesCodes?: string[];
};

export const catalogSpecSeeds: CatalogSpecSeed[] = [
  { key: "strokeMm", labelEn: "Stroke", labelZh: "缓冲行程", unit: "mm", dataType: "NUMBER", filterable: true, comparable: true, requiredForSelector: true, sortOrder: 10, seriesCodes: ["EK", "EKL", "EN", "ES", "EI", "ED"] },
  { key: "optimalVelocityRange", labelEn: "Optimal velocity range", labelZh: "最佳速度范围", unit: "m/s", dataType: "RANGE", filterable: false, comparable: true, sortOrder: 20, seriesCodes: ["EK", "EKL", "EN", "ES"] },
  { key: "energyPerCycleNm", labelEn: "Max energy per cycle", labelZh: "每次最大吸收能量", unit: "Nm/C", dataType: "NUMBER", filterable: true, comparable: true, requiredForSelector: true, sortOrder: 30, seriesCodes: ["EK", "EKL", "EN", "ES", "EI", "ED"] },
  { key: "energyPerHourNm", labelEn: "Max energy per hour", labelZh: "每小时最大吸收能量", unit: "Nm/h", dataType: "NUMBER", filterable: true, comparable: true, requiredForSelector: true, sortOrder: 40, seriesCodes: ["EK", "EKL", "EN", "ES", "ED"] },
  { key: "maxImpactForceN", labelEn: "Max impact force", labelZh: "最大冲击力", unit: "N", dataType: "NUMBER", filterable: true, comparable: true, requiredForSelector: true, sortOrder: 50, seriesCodes: ["EK", "EKL", "EN", "ES", "EI", "ED"] },
  { key: "maxThrustForceN", labelEn: "Max thrust force", labelZh: "最大推进力", unit: "N", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 60, seriesCodes: ["EK", "EKL", "EN", "ES"] },
  { key: "totalLengthMm", labelEn: "Total length", labelZh: "总长度", unit: "mm", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 70, seriesCodes: ["EK", "EKL", "EN", "ES", "ED"] },
  { key: "threadSize", labelEn: "Thread size", labelZh: "螺纹尺寸", dataType: "TEXT", filterable: true, comparable: true, sortOrder: 80, seriesCodes: ["EK", "EKL", "EN", "ES"] },
  { key: "weight", labelEn: "Weight", labelZh: "重量", unit: "kg/g", dataType: "TEXT", filterable: false, comparable: true, sortOrder: 90 },
  { key: "maxStaticLoadN", labelEn: "Max static load", labelZh: "最大静载", unit: "N", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 100, seriesCodes: ["WR", "CR", "HGGS", "HGGN"] },
  { key: "vibrationStiffnessNPerM", labelEn: "Vibration stiffness", labelZh: "振动刚度", unit: "N/m", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 110, seriesCodes: ["WR", "CR", "HGGS", "HGGN"] },
  { key: "shockStiffnessNPerM", labelEn: "Shock stiffness", labelZh: "冲击刚度", unit: "N/m", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 120, seriesCodes: ["WR", "CR", "HGGS", "HGGN"] },
  { key: "maxDeflectionMm", labelEn: "Max deflection", labelZh: "最大变形", unit: "mm", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 130, seriesCodes: ["WR", "CR", "HGGS", "HGGN"] },
  { key: "mountingOption", labelEn: "Mounting option", labelZh: "安装方式", dataType: "TEXT", filterable: true, comparable: true, sortOrder: 140, seriesCodes: ["WR", "CR", "HGGS", "HGGN"] },
  { key: "loopCount", labelEn: "Loop count", labelZh: "圈数", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 150, seriesCodes: ["WR", "CR"] },
  { key: "nominalDiameterDn", labelEn: "Nominal diameter", labelZh: "公称通径", unit: "DN", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 160, seriesCodes: ["JYXR_P", "JYXR_H"] },
  { key: "flangeOuterDiameterMm", labelEn: "Flange outer diameter", labelZh: "法兰外径", unit: "mm", dataType: "NUMBER", filterable: true, comparable: true, sortOrder: 170, seriesCodes: ["JYXR_P", "JYXR_H"] },
  { key: "boltHolePattern", labelEn: "Bolt-hole pattern", labelZh: "螺栓孔", dataType: "TEXT", filterable: true, comparable: true, sortOrder: 180, seriesCodes: ["JYXR_P", "JYXR_H"] },
  { key: "interfaceStandard", labelEn: "Interface standard", labelZh: "接口标准", dataType: "TEXT", filterable: true, comparable: true, sortOrder: 190, seriesCodes: ["JYXR_P", "JYXR_H"] },
];

export const absorberSelectorSpecKeys = catalogSpecSeeds
  .filter((spec) => spec.requiredForSelector)
  .map((spec) => spec.key);
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS or unrelated existing errors. If errors mention the new files, fix imports/types before continuing.

- [ ] **Step 4: Commit seed data**

```bash
git add lib/catalog/catalog-seed-data.ts lib/catalog/spec-definitions.ts
 git commit -m "add catalog seed data"
```

---

### Task 4: Implement Excel and PDF source parsers

**Files:**
- Create: `scripts/catalog-sources/source-types.ts`
- Create: `scripts/catalog-sources/excel-products.ts`
- Create: `scripts/catalog-sources/pdf-catalogs.ts`
- Create: `scripts/catalog-sources/source-parsers.test.ts`

- [ ] **Step 1: Create shared import row types**

Create `scripts/catalog-sources/source-types.ts`:

```ts
export type ImportedSpecValue = {
  key: string;
  rawValue: string;
  valueNumber: number | null;
  valueText: string | null;
  sourceType: "PDF_ENGLISH" | "PDF_CHINESE_FULL_CATALOG" | "EXCEL_SELECTOR" | "MANUAL_SEED";
  sourcePath: string;
  sourceTitle: string;
  language: string;
  pageNumber?: number;
  sectionTitle?: string;
  confidenceStatus: "PDF_CATALOG_ONLY" | "EXCEL_SELECTOR_ONLY" | "NEEDS_REVIEW";
};

export type ImportedModelRow = {
  rawModel: string;
  model: string;
  seriesCode: string;
  selectorEligible: boolean;
  primaryImageUrl?: string | null;
  rawData: Record<string, unknown>;
  specs: ImportedSpecValue[];
  sourceRefs: Array<{
    sourceType: "PDF_ENGLISH" | "PDF_CHINESE_FULL_CATALOG" | "EXCEL_SELECTOR" | "MANUAL_SEED";
    sourcePath: string;
    sourceTitle: string;
    language: string;
    pageNumber?: number;
    sectionTitle?: string;
    rawText?: string;
    extractionMethod: string;
    confidenceStatus: "PDF_CATALOG_ONLY" | "EXCEL_SELECTOR_ONLY" | "NEEDS_REVIEW";
  }>;
};
```

- [ ] **Step 2: Write parser tests**

Create `scripts/catalog-sources/source-parsers.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapExcelRowToImportedModel } from "./excel-products";
import { pdfCatalogRows } from "./pdf-catalogs";

describe("catalog source parsers", () => {
  it("maps Excel absorber rows into selector-eligible imported models", () => {
    const row = mapExcelRowToImportedModel({
      "产品型号": "ES18985",
      "类型": "固定型",
      "缓冲行程（mm)": 4,
      "每次最大吸收能量(Nm/c)": 16,
      "每小时最大吸收能量(Nm/h)": 28800,
      "最大冲击力N": 2200,
      "最大推进力N": 300,
      "总长度": 72.4,
      "螺纹尺寸": "M12x1.0",
      "产品照片": 3006,
    });

    assert.equal(row?.model, "ES18985");
    assert.equal(row?.seriesCode, "ES");
    assert.equal(row?.selectorEligible, true);
    assert.equal(row?.specs.find((spec) => spec.key === "strokeMm")?.valueNumber, 4);
    assert.equal(row?.specs.find((spec) => spec.key === "threadSize")?.valueText, "M12x1.0");
  });

  it("contains PDF-derived rows for every required series", () => {
    const seriesCodes = new Set(pdfCatalogRows.map((row) => row.seriesCode));
    for (const code of ["EK", "EKL", "EN", "ES", "EI", "ED", "WR", "CR", "HGGS", "HGGN", "JYXR_P", "JYXR_H"]) {
      assert.equal(seriesCodes.has(code), true, `missing ${code}`);
    }
  });

  it("marks PDF-only absorber rows as selector eligible", () => {
    const row = pdfCatalogRows.find((item) => item.model === "EK 10x7 (B)");
    assert.equal(row?.selectorEligible, true);
    assert.equal(row?.specs.find((spec) => spec.key === "energyPerCycleNm")?.valueNumber, 7);
  });
});
```

- [ ] **Step 3: Run parser tests to verify they fail**

Run:

```bash
pnpm tsx --test scripts/catalog-sources/source-parsers.test.ts
```

Expected: FAIL because parser files are not implemented.

- [ ] **Step 4: Implement Excel parser**

Create `scripts/catalog-sources/excel-products.ts`:

```ts
import * as XLSX from "xlsx";
import { isSelectorSeriesCode } from "../../lib/catalog/status";
import { detectSeriesCode, normalizeModelName, parseCatalogNumber } from "../../lib/catalog/model-normalization";
import type { ImportedModelRow } from "./source-types";

const workbookPath = "data/选型程序算法.xlsx";
const databaseSheetName = "数据库";

const excelSpecMap: Record<string, string> = {
  "缓冲行程（mm)": "strokeMm",
  "每次最大吸收能量(Nm/c)": "energyPerCycleNm",
  "每小时最大吸收能量(Nm/h)": "energyPerHourNm",
  "最大冲击力N": "maxImpactForceN",
  "最大推进力N": "maxThrustForceN",
  "总长度": "totalLengthMm",
  "螺纹尺寸": "threadSize",
};

export function mapExcelRowToImportedModel(row: Record<string, unknown>): ImportedModelRow | null {
  const rawModel = row["产品型号"];
  if (!rawModel) return null;

  const model = normalizeModelName(String(rawModel));
  const seriesCode = detectSeriesCode(model);
  const selectorEligible = isSelectorSeriesCode(seriesCode);

  const specs = Object.entries(excelSpecMap).flatMap(([header, key]) => {
    const raw = row[header];
    if (raw === null || raw === undefined || raw === "") return [];

    const parsed = parseCatalogNumber(raw);
    return [{
      key,
      rawValue: parsed.rawValue,
      valueNumber: parsed.valueNumber,
      valueText: key === "threadSize" ? parsed.rawValue : parsed.valueText,
      sourceType: "EXCEL_SELECTOR" as const,
      sourcePath: workbookPath,
      sourceTitle: "选型程序算法.xlsx 数据库 sheet",
      language: "zh-cn",
      sectionTitle: databaseSheetName,
      confidenceStatus: "EXCEL_SELECTOR_ONLY" as const,
    }];
  });

  return {
    rawModel: model,
    model,
    seriesCode,
    selectorEligible,
    primaryImageUrl: row["产品照片"] ? `/product-images/${row["产品照片"]}.jpg` : null,
    rawData: row,
    specs,
    sourceRefs: [{
      sourceType: "EXCEL_SELECTOR",
      sourcePath: workbookPath,
      sourceTitle: "选型程序算法.xlsx 数据库 sheet",
      language: "zh-cn",
      sectionTitle: databaseSheetName,
      rawText: JSON.stringify(row),
      extractionMethod: "xlsx",
      confidenceStatus: "EXCEL_SELECTOR_ONLY",
    }],
  };
}

export function readExcelProductRows(path = workbookPath) {
  const workbook = XLSX.readFile(path, { cellDates: false });
  const sheet = workbook.Sheets[databaseSheetName];
  if (!sheet) return [];

  return XLSX.utils
    .sheet_to_json<Record<string, unknown>>(sheet, { defval: null })
    .map(mapExcelRowToImportedModel)
    .filter((row): row is ImportedModelRow => row !== null);
}
```

- [ ] **Step 5: Implement PDF-derived seed rows**

Create `scripts/catalog-sources/pdf-catalogs.ts` with a deterministic starter dataset that includes rows from the PDFs and can be expanded as extraction improves:

```ts
import { isSelectorSeriesCode } from "../../lib/catalog/status";
import { normalizeModelName, parseCatalogNumber } from "../../lib/catalog/model-normalization";
import type { ImportedModelRow, ImportedSpecValue } from "./source-types";

type PdfSeedRow = {
  model: string;
  seriesCode: string;
  sourceTitle: string;
  sourcePath: string;
  language: string;
  pageNumber: number;
  sectionTitle: string;
  specs: Record<string, string | number>;
};

const seedRows: PdfSeedRow[] = [
  { model: "EK 10x7 (B)", seriesCode: "EK", sourceTitle: "Shock Absorber", sourcePath: "uploads/files/20230609/2b1a848ef3d6e28b3a13e15e8fc52e0a.pdf", language: "en", pageNumber: 6, sectionTitle: "EK 10 to EKL 27 Technical Data", specs: { strokeMm: 7, optimalVelocityRange: "0.3-3.30", energyPerCycleNm: 7, energyPerHourNm: 13600, maxImpactForceN: 1220, maxThrustForceN: 350, threadSize: "M10 x 1.0", totalLengthMm: 57 } },
  { model: "EKL 14x10 (B)", seriesCode: "EKL", sourceTitle: "Shock Absorber", sourcePath: "uploads/files/20230609/2b1a848ef3d6e28b3a13e15e8fc52e0a.pdf", language: "en", pageNumber: 6, sectionTitle: "EK 10 to EKL 27 Technical Data", specs: { strokeMm: 10, optimalVelocityRange: "0.08-1.30", energyPerCycleNm: 7, energyPerHourNm: 22000, maxImpactForceN: 890, maxThrustForceN: 440, threadSize: "M14 x 1.5" } },
  { model: "EN 8x6", seriesCode: "EN", sourceTitle: "Shock Absorber", sourcePath: "uploads/files/20230609/2b1a848ef3d6e28b3a13e15e8fc52e0a.pdf", language: "en", pageNumber: 22, sectionTitle: "EN 8 to EN 27 Technical Data", specs: { strokeMm: 6 } },
  { model: "ES18985", seriesCode: "ES", sourceTitle: "Shock Absorber", sourcePath: "uploads/files/20230609/2b1a848ef3d6e28b3a13e15e8fc52e0a.pdf", language: "en", pageNumber: 37, sectionTitle: "ES Series Technical Data", specs: { strokeMm: 4, energyPerCycleNm: 16, energyPerHourNm: 28800, maxImpactForceN: 2200, maxThrustForceN: 300, totalLengthMm: 72.4, threadSize: "M12 x 1.0" } },
  { model: "EI 50 x 50", seriesCode: "EI", sourceTitle: "Heavy Duty Shock Absorber", sourcePath: "uploads/files/20230609/d4efb9d66fa65e5c45b93ed096d5efc9.pdf", language: "en", pageNumber: 6, sectionTitle: "EI 50 x 50 to EI 120 x 1000 Technical Data", specs: { strokeMm: 50, energyPerCycleNm: 3500, maxImpactForceN: 70000, weight: "5 kg" } },
  { model: "ED 1.5 x 2", seriesCode: "ED", sourceTitle: "Heavy Duty Shock Absorber", sourcePath: "uploads/files/20230609/d4efb9d66fa65e5c45b93ed096d5efc9.pdf", language: "en", pageNumber: 9, sectionTitle: "ED 1.5 Technical Data", specs: {} },
  { model: "WR2-100-10", seriesCode: "WR", sourceTitle: "Wire Rope Vibration Isolator", sourcePath: "uploads/files/20230609/3d6903fa68882f5178cc43ee08809849.pdf", language: "en", pageNumber: 7, sectionTitle: "WR2 Series Technical Data", specs: { mountingOption: "B, D, E" } },
  { model: "CR3-100", seriesCode: "CR", sourceTitle: "Wire Rope Vibration Isolator", sourcePath: "uploads/files/20230609/3d6903fa68882f5178cc43ee08809849.pdf", language: "en", pageNumber: 39, sectionTitle: "CR3 Series Technical Data", specs: {} },
  { model: "HGGS-5", seriesCode: "HGGS", sourceTitle: "Special Vibration Isolator", sourcePath: "uploads/files/20230609/e06516c7e70f0df4447b94fafef9129e.pdf", language: "en", pageNumber: 8, sectionTitle: "HGGS Series Technical Data", specs: { maxStaticLoadN: 50 } },
  { model: "HGGN6-200", seriesCode: "HGGN", sourceTitle: "Special Vibration Isolator", sourcePath: "uploads/files/20230609/e06516c7e70f0df4447b94fafef9129e.pdf", language: "en", pageNumber: 12, sectionTitle: "HGGN6 Series Technical Data", specs: { weight: "0.2 kg" } },
  { model: "JYXR(P)XXX065X-LEA", seriesCode: "JYXR_P", sourceTitle: "Special Vibration Isolator", sourcePath: "uploads/files/20230609/e06516c7e70f0df4447b94fafef9129e.pdf", language: "en", pageNumber: 27, sectionTitle: "JYXR(P) Standard Product Structure Data", specs: { nominalDiameterDn: 65, flangeOuterDiameterMm: 175, boltHolePattern: "8-Φ17", interfaceStandard: "GB569-65" } },
  { model: "JYXR(H)XXX040X-155EC", seriesCode: "JYXR_H", sourceTitle: "Special Vibration Isolator", sourcePath: "uploads/files/20230609/e06516c7e70f0df4447b94fafef9129e.pdf", language: "en", pageNumber: 29, sectionTitle: "JYXR(H) Standard Product Technical Data", specs: { nominalDiameterDn: 40 } },
];

function toImportedSpec(seed: PdfSeedRow, key: string, value: string | number): ImportedSpecValue {
  const parsed = parseCatalogNumber(value);
  return {
    key,
    rawValue: parsed.rawValue,
    valueNumber: parsed.valueNumber,
    valueText: typeof value === "string" ? value : parsed.valueText,
    sourceType: seed.language === "zh-cn" ? "PDF_CHINESE_FULL_CATALOG" : "PDF_ENGLISH",
    sourcePath: seed.sourcePath,
    sourceTitle: seed.sourceTitle,
    language: seed.language,
    pageNumber: seed.pageNumber,
    sectionTitle: seed.sectionTitle,
    confidenceStatus: "PDF_CATALOG_ONLY",
  };
}

export const pdfCatalogRows: ImportedModelRow[] = seedRows.map((seed) => {
  const model = normalizeModelName(seed.model);
  return {
    rawModel: seed.model,
    model,
    seriesCode: seed.seriesCode,
    selectorEligible: isSelectorSeriesCode(seed.seriesCode),
    rawData: seed,
    specs: Object.entries(seed.specs).map(([key, value]) => toImportedSpec(seed, key, value)),
    sourceRefs: [{
      sourceType: seed.language === "zh-cn" ? "PDF_CHINESE_FULL_CATALOG" : "PDF_ENGLISH",
      sourcePath: seed.sourcePath,
      sourceTitle: seed.sourceTitle,
      language: seed.language,
      pageNumber: seed.pageNumber,
      sectionTitle: seed.sectionTitle,
      rawText: JSON.stringify(seed),
      extractionMethod: "manual_pdf_table_seed",
      confidenceStatus: "PDF_CATALOG_ONLY",
    }],
  };
});
```

- [ ] **Step 6: Run parser tests**

Run:

```bash
pnpm tsx --test scripts/catalog-sources/source-parsers.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit parsers**

```bash
git add scripts/catalog-sources/source-types.ts scripts/catalog-sources/excel-products.ts scripts/catalog-sources/pdf-catalogs.ts scripts/catalog-sources/source-parsers.test.ts
 git commit -m "add catalog source parsers"
```

---

### Task 5: Implement guarded catalog import and report generation

**Files:**
- Create: `scripts/catalog-sources/import-report.ts`
- Create: `scripts/import-catalog.ts`
- Modify: `package.json`

- [ ] **Step 1: Create import report writer**

Create `scripts/catalog-sources/import-report.ts`:

```ts
import fs from "node:fs/promises";
import path from "node:path";

export type CatalogImportReport = {
  familyCount: number;
  seriesCount: number;
  modelCount: number;
  modelsBySeries: Record<string, number>;
  selectorEligibleCount: number;
  selectorReadyCount: number;
  selectorIncompleteCount: number;
  selectorConflictCount: number;
  pdfOnlyAbsorberModels: string[];
  excelOnlyAbsorberModels: string[];
  modelsWithoutSourceRefs: string[];
  modelsWithoutSpecs: string[];
  unresolvedIssueCount: number;
};

export async function writeCatalogImportReport(report: CatalogImportReport) {
  const outDir = path.join(process.cwd(), "data/generated");
  await fs.mkdir(outDir, { recursive: true });

  await fs.writeFile(
    path.join(outDir, "catalog-import-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  const markdown = [
    "# Catalog Import Report",
    "",
    `- Families: ${report.familyCount}`,
    `- Series: ${report.seriesCount}`,
    `- Models: ${report.modelCount}`,
    `- Selector eligible: ${report.selectorEligibleCount}`,
    `- Selector ready: ${report.selectorReadyCount}`,
    `- Selector incomplete: ${report.selectorIncompleteCount}`,
    `- Selector conflicts: ${report.selectorConflictCount}`,
    `- Unresolved issues: ${report.unresolvedIssueCount}`,
    "",
    "## Models by Series",
    ...Object.entries(report.modelsBySeries).map(([series, count]) => `- ${series}: ${count}`),
    "",
    "## PDF-only Absorber Models",
    ...(report.pdfOnlyAbsorberModels.length ? report.pdfOnlyAbsorberModels.map((model) => `- ${model}`) : ["- None"]),
    "",
    "## Excel-only Absorber Models",
    ...(report.excelOnlyAbsorberModels.length ? report.excelOnlyAbsorberModels.map((model) => `- ${model}`) : ["- None"]),
    "",
    "## Models Without Source References",
    ...(report.modelsWithoutSourceRefs.length ? report.modelsWithoutSourceRefs.map((model) => `- ${model}`) : ["- None"]),
    "",
    "## Models Without Specs",
    ...(report.modelsWithoutSpecs.length ? report.modelsWithoutSpecs.map((model) => `- ${model}`) : ["- None"]),
    "",
  ].join("\n");

  await fs.writeFile(path.join(outDir, "catalog-import-report.md"), markdown, "utf8");
}
```

- [ ] **Step 2: Create guarded import script**

Create `scripts/import-catalog.ts`:

```ts
import process from "node:process";
import { PrismaClient, type Prisma } from "@prisma/client";
import { catalogFamilySeeds, catalogSeriesSeeds } from "../lib/catalog/catalog-seed-data";
import { catalogSpecSeeds } from "../lib/catalog/spec-definitions";
import { selectorRequiredSpecKeys } from "../lib/catalog/status";
import { sortKeyForModel } from "../lib/catalog/model-normalization";
import { readExcelProductRows } from "./catalog-sources/excel-products";
import { pdfCatalogRows } from "./catalog-sources/pdf-catalogs";
import type { ImportedModelRow } from "./catalog-sources/source-types";
import { writeCatalogImportReport } from "./catalog-sources/import-report";

const prisma = new PrismaClient();

function assertNonProductionDatabase() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const label = process.env.DATABASE_BRANCH ?? process.env.NEON_BRANCH ?? process.env.CATALOG_IMPORT_BRANCH ?? "";
  const allowProduction = process.env.ALLOW_PRODUCTION_CATALOG_IMPORT === "true";
  const looksNonProduction = /branch|dev|staging|preview|test|local/i.test(`${databaseUrl} ${label}`);

  console.log(`Catalog import target label: ${label || "not set"}`);

  if (!looksNonProduction && !allowProduction) {
    throw new Error("Refusing catalog import: DATABASE_URL does not look like a non-production database branch. Set CATALOG_IMPORT_BRANCH or use a branch database URL.");
  }
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function mergeRows(rows: ImportedModelRow[]) {
  const byModel = new Map<string, ImportedModelRow>();
  const issues: Array<{ model: string; specKey: string; message: string; rawJson: unknown }> = [];

  for (const row of rows) {
    const existing = byModel.get(row.model);
    if (!existing) {
      byModel.set(row.model, { ...row, specs: [...row.specs], sourceRefs: [...row.sourceRefs] });
      continue;
    }

    existing.rawData = { sources: [existing.rawData, row.rawData] };
    existing.sourceRefs.push(...row.sourceRefs);

    for (const spec of row.specs) {
      const current = existing.specs.find((item) => item.key === spec.key);
      if (!current) {
        existing.specs.push(spec);
        continue;
      }

      const sameNumber = current.valueNumber !== null && spec.valueNumber !== null && current.valueNumber === spec.valueNumber;
      const sameText = (current.valueText ?? current.rawValue) === (spec.valueText ?? spec.rawValue);
      if (sameNumber || sameText) {
        current.confidenceStatus = "PDF_CATALOG_ONLY";
        continue;
      }

      issues.push({
        model: row.model,
        specKey: spec.key,
        message: `Conflicting values for ${row.model}.${spec.key}: ${current.rawValue} vs ${spec.rawValue}`,
        rawJson: { existing: current, incoming: spec },
      });
    }
  }

  return { rows: [...byModel.values()], issues };
}

async function clearCatalogTables() {
  await prisma.importIssue.deleteMany();
  await prisma.productSpecValue.deleteMany();
  await prisma.productSourceReference.deleteMany();
  await prisma.productModel.deleteMany();
  await prisma.productSpecDefinition.deleteMany();
  await prisma.productSeries.deleteMany();
  await prisma.productFamilyTranslation.deleteMany();
  await prisma.productFamily.deleteMany();
}

async function seedFamilies() {
  const familyIds = new Map<string, string>();

  for (const seed of catalogFamilySeeds) {
    const family = await prisma.productFamily.create({
      data: {
        key: seed.key,
        slug: seed.slug,
        sortOrder: seed.sortOrder,
        catalogStatus: "PUBLISHED",
        translations: {
          create: Object.entries(seed.translations).map(([locale, translation]) => ({
            locale,
            ...translation,
          })),
        },
      },
    });

    familyIds.set(seed.key, family.id);
  }

  return familyIds;
}

async function seedSeries(familyIds: Map<string, string>) {
  const seriesIds = new Map<string, string>();

  for (const seed of catalogSeriesSeeds) {
    const familyId = familyIds.get(seed.familyKey);
    if (!familyId) throw new Error(`Missing family for ${seed.familyKey}`);

    const series = await prisma.productSeries.create({
      data: {
        familyId,
        code: seed.code,
        slug: seed.slug,
        name: seed.name,
        sortOrder: seed.sortOrder,
        selectorEligible: seed.selectorEligible,
        selectorDefaultStatus: seed.selectorEligible ? "INCOMPLETE" : "NOT_APPLICABLE",
        catalogStatus: "PUBLISHED",
        overview: seed.overview,
        workingPrinciple: seed.workingPrinciple,
        constructionNotes: seed.constructionNotes,
        materialNotes: seed.materialNotes,
        applicationNotes: seed.applicationNotes,
        featureNotes: seed.featureNotes,
        sourceSummary: seed.sourceSummary,
      },
    });

    seriesIds.set(seed.code, series.id);
  }

  return seriesIds;
}

async function seedSpecDefinitions(familyIds: Map<string, string>, seriesIds: Map<string, string>) {
  const specIds = new Map<string, string>();

  for (const spec of catalogSpecSeeds) {
    const targetSeriesCodes = spec.seriesCodes?.length ? spec.seriesCodes : [null];

    for (const seriesCode of targetSeriesCodes) {
      const seriesId = seriesCode ? seriesIds.get(seriesCode) : null;
      const familyId = !seriesCode && catalogFamilySeeds[0] ? familyIds.get(catalogFamilySeeds[0].key) : null;
      const created = await prisma.productSpecDefinition.create({
        data: {
          key: spec.key,
          labelEn: spec.labelEn,
          labelZh: spec.labelZh,
          unit: spec.unit,
          dataType: spec.dataType,
          familyId: familyId ?? undefined,
          seriesId: seriesId ?? undefined,
          filterable: spec.filterable,
          comparable: spec.comparable,
          requiredForSelector: spec.requiredForSelector ?? false,
          sortOrder: spec.sortOrder,
        },
      });

      specIds.set(`${seriesCode ?? "GLOBAL"}:${spec.key}`, created.id);
    }
  }

  return specIds;
}

function selectorStatusFor(row: ImportedModelRow) {
  if (!row.selectorEligible) return "NOT_APPLICABLE" as const;

  const present = new Set(row.specs.filter((spec) => spec.valueNumber !== null || spec.valueText).map((spec) => spec.key));
  const ready = selectorRequiredSpecKeys.every((key) => present.has(key));
  return ready ? "READY" as const : "INCOMPLETE" as const;
}

async function createModels(rows: ImportedModelRow[], seriesIds: Map<string, string>, specIds: Map<string, string>) {
  for (const row of rows) {
    const seriesId = seriesIds.get(row.seriesCode);
    if (!seriesId) continue;

    const model = await prisma.productModel.create({
      data: {
        seriesId,
        rawModel: row.rawModel,
        model: row.model,
        sortKey: sortKeyForModel(row.model),
        catalogStatus: "PUBLISHED",
        selectorEligible: row.selectorEligible,
        selectorStatus: selectorStatusFor(row),
        primaryImageUrl: row.primaryImageUrl ?? null,
        rawDataJson: toJson(row.rawData),
      },
    });

    const sourceRefs = [];
    for (const ref of row.sourceRefs) {
      sourceRefs.push(await prisma.productSourceReference.create({
        data: {
          seriesId,
          modelId: model.id,
          sourceType: ref.sourceType,
          sourcePath: ref.sourcePath,
          sourceTitle: ref.sourceTitle,
          language: ref.language,
          pageNumber: ref.pageNumber,
          sectionTitle: ref.sectionTitle,
          rawText: ref.rawText,
          extractionMethod: ref.extractionMethod,
          confidenceStatus: ref.confidenceStatus,
        },
      }));
    }

    for (const spec of row.specs) {
      const specDefinitionId = specIds.get(`${row.seriesCode}:${spec.key}`) ?? specIds.get(`GLOBAL:${spec.key}`);
      if (!specDefinitionId) continue;

      await prisma.productSpecValue.create({
        data: {
          modelId: model.id,
          specDefinitionId,
          valueNumber: spec.valueNumber === null ? undefined : spec.valueNumber.toFixed(6),
          valueText: spec.valueText,
          rawValue: spec.rawValue,
          sourceRefId: sourceRefs[0]?.id,
          confidenceStatus: spec.confidenceStatus,
        },
      });
    }
  }
}

async function main() {
  assertNonProductionDatabase();
  const excelRows = readExcelProductRows();
  const { rows, issues } = mergeRows([...pdfCatalogRows, ...excelRows]);

  await clearCatalogTables();
  const familyIds = await seedFamilies();
  const seriesIds = await seedSeries(familyIds);
  const specIds = await seedSpecDefinitions(familyIds, seriesIds);
  await createModels(rows, seriesIds, specIds);

  for (const issue of issues) {
    const model = await prisma.productModel.findUnique({ where: { model: issue.model } });
    await prisma.importIssue.create({
      data: {
        severity: "WARNING",
        issueType: "SPEC_CONFLICT",
        modelId: model?.id,
        specKey: issue.specKey,
        message: issue.message,
        rawJson: toJson(issue.rawJson),
      },
    });
  }

  const models = await prisma.productModel.findMany({ include: { series: true, specValues: true, sourceReferences: true } });
  const modelsBySeries = Object.fromEntries(
    [...new Set(models.map((model) => model.series.code))].map((code) => [code, models.filter((model) => model.series.code === code).length]),
  );

  await writeCatalogImportReport({
    familyCount: await prisma.productFamily.count(),
    seriesCount: await prisma.productSeries.count(),
    modelCount: models.length,
    modelsBySeries,
    selectorEligibleCount: models.filter((model) => model.selectorEligible).length,
    selectorReadyCount: models.filter((model) => model.selectorStatus === "READY").length,
    selectorIncompleteCount: models.filter((model) => model.selectorStatus === "INCOMPLETE").length,
    selectorConflictCount: models.filter((model) => model.selectorStatus === "CONFLICT").length,
    pdfOnlyAbsorberModels: models.filter((model) => model.selectorEligible && model.sourceReferences.some((ref) => ref.sourceType === "PDF_ENGLISH") && !model.sourceReferences.some((ref) => ref.sourceType === "EXCEL_SELECTOR")).map((model) => model.model),
    excelOnlyAbsorberModels: models.filter((model) => model.selectorEligible && model.sourceReferences.some((ref) => ref.sourceType === "EXCEL_SELECTOR") && !model.sourceReferences.some((ref) => ref.sourceType === "PDF_ENGLISH")).map((model) => model.model),
    modelsWithoutSourceRefs: models.filter((model) => model.sourceReferences.length === 0).map((model) => model.model),
    modelsWithoutSpecs: models.filter((model) => model.specValues.length === 0).map((model) => model.model),
    unresolvedIssueCount: await prisma.importIssue.count(),
  });

  console.log(`Imported ${models.length} catalog models.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: Update package script**

Ensure `package.json` has:

```json
"import:catalog": "tsx scripts/import-catalog.ts"
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS. If old `lib/products/*` fails because schema types were removed, do not restore old models; proceed to Task 6 and replace old product imports.

- [ ] **Step 5: Run import on database branch**

Only run this after confirming `DATABASE_URL` is a non-production database branch.

```bash
CATALOG_IMPORT_BRANCH=dev pnpm import:catalog
```

Expected: script prints target label and imports models. It writes `data/generated/catalog-import-report.json` and `.md`.

- [ ] **Step 6: Commit import pipeline**

```bash
git add package.json scripts/import-catalog.ts scripts/catalog-sources/import-report.ts data/generated/catalog-import-report.json data/generated/catalog-import-report.md
 git commit -m "add guarded catalog import"
```

---

### Task 6: Add catalog schemas, repository, and service

**Files:**
- Create: `lib/catalog/catalog-schemas.ts`
- Create: `lib/catalog/catalog-repository.ts`
- Create: `lib/catalog/catalog-service.ts`
- Modify: `app/api/products/search/route.ts`

- [ ] **Step 1: Create public catalog schemas**

Create `lib/catalog/catalog-schemas.ts`:

```ts
import { z } from "zod";
import { locales } from "@/lib/i18n/config";

export const catalogModelSearchSchema = z.object({
  locale: z.enum(locales).default("en"),
  familySlug: z.string().trim().min(1).optional(),
  seriesSlug: z.string().trim().min(1).optional(),
  seriesCode: z.string().trim().min(1).optional(),
  modelQuery: z.string().trim().min(1).optional(),
  selectorOnly: z.coerce.boolean().default(false),
  includeIncomplete: z.coerce.boolean().default(true),
  minStrokeMm: z.coerce.number().nonnegative().optional(),
  minEnergyPerCycleNm: z.coerce.number().nonnegative().optional(),
  minEnergyPerHourNm: z.coerce.number().nonnegative().optional(),
  minImpactForceN: z.coerce.number().nonnegative().optional(),
  minThrustForceN: z.coerce.number().nonnegative().optional(),
  maxTotalLengthMm: z.coerce.number().nonnegative().optional(),
  threadSize: z.string().trim().min(1).optional(),
  sortBy: z.enum(["model", "series", "selectorStatus", "createdAt"]).default("model"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CatalogModelSearchInput = z.infer<typeof catalogModelSearchSchema>;

export type CatalogSpecListItem = {
  key: string;
  label: string;
  unit: string | null;
  value: number | string | null;
  rawValue: string | null;
};

export type CatalogModelListItem = {
  id: string;
  model: string;
  familySlug: string;
  familyName: string;
  seriesSlug: string;
  seriesCode: string;
  seriesName: string;
  selectorEligible: boolean;
  selectorStatus: string;
  catalogStatus: string;
  primaryImageUrl: string | null;
  specs: CatalogSpecListItem[];
};

export type CatalogModelSearchResult = {
  total: number;
  page: number;
  pageSize: number;
  items: CatalogModelListItem[];
};
```

- [ ] **Step 2: Create repository**

Create `lib/catalog/catalog-repository.ts`:

```ts
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CatalogModelSearchInput } from "@/lib/catalog/catalog-schemas";

const absorberSpecFilterKeys = {
  minStrokeMm: "strokeMm",
  minEnergyPerCycleNm: "energyPerCycleNm",
  minEnergyPerHourNm: "energyPerHourNm",
  minImpactForceN: "maxImpactForceN",
  minThrustForceN: "maxThrustForceN",
  maxTotalLengthMm: "totalLengthMm",
} as const;

function numericSpecFilter(key: string, value: number, mode: "gte" | "lte"): Prisma.ProductModelWhereInput {
  return {
    specValues: {
      some: {
        specDefinition: { key },
        valueNumber: { [mode]: value },
      },
    },
  };
}

function buildWhere(input: CatalogModelSearchInput): Prisma.ProductModelWhereInput {
  const filters: Prisma.ProductModelWhereInput[] = [];

  for (const [inputKey, specKey] of Object.entries(absorberSpecFilterKeys)) {
    const value = input[inputKey as keyof CatalogModelSearchInput];
    if (typeof value === "number") {
      filters.push(numericSpecFilter(specKey, value, inputKey === "maxTotalLengthMm" ? "lte" : "gte"));
    }
  }

  if (input.threadSize) {
    filters.push({
      specValues: {
        some: {
          specDefinition: { key: "threadSize" },
          valueText: { contains: input.threadSize, mode: "insensitive" },
        },
      },
    });
  }

  return {
    isActive: true,
    catalogStatus: { in: ["PUBLISHED", "NEEDS_REVIEW"] },
    ...(input.selectorOnly ? { selectorEligible: true, selectorStatus: input.includeIncomplete ? { in: ["READY", "INCOMPLETE"] } : "READY" } : {}),
    ...(input.familySlug ? { series: { family: { slug: input.familySlug } } } : {}),
    ...(input.seriesSlug ? { series: { slug: input.seriesSlug } } : {}),
    ...(input.seriesCode ? { series: { code: input.seriesCode.toUpperCase() } } : {}),
    ...(input.modelQuery ? { model: { contains: input.modelQuery, mode: "insensitive" } } : {}),
    ...(filters.length ? { AND: filters } : {}),
  };
}

function buildOrderBy(input: CatalogModelSearchInput): Prisma.ProductModelOrderByWithRelationInput {
  if (input.sortBy === "series") {
    return { series: { code: input.sortDirection } };
  }

  if (input.sortBy === "selectorStatus") {
    return { selectorStatus: input.sortDirection };
  }

  if (input.sortBy === "createdAt") {
    return { createdAt: input.sortDirection };
  }

  return { sortKey: input.sortDirection };
}

export async function findCatalogFamilies(locale: string) {
  return prisma.productFamily.findMany({
    where: { isActive: true, catalogStatus: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale } },
      series: { where: { catalogStatus: "PUBLISHED" }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function findCatalogFamilyBySlug(slug: string, locale: string) {
  return prisma.productFamily.findUnique({
    where: { slug },
    include: {
      translations: true,
      series: { where: { catalogStatus: { in: ["PUBLISHED", "NEEDS_REVIEW"] } }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function findCatalogSeriesBySlug(familySlug: string, seriesSlug: string) {
  return prisma.productSeries.findFirst({
    where: { slug: seriesSlug, family: { slug: familySlug } },
    include: {
      family: { include: { translations: true } },
      sourceReferences: true,
      specDefinitions: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function searchCatalogModels(input: CatalogModelSearchInput) {
  const where = buildWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [items, total] = await Promise.all([
    prisma.productModel.findMany({
      where,
      orderBy: buildOrderBy(input),
      skip,
      take: input.pageSize,
      include: {
        series: { include: { family: { include: { translations: true } } } },
        specValues: {
          include: { specDefinition: true },
          orderBy: { specDefinition: { sortOrder: "asc" } },
        },
      },
    }),
    prisma.productModel.count({ where }),
  ]);

  return { items, total };
}

export async function listCatalogThreadSizes() {
  const values = await prisma.productSpecValue.findMany({
    where: { specDefinition: { key: "threadSize" }, valueText: { not: null } },
    select: { valueText: true },
    distinct: ["valueText"],
    orderBy: { valueText: "asc" },
  });

  return values.map((item) => item.valueText).filter((value): value is string => Boolean(value));
}
```

- [ ] **Step 3: Create service mapper**

Create `lib/catalog/catalog-service.ts`:

```ts
import type { Locale } from "@/lib/i18n/config";
import { catalogModelSearchSchema, type CatalogModelListItem, type CatalogModelSearchResult } from "@/lib/catalog/catalog-schemas";
import { searchCatalogModels } from "@/lib/catalog/catalog-repository";

function localizedFamilyName(locale: Locale, translations: Array<{ locale: string; name: string }>, fallback: string) {
  return translations.find((item) => item.locale === locale)?.name ?? translations.find((item) => item.locale === "en")?.name ?? fallback;
}

function mapModel(item: Awaited<ReturnType<typeof searchCatalogModels>>["items"][number], locale: Locale): CatalogModelListItem {
  return {
    id: item.id,
    model: item.model,
    familySlug: item.series.family.slug,
    familyName: localizedFamilyName(locale, item.series.family.translations, item.series.family.slug),
    seriesSlug: item.series.slug,
    seriesCode: item.series.code,
    seriesName: item.series.name,
    selectorEligible: item.selectorEligible,
    selectorStatus: item.selectorStatus,
    catalogStatus: item.catalogStatus,
    primaryImageUrl: item.primaryImageUrl,
    specs: item.specValues.map((value) => ({
      key: value.specDefinition.key,
      label: locale === "zh-cn" ? value.specDefinition.labelZh : value.specDefinition.labelEn,
      unit: value.specDefinition.unit,
      value: value.valueNumber?.toNumber() ?? value.valueText ?? null,
      rawValue: value.rawValue,
    })),
  };
}

export async function catalogModelSearchService(rawInput: unknown): Promise<CatalogModelSearchResult> {
  const input = catalogModelSearchSchema.parse(rawInput);
  const result = await searchCatalogModels(input);

  return {
    total: result.total,
    page: input.page,
    pageSize: input.pageSize,
    items: result.items.map((item) => mapModel(item, input.locale)),
  };
}
```

- [ ] **Step 4: Update product search API**

Replace `app/api/products/search/route.ts` with:

```ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { catalogModelSearchService } from "@/lib/catalog/catalog-service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await catalogModelSearchService(payload);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Invalid product search input.", issues: error.issues }, { status: 400 });
    }

    console.error("Product search failed.", error);
    return NextResponse.json({ message: "Product search failed." }, { status: 500 });
  }
}
```

- [ ] **Step 5: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: old product page/client errors still possible until Task 7; new catalog service files must compile.

- [ ] **Step 6: Commit catalog service**

```bash
git add lib/catalog/catalog-schemas.ts lib/catalog/catalog-repository.ts lib/catalog/catalog-service.ts app/api/products/search/route.ts
 git commit -m "add rebuilt catalog services"
```

---

### Task 7: Replace product and series pages

**Files:**
- Modify: `app/products/page.tsx`
- Modify: `app/products/[familySlug]/page.tsx`
- Create: `app/products/[familySlug]/[seriesSlug]/page.tsx`

- [ ] **Step 1: Replace products page**

Replace `app/products/page.tsx` with:

```tsx
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { findCatalogFamilies } from "@/lib/catalog/catalog-repository";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const families = await findCatalogFamilies("en");

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Product catalog"
        title="PDF-backed shock absorber and vibration isolation catalog"
        description="Browse product families, technical series and model tables rebuilt from EKD catalog PDFs and selector data."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {families.map((family) => {
          const translation = family.translations[0];
          return (
            <Link
              key={family.id}
              href={`/products/${family.slug}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                {translation?.tag ?? "Product family"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{translation?.name ?? family.slug}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{translation?.summary}</p>
              <p className="mt-5 text-sm font-medium text-slate-900">{family.series.length} technical series</p>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: Replace family page**

Replace `app/products/[familySlug]/page.tsx` with:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { findCatalogFamilyBySlug } from "@/lib/catalog/catalog-repository";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ familySlug: string }>;
};

export default async function ProductFamilyPage({ params }: PageProps) {
  const { familySlug } = await params;
  const family = await findCatalogFamilyBySlug(familySlug, "en");

  if (!family) notFound();

  const translation = family.translations.find((item) => item.locale === "en") ?? family.translations[0];

  return (
    <Container className="py-16">
      <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: translation?.name ?? family.slug }]} />

      <div className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{translation?.tag}</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">{translation?.name}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{translation?.description}</p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {translation?.workingPrinciple ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-950">Working principle</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{translation.workingPrinciple}</p>
          </section>
        ) : null}
        {translation?.constructionNotes ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-950">Construction</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{translation.constructionNotes}</p>
          </section>
        ) : null}
        {translation?.applicationNotes ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-950">Applications</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{translation.applicationNotes}</p>
          </section>
        ) : null}
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-slate-950">Series in this family</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {family.series.map((series) => (
            <Link
              key={series.id}
              href={`/products/${family.slug}/${series.slug}`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-slate-950">{series.name}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{series.code}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{series.overview}</p>
              <p className="mt-4 text-sm font-medium text-emerald-700">
                {series.selectorEligible ? "Available for absorber selector" : "Catalog / inquiry product"}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
```

- [ ] **Step 3: Add series page**

Create `app/products/[familySlug]/[seriesSlug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { findCatalogSeriesBySlug, searchCatalogModels } from "@/lib/catalog/catalog-repository";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ familySlug: string; seriesSlug: string }>;
};

export default async function ProductSeriesPage({ params }: PageProps) {
  const { familySlug, seriesSlug } = await params;
  const series = await findCatalogSeriesBySlug(familySlug, seriesSlug);

  if (!series) notFound();

  const models = await searchCatalogModels({
    locale: "en",
    seriesSlug,
    selectorOnly: false,
    includeIncomplete: true,
    sortBy: "model",
    sortDirection: "asc",
    page: 1,
    pageSize: 100,
  });

  const familyName = series.family.translations.find((item) => item.locale === "en")?.name ?? series.family.slug;
  const visibleSpecKeys = series.specDefinitions.slice(0, 8);

  return (
    <Container className="py-16">
      <Breadcrumb items={[
        { label: "Products", href: "/products" },
        { label: familyName, href: `/products/${familySlug}` },
        { label: series.name },
      ]} />

      <div className="mt-8 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{series.code} Series</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">{series.name}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{series.overview}</p>
        <p className="mt-4 text-sm font-medium text-slate-700">
          {series.selectorEligible ? "Selector eligible absorber series" : "Catalog and inquiry series"}
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {series.workingPrinciple ? <InfoCard title="Working principle" body={series.workingPrinciple} /> : null}
        {series.constructionNotes ? <InfoCard title="Construction" body={series.constructionNotes} /> : null}
        {series.applicationNotes ? <InfoCard title="Applications" body={series.applicationNotes} /> : null}
      </div>

      <section className="mt-14 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-950">Technical model table</h2>
          <p className="mt-2 text-sm text-slate-600">{models.total} catalog models imported for this series.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Selector status</th>
                {visibleSpecKeys.map((spec) => (
                  <th key={spec.id} className="px-4 py-3 font-medium">{spec.labelEn}{spec.unit ? ` (${spec.unit})` : ""}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.items.map((model) => (
                <tr key={model.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">{model.model}</td>
                  <td className="px-4 py-3 text-slate-600">{model.selectorStatus}</td>
                  {visibleSpecKeys.map((spec) => {
                    const value = model.specValues.find((item) => item.specDefinition.key === spec.key);
                    return <td key={spec.id} className="px-4 py-3 text-slate-600">{value?.rawValue ?? "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold text-slate-950">Source references</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{series.sourceSummary}</p>
      </section>
    </Container>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </section>
  );
}
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: product page files compile. If errors mention `model.specValues`, align the include type in `searchCatalogModels` before continuing.

- [ ] **Step 5: Commit product pages**

```bash
git add app/products/page.tsx app/products/[familySlug]/page.tsx app/products/[familySlug]/[seriesSlug]/page.tsx
 git commit -m "replace product catalog pages"
```

---

### Task 8: Replace buyer filter with rebuilt catalog results

**Files:**
- Modify: `app/selector/buyer/page.tsx`
- Modify: `components/marketing/buyer-search-client.tsx`

- [ ] **Step 1: Simplify buyer page data dependencies**

Replace `app/selector/buyer/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { BuyerSearchClient } from "@/components/marketing/buyer-search-client";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { listCatalogThreadSizes } from "@/lib/catalog/catalog-repository";
import { getSiteCopy } from "@/lib/i18n/site-copy";

export const metadata: Metadata = {
  title: "Buyer Quick Filter for Shock Absorber and Vibration Isolation Models",
};

export const dynamic = "force-dynamic";

export default async function BuyerQuickFilterPage() {
  const copy = getSiteCopy("en");
  const threadSizes = await listCatalogThreadSizes();

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.buyer.eyebrow}
        title="Buyer quick filter"
        description="Search the rebuilt PDF-backed catalog by model, series and key technical values."
      />

      <div className="mt-12">
        <BuyerSearchClient locale="en" copy={copy.buyer} threadSizeOptions={threadSizes} />
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: Replace buyer client with catalog-aware version**

Replace `components/marketing/buyer-search-client.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { SiteCopy } from "@/lib/i18n/site-copy";
import type { CatalogModelSearchResult } from "@/lib/catalog/catalog-schemas";

const defaultFilters = {
  modelQuery: "",
  seriesCode: "",
  selectorOnly: "false",
  minStrokeMm: "",
  minEnergyPerCycleNm: "",
  minEnergyPerHourNm: "",
  minImpactForceN: "",
  threadSize: "",
};

type BuyerSearchClientProps = {
  locale: Locale;
  copy: SiteCopy["buyer"];
  threadSizeOptions: string[];
};

export function BuyerSearchClient({ locale, copy, threadSizeOptions }: BuyerSearchClientProps) {
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<CatalogModelSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildPayload = useCallback(() => ({
    locale,
    page,
    pageSize: 20,
    includeIncomplete: true,
    ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "")),
  }), [filters, locale, page]);

  const runSearch = useCallback(() => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/products/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
        const data = (await response.json()) as CatalogModelSearchResult & { message?: string };
        if (!response.ok) throw new Error(data.message || copy.errors.searchFailed);
        setResult(data);
      } catch (searchError) {
        setError(searchError instanceof Error ? searchError.message : copy.errors.searchFailed);
      }
    });
  }, [buildPayload, copy.errors.searchFailed]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runSearch, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [runSearch]);

  function updateFilter(key: keyof typeof defaultFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">
            Model
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={filters.modelQuery} onChange={(event) => updateFilter("modelQuery", event.target.value)} placeholder="EK, WR6, HGGN" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Series
            <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={filters.seriesCode} onChange={(event) => updateFilter("seriesCode", event.target.value)} placeholder="EK, EN, WR" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Thread
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={filters.threadSize} onChange={(event) => updateFilter("threadSize", event.target.value)}>
              <option value="">All threads</option>
              {threadSizeOptions.map((thread) => <option key={thread} value={thread}>{thread}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Selector range
            <select className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" value={filters.selectorOnly} onChange={(event) => updateFilter("selectorOnly", event.target.value)}>
              <option value="false">All catalog models</option>
              <option value="true">Absorber selector range</option>
            </select>
          </label>
          <NumberInput label="Min stroke mm" value={filters.minStrokeMm} onChange={(value) => updateFilter("minStrokeMm", value)} />
          <NumberInput label="Min energy / cycle" value={filters.minEnergyPerCycleNm} onChange={(value) => updateFilter("minEnergyPerCycleNm", value)} />
          <NumberInput label="Min energy / hour" value={filters.minEnergyPerHourNm} onChange={(value) => updateFilter("minEnergyPerHourNm", value)} />
          <NumberInput label="Min impact force" value={filters.minImpactForceN} onChange={(value) => updateFilter("minImpactForceN", value)} />
        </div>
        <Button className="mt-6" onClick={runSearch} disabled={isPending}>
          <Search className="mr-2 h-4 w-4" />
          {isPending ? "Searching..." : "Search"}
        </Button>
      </div>

      {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5 text-sm text-slate-600">
          {result ? `${result.total} models found` : "Loading catalog models..."}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Family</th>
                <th className="px-4 py-3 font-medium">Series</th>
                <th className="px-4 py-3 font-medium">Selector</th>
                <th className="px-4 py-3 font-medium">Key specs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result?.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">
                    <Link href={`/products/${item.familySlug}/${item.seriesSlug}`} className="hover:text-emerald-700">{item.model}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.familyName}</td>
                  <td className="px-4 py-3 text-slate-600">{item.seriesCode}</td>
                  <td className="px-4 py-3 text-slate-600">{item.selectorStatus}</td>
                  <td className="px-4 py-3 text-slate-600">{item.specs.slice(0, 4).map((spec) => `${spec.label}: ${spec.rawValue ?? spec.value ?? "—"}`).join(" · ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 p-4">
          <Button variant="outline" disabled={page <= 1 || isPending} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
          <span className="text-sm text-slate-600">Page {page}</span>
          <Button variant="outline" disabled={!result || page * result.pageSize >= result.total || isPending} onClick={() => setPage((current) => current + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" inputMode="decimal" type="number" min="0" step="0.001" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: buyer page and client compile.

- [ ] **Step 4: Commit buyer filter replacement**

```bash
git add app/selector/buyer/page.tsx components/marketing/buyer-search-client.tsx
 git commit -m "replace buyer catalog filter"
```

---

### Task 9: Update calculator selector candidates

**Files:**
- Modify: `lib/calculators/types.ts`
- Modify: `lib/calculators/calculator-service.ts`
- Modify: `lib/calculators/shared.ts` if type imports point to deleted product schemas
- Modify: `lib/selection-logs/selection-log-repository.ts` if selected IDs mapping expects old products

- [ ] **Step 1: Update calculator search result type import**

Modify `lib/calculators/types.ts` so it imports catalog result types:

```ts
import type { CatalogModelSearchInput, CatalogModelSearchResult } from "@/lib/catalog/catalog-schemas";
import type { ProductFamilySlug } from "@/lib/products/product-family-taxonomy";
import type { ScenarioFamilyKey } from "@/lib/scenarios/schemas";

export type ProductSearchFilter = Partial<
  Pick<
    CatalogModelSearchInput,
    | "minStrokeMm"
    | "minEnergyPerCycleNm"
    | "minEnergyPerHourNm"
    | "minImpactForceN"
    | "minThrustForceN"
    | "maxTotalLengthMm"
    | "threadSize"
    | "sortBy"
    | "sortDirection"
    | "page"
    | "pageSize"
  >
>;
```

Also change `CalculateResponse.matches` to:

```ts
matches: CatalogModelSearchResult;
```

Keep the rest of the file unchanged.

- [ ] **Step 2: Update calculator service to use catalog selector search**

In `lib/calculators/calculator-service.ts`, replace:

```ts
import { productSearchService } from "@/lib/products/product-search-service";
```

with:

```ts
import { catalogModelSearchService } from "@/lib/catalog/catalog-service";
```

Replace the matches call with:

```ts
const matches = await catalogModelSearchService({
  ...filter,
  locale: request.locale,
  selectorOnly: true,
  includeIncomplete: false,
  sortBy: "model",
});
```

- [ ] **Step 3: Run calculator regression tests**

Run:

```bash
pnpm test:calculators
```

Expected: PASS. If failures are from sorting expectations, update only expected product shape to new catalog model result; do not change calculator formulas.

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: calculator service compiles.

- [ ] **Step 5: Commit calculator update**

```bash
git add lib/calculators/types.ts lib/calculators/calculator-service.ts lib/calculators/shared.ts lib/selection-logs/selection-log-repository.ts
 git commit -m "use rebuilt catalog for selector candidates"
```

---

### Task 10: Remove old product primary path and fix compile fallout

**Files:**
- Delete if unused: `lib/products/product-repository.ts`
- Delete if unused: `lib/products/product-search-service.ts`
- Delete if unused: `lib/products/product-mappers.ts`
- Delete if unused: `lib/products/schemas.ts`
- Modify imports in any file reported by typecheck

- [ ] **Step 1: Find stale product service imports**

Run:

```bash
rg "lib/products/(product-repository|product-search-service|product-mappers|schemas)|@/lib/products/(product-repository|product-search-service|product-mappers|schemas)" "/Users/maguibo/Work/yundoc/我的同步云盘/出海/source/2026/Shock Selector"
```

Expected: no matches after Tasks 6-9. If matches exist, replace them with `lib/catalog/*` equivalents.

- [ ] **Step 2: Delete old primary product files**

Delete only the old service files, not taxonomy/copy files still used by calculators/site copy:

```bash
rm lib/products/product-repository.ts lib/products/product-search-service.ts lib/products/product-mappers.ts lib/products/schemas.ts
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS. If imports fail, update callers to use `lib/catalog/catalog-schemas`, `lib/catalog/catalog-service`, or `lib/catalog/catalog-repository`.

- [ ] **Step 4: Run all available tests**

Run:

```bash
pnpm test:catalog && pnpm test:calculators
```

Expected: PASS.

- [ ] **Step 5: Commit cleanup**

```bash
git add -A lib/products lib/catalog lib/calculators app components
 git commit -m "remove old product catalog path"
```

---

### Task 11: Verify import report and UI smoke tests

**Files:**
- Generated: `data/generated/catalog-import-report.json`
- Generated: `data/generated/catalog-import-report.md`

- [ ] **Step 1: Run guarded import on branch database**

Run only with branch database URL:

```bash
CATALOG_IMPORT_BRANCH=dev pnpm import:catalog
```

Expected:

- output includes `Catalog import target label: dev`
- output includes `Imported ... catalog models.`
- `data/generated/catalog-import-report.json` exists
- `data/generated/catalog-import-report.md` exists

- [ ] **Step 2: Inspect report for required series**

Run:

```bash
node -e "const r=require('./data/generated/catalog-import-report.json'); for (const s of ['EK','EKL','EN','ES','EI','ED','WR','CR','HGGS','HGGN','JYXR_P','JYXR_H']) { if (!r.modelsBySeries[s]) throw new Error('missing '+s); } console.log(r.modelsBySeries)"
```

Expected: prints a `modelsBySeries` object with all required series keys.

- [ ] **Step 3: Run build checks**

Run:

```bash
pnpm typecheck
pnpm test:catalog
pnpm test:calculators
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 4: Start dev server**

Run:

```bash
pnpm dev
```

Expected: Next.js dev server starts. Keep it running for browser verification.

- [ ] **Step 5: Browser smoke test product catalog**

Open these paths in a browser:

- `http://localhost:3000/products`
- `http://localhost:3000/products/shock-absorbers`
- `http://localhost:3000/products/shock-absorbers/ek-adjustable-shock-absorbers`
- `http://localhost:3000/products/wire-rope-vibration-isolators/wr-wire-rope-vibration-isolators`
- `http://localhost:3000/selector/buyer`
- `http://localhost:3000/selector/engineer`

Expected:

- products page lists rebuilt families
- shock absorber family page lists EK/EN/ES series
- EK series page shows technical table
- WR series page shows catalog-only status and table
- buyer page searches without error
- engineer page loads and calculator calls return only selector-ready records

- [ ] **Step 6: Commit reports if changed intentionally**

```bash
git add data/generated/catalog-import-report.json data/generated/catalog-import-report.md
 git commit -m "update catalog import report"
```

---

### Task 12: Production safety handoff

**Files:**
- Modify: `docs/superpowers/specs/2026-06-09-product-catalog-rebuild-design.md` only if implementation discoveries changed the safety workflow

- [ ] **Step 1: Confirm branch-only migration status**

Run:

```bash
git status --short
```

Expected: no unexpected uncommitted changes except intentional generated reports or docs.

- [ ] **Step 2: Summarize database branch validation**

Record in the final response:

- which database branch/label was used
- migration command run
- import command run
- report path
- smoke-tested pages
- unresolved import issues count

- [ ] **Step 3: Do not apply to production without explicit approval**

Stop here unless the user explicitly approves production migration/import. Do not run production migration/import as part of this plan.

---

## Self-Review

Spec coverage:

- Complete model replacement: Tasks 1, 6, 10.
- PDF and Excel import: Tasks 4, 5, 11.
- PDF-only absorber selector models: Tasks 4, 5, 9, 11.
- Source references and import issues: Tasks 1, 5, 11.
- Database branch safety: Tasks 1, 5, 11, 12.
- Product/family/series pages: Task 7.
- Buyer filter: Task 8.
- Engineer selector ready-only recommendations: Task 9.
- Tests and reports: Tasks 2, 4, 11.

Placeholder scan: no TBD/TODO placeholders remain.

Type consistency: Prisma enum values use uppercase database enum names; service payloads use the same names returned by Prisma. Public schema uses dynamic catalog model result names consistently.
