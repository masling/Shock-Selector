# Project Execution Memory

Last updated: 2026-04-13

## 1. Project North Star

This project is not a traditional corporate website first.

Primary goal:

- Help product-seeking users find suitable products as quickly as possible.

Secondary goal:

- Present company information and product background to build trust after users already see a credible product path.

This means the site structure should stay:

- product discovery first
- sizing as a major path
- company/about content as support, not the homepage lead

## 2. Core Product Positioning

Current agreed positioning:

- EKD corporate website + product catalog + shock absorber sizing MVP

But in actual UX priority:

1. Products
2. Solutions
3. Sizing
4. Applications
5. Downloads
6. About
7. Contact

`Home` should route users into finding products, not into reading company history.

## 3. Design Direction

The visual direction should match Europe / North America industrial users.

Keep:

- modern industrial feel
- restrained layout
- strong hierarchy
- real product / application imagery
- clear CTAs
- calm whitespace
- utility-first product discovery

Avoid:

- traditional Chinese factory website style
- crowded homepage with many boxes
- blue glowing tech gradients
- company-intro-first homepage
- generic SaaS card mosaics

Homepage rule:

- first screen must show product-finding entry points immediately
- `Find Your Product` and `Start Sizing` must be visible early

## 4. Current Information Architecture

Top navigation:

- Products
- Solutions
- Sizing
- Applications
- Downloads
- About
- Contact

Important routes already created:

- `/`
- `/products`
- `/products/[familySlug]`
- `/products/catalog/[id]`
- `/solutions`
- `/selector/engineer`
- `/selector/buyer`
- `/applications`
- `/downloads`
- `/about`
- `/contact`

## 5. Key Documents

Working instruction file kept at repo root:

- `AGENTS.md`

Source material docs moved to:

- `docs/source-materials/PRD.md`
- `docs/source-materials/SCENARIO_DESIGN.md`
- `docs/source-materials/CODEX_PROMPT_FIRST_ROUND.md`
- `docs/source-materials/EKD_SEO_keyword_strategy_en_markets.md`
- `docs/source-materials/EKD_SEO_keywords_master.csv`

Main planning doc:

- `docs/website-v1-requirements-and-plan.md`

This memory file:

- `docs/implementation/project-execution-memory.md`

Multilingual planning doc:

- `docs/implementation/multilingual-requirements.md`

## 6. What Has Been Implemented

### 6.1 Project foundation

- Next.js 15 app structure created
- TypeScript, Tailwind, Prisma, Zod, xlsx installed
- base layout, global styles, navigation, footer created
- content config and reusable UI components created

### 6.2 Product-discovery-first website shell

- homepage built with discovery-first structure
- products page built
- solutions page built
- applications, downloads, about, contact pages built
- engineer sizing skeleton built
- buyer quick filter page built

### 6.3 Local database setup

- Docker CLI installed
- Colima installed and started
- Docker Compose config added
- local PostgreSQL container created and started
- `.env` added with local PostgreSQL connection string

Relevant files:

- `compose.yaml`
- `.env`

### 6.4 Database schema and import

- Prisma schema already existed in `schema.prisma`
- Prisma SQL migration generated manually to `prisma/migrations/0001_init/migration.sql`
- SQL applied directly to PostgreSQL
- Excel import script implemented in `scripts/import-excel.ts`
- imported 197 product rows from `data/选型程序算法.xlsx`
- import result:
  - created: 197
  - updated: 0
  - failed: 0

### 6.5 Buyer search

- Product search schema built with Zod
- repository/service structure created
- `POST /api/products/search` implemented
- buyer page now calls live API
- buyer results table links to live catalog detail route

### 6.6 Database-driven product pages

- `/products` now mixes static family guidance with live DB summary
- `/products/catalog/[id]` uses PostgreSQL data
- product detail shows imported fields and raw data snapshot

### 6.7 Product family grouping + live family stats

- homepage product-family cards now support live imported catalog stats
- `/products/[familySlug]` now supports live imported product grouping and representative models
- product family grouping logic is no longer only static placeholder content
- family grouping is currently resolved in code from imported product `model` prefix + `type`
- live family pages fall back to static curated content if DB is unavailable at runtime

### 6.8 Scenario registry and scenarios API

- scenario registry implemented in code with 5 top-level entry groups
- 7 calculator families registered in the registry
- 19 scenario variants registered for routing / metadata
- 3 variants currently marked as implemented examples in the registry
- `GET /api/scenarios` implemented with query validation and filtering support
- engineer sizing page skeleton now reads live registry counts instead of only hardcoded copy

### 6.9 Calculator service and engineer sizing flow

- unified calculator interface implemented under `lib/calculators`
- initial sample calculators implemented:
  - `linear-free-horizontal`
  - `linear-free-vertical-drop`
  - `linear-motor-horizontal`
- additional top-level-entry calculators implemented so every front-facing entry now has at least one runnable path:
  - `linear-force-horizontal`
  - `linear-cylinder-horizontal`
  - `rotary-horizontal-load`
- shared calculator helpers added for normalization, force / energy calculations and filter generation
- `POST /api/calculate` implemented
- calculator service now validates input, runs the calculator, builds product filter, queries matching products and returns explanations
- engineer sizing page now includes a live client workflow:
  - loads scenarios from `/api/scenarios`
  - exposes the 5 top-level entries
  - lets users choose among implemented variants
  - renders form fields from registry metadata
  - calls `/api/calculate`
  - shows calculation results, generated filter and matched products
- selection logs are now written on a best-effort basis from the calculate flow
- the 5 front-facing motion entries are no longer dead ends; each entry now exposes at least one implemented calculator variant

### 6.10 Link and routing cleanup

- homepage motion-entry strip now links directly into `/selector/engineer` with `entryKey` query params
- homepage application-sector cards now consistently route to `/solutions` instead of mixed placeholder destinations
- hero CTA wording was clarified so product-browsing links and sizing-tool links are less ambiguous

### 6.11 Customer-facing copy pass

- homepage, products, sizing and supporting pages received a customer-facing copy pass
- visibly internal wording such as "live database", "routing layer", "raw data snapshot" and implementation-status phrasing was removed from user-facing surfaces
- header, footer and section descriptions were tightened so the site reads as an external industrial product site rather than a development-stage prototype

### 6.12 Content sourcebook and page-copy drafts

- added a local website copy sourcebook under `docs/content`
- consolidated content inputs from planning docs, SEO materials, Excel scenario/product data, and two local training PPT files
- old-site homepage, about, downloads, and contact pages were fetched and summarized into dedicated legacy-content notes
- full local mirror of the old site under `/Users/maguibo/Downloads/ekdcn.com` was inspected for product-center taxonomy and detailed category descriptions
- added a product taxonomy and naming recommendation document to separate phase-1 core families from secondary product lines and service/capability pages
- PDF catalog files are still locally present, but full readable text extraction remains limited in this environment
- added an English page-copy draft document for homepage, products, solutions, applications, sizing, downloads, about, and contact pages

### 6.13 Product-center taxonomy alignment

- `lib/content/site.ts` was expanded from a flat MVP family list into grouped product-center metadata
- `/products` now renders grouped sections for shock absorbers, buffers, vibration isolators, advanced damping systems, and auxiliary mechanical components
- additional legacy product families were added to the site content layer:
  - anti-impact compound vibration isolators
  - all-metal equal-stiffness vibration isolators
  - steel mesh pad & rubber vibration isolators
  - special vibration isolators
  - fluid viscous dampers
  - tuned mass damper systems
  - particle dampers
  - friction spring dampers
  - locking assemblies & couplings
- service-style legacy categories are no longer mixed into family cards; they are represented as related capability links instead
- homepage family cards remain intentionally focused on the core families that best match the current sizing story and imported catalog coverage

## 7. Important Technical Decisions

### 7.1 Product pages are hybrid for now

Current strategy:

- product families are still content-config driven
- imported product records are database-driven

Reason:

- first version needs both curated product-family messaging and real searchable catalog data

### 7.2 Prisma migration workaround

`prisma migrate dev` currently fails in this environment with:

- `Schema engine error`

But:

- `prisma validate` works
- SQL migration generation works
- manual SQL application to PostgreSQL works
- Prisma client queries work at runtime

Current workaround:

1. generate SQL via `prisma migrate diff`
2. apply SQL directly to PostgreSQL

Do not assume `prisma migrate dev` is reliable yet.

### 7.3 Build-time DB resilience

`/products` has a fallback path if DB is unavailable during build.

Reason:

- static build should not fail just because local PostgreSQL is offline

### 7.4 Product-family grouping strategy

Current strategy:

- keep curated family marketing/content metadata in `lib/content/site.ts`
- derive live imported family stats through a centralized taxonomy layer
- do not scatter family grouping heuristics across pages or API routes

Current working mapping assumption from imported Excel data:

- `EK` / `EKL` -> adjustable shock absorbers
- `EN` -> non-adjustable shock absorbers
- `ED` -> heavy-duty shock absorbers
- `EI` -> heavy industry buffers
- `ES` -> super long life shock absorbers

Important note:

- imported Excel `类型` currently only shows two values in the checked dataset: `固定型` and `可调型`
- this means stronger family grouping currently depends on model-prefix heuristics
- if future imports expose more explicit family fields, migrate the taxonomy to use those fields first

### 7.5 Scenario registry-first approach

Current strategy:

- scenario metadata is code-registered first, not DB-seeded first
- registry is the source of truth for engineer-page routing metadata in the current phase
- database `Scenario` / `ScenarioFamily` tables remain available for later sync or admin tooling

Reason:

- this keeps the MVP moving without blocking on DB seeding for all scenario metadata
- it also preserves the required layered architecture for calculators and APIs

### 7.6 Calculator implementation rule for the MVP

Current strategy:

- the MVP calculators are structurally correct first, not Excel-perfect first
- formulas live only in calculator modules, never in React page components
- shared filter-building logic is centralized so engineer results and product matching stay aligned

Reason:

- this follows the repo rule of landing the smallest runnable version first
- it keeps later Excel-formula refinement localized to calculator modules instead of API or UI code

### 7.7 Entry-linking rule

Current strategy:

- homepage and other routing surfaces should send sizing-intent users directly into the engineer flow with enough context to preselect an entry when possible
- generic routing pages such as `/solutions` should not send users to unrelated placeholder destinations

Reason:

- the site is supposed to reduce routing friction, not add one more generic hop

### 7.8 Customer-facing copy rule

Current strategy:

- all visible page copy should read as external-facing product, application or sizing guidance
- avoid developer-facing phrases such as implementation status, internal architecture language, database terminology or prototype framing in the UI

Reason:

- this project is already being used as a customer-facing site shell
- wording that sounds internal weakens trust even when the underlying functionality works

### 7.9 Content-production rule

Current strategy:

- page writing should be driven by a local sourcebook, not by ad hoc UI editing
- content evidence, reusable claims, page drafts, and verification gaps should be documented separately

Reason:

- this makes later page production faster and more consistent
- it reduces the chance of unsupported sales claims leaking into customer-facing pages

### 7.10 Legacy-content usage rule

Current strategy:

- old-site wording can be used as a direct reference for product-family terminology, trust signals, downloads structure, and contact details
- old-site claims that sound promotional or competitive should still be filtered before reuse

Reason:

- the old site contains real public-facing EKD wording that is more authoritative than internal planning guesses
- not every old claim should be carried forward unchanged into the new site

### 7.11 Product-center architecture rule

Current strategy:

- keep `/products` broader than the homepage
- treat real product lines as grouped family pages
- treat solution, replacement, and manufacturing offerings as related capability links instead of product-family cards

Reason:

- this preserves the stronger legacy product-center breadth without weakening the homepage and sizing story
- it also keeps the information architecture closer to actual buying intent

## 8. Current Environment State

Local DB stack in use:

- Colima runtime
- PostgreSQL container name: `shock-selector-postgres`
- DB name: `shock_selector`
- user: `postgres`
- password: `postgres`
- port: `5432`

Connection string currently used:

- `postgresql://postgres:postgres@localhost:5432/shock_selector`

Important note:

- some commands needed escalated permission because Docker socket and Colima state live outside workspace

## 9. Known Issues / Gotchas

### 9.1 Prisma migrate

- `pnpm prisma migrate dev --name init --schema ./schema.prisma` fails with `Schema engine error`
- do not rely on it blindly

### 9.2 tsx import runtime

- `pnpm import:excel` may need elevated permissions in this environment because `tsx` creates a local IPC pipe
- direct env injection was required during execution in this session

### 9.3 Build-time DB access

- Next.js build may not reach local DB in some sandboxed contexts
- keep fallback behavior for DB-dependent pages

### 9.4 Docker config

- Docker CLI originally pointed to `credsStore: desktop`
- that blocked image pulls under Colima
- config was changed to remove Docker Desktop credential helper

### 9.5 Environment-dependent DB verification

- code paths for homepage family stats and `/products/[familySlug]` live grouping are implemented
- in this session, direct runtime DB verification could not complete when `DATABASE_URL` was not present in the shell environment
- keep DB-dependent pages resilient and do not assume shell verification means the app runtime is misconfigured

### 9.6 tsx sandbox nuance

- `pnpm tsx` may fail in sandboxed verification because of local IPC pipe permissions
- `node --import tsx --input-type=module` worked as a fallback for registry spot checks in this session

### 9.7 Calculate API verification dependency

- calculator modules and registry wiring were spot-checked without DB access
- full `/api/calculate` runtime verification still depends on a working `DATABASE_URL` because product matching uses Prisma-backed search
- if engineer flow fails in app runtime, verify DB connectivity before assuming calculator logic is wrong

## 10. Current Stage

Current stage is:

- foundation complete
- local DB available
- Excel products imported
- buyer search live
- products page partially database-driven
- homepage product-family cards partially database-driven
- product-family detail pages partially database-driven
- scenario registry implemented
- `GET /api/scenarios` implemented
- calculator service implemented
- `POST /api/calculate` implemented
- 6 implemented calculators available across the 5 front-facing entry groups
- engineer page has dynamic form + live calculate flow

Not yet complete:

- selection logs flow
- full runtime verification of engineer flow against live DB
- additional scenario calculators beyond the current first-pass coverage
- possible DB sync for scenario metadata

## 11. Next Recommended Steps

Recommended next execution order:

1. verify the engineer flow end to end against the live PostgreSQL environment for all 5 entry groups
2. harden selection log behavior and decide whether more explicit log review tooling is needed
3. refine the current first-pass calculators toward Excel parity as formula details are confirmed
4. decide whether product family taxonomy should stay heuristic or be persisted during import
5. improve product detail content with related products and application hints
6. implement more vertical / assisting / opposing / beam / table variants on top of the current calculator interface
7. consider syncing registry metadata into `ScenarioFamily` / `Scenario` tables if needed later
8. polish engineer UI with a richer wizard once more variants are enabled

## 12. Rules To Preserve In Future Sessions

Do not drift into:

- company-intro-first homepage
- generic corporate website structure
- heavy marketing animation
- 19 flat scenario pages
- formulas in page components
- scattered query logic inside page files

Keep enforcing:

- layered architecture
- product discovery first
- sizing as key differentiator
- content clarity for European / North American users
- maintainable migration path from Excel to structured online logic

## 13. Quick Restart Prompt

If a new session needs a fast restart, use this summary:

`This repo is an EKD product-discovery-first industrial website MVP with sizing capability. The homepage and navigation must prioritize helping users find suitable products before company intro content. A local PostgreSQL database is already set up via Colima + Docker Compose, Excel products have been imported (197 rows), buyer search is live, homepage and product-family pages now use partial live family stats/grouping, and a code-based scenario registry plus GET /api/scenarios are implemented. The MVP calculator layer is also in place: 3 sample calculators are registered, POST /api/calculate exists, and the engineer sizing page now loads scenario metadata, renders dynamic fields and shows calculated matches. Next focus is live DB verification, log hardening, and extending more calculators on the same architecture. Read docs/implementation/project-execution-memory.md and docs/website-v1-requirements-and-plan.md first.`
