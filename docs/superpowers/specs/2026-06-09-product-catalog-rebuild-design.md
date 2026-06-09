# Product Catalog Rebuild Design

## Goal

Replace the current absorber-only product database with a complete catalog model that can support:

- shock absorber selection
- buyer filtering
- product-family pages
- product-series pages
- PDF-backed technical product libraries
- source traceability and import quality reports

This is a one-time replacement, not a gradual parallel migration. The old absorber-only `Product` model should be removed or renamed out of the primary path during the migration, and product pages/services should read from the rebuilt catalog tables only.

## Source Materials

Primary catalog sources:

1. Four English legacy PDFs from `download_en.html`:
   - Shock Absorber
   - Heavy Duty Shock Absorber
   - Wire Rope Vibration Isolator
   - Special Vibration Isolator
2. `data/EKD全本样册.pdf`
3. `data/选型程序算法.xlsx`

Source roles:

- PDFs are the primary source for the complete product catalog.
- The Chinese full catalog supplements and cross-checks the English PDFs with Chinese copy, page ranges, and full-series coverage.
- The Excel workbook is a high-confidence selector-data source, but it is incomplete and must not define the full model library.

## Product Scope

The initial rebuilt catalog must cover these series:

- EK / EKL adjustable hydraulic shock absorbers
- EN non-adjustable hydraulic shock absorbers
- ES super long life non-adjustable hydraulic shock absorbers
- EI heavy industry buffers
- ED heavy duty shock absorbers
- WR wire rope vibration isolators
- CR compact wire rope vibration isolators
- HGGS stainless steel wire rope vibration isolators
- HGGN anti-impact compound vibration isolators
- JYXR(P) single-flanged balanced flexible connecting pipes
- JYXR(H) single-flanged flexible connecting pipes with large deflection capability

Selector-eligible series:

- EK / EKL
- EN
- ES
- EI
- ED

Catalog-only series for the current absorber selector:

- WR
- CR
- HGGS
- HGGN
- JYXR(P)
- JYXR(H)

Absorber selector eligibility is based on series scope and data readiness, not on whether a model exists in the Excel workbook.

## Data Model

### ProductFamily

Represents a large product category such as Shock Absorbers, Heavy Duty Shock Absorbers, Wire Rope Vibration Isolators, Special Vibration Isolators, and Flexible Pipe Connections.

Core fields:

- key
- slug
- sortOrder
- isActive
- catalogStatus
- translations
- assets

Translations include:

- locale
- name
- tag
- summary
- description
- applicationNotes
- workingPrinciple
- constructionNotes
- featureNotes
- seoSummary

### ProductSeries

Represents a technical product series such as EK, EN, ED, WR, HGGS, or JYXR(P).

Core fields:

- familyId
- code
- slug
- name
- sortOrder
- selectorEligible
- catalogStatus
- selectorDefaultStatus
- overview
- workingPrinciple
- constructionNotes
- materialNotes
- applicationNotes
- sourceSummary

### ProductModel

Represents one catalog model or variant.

Core fields:

- seriesId
- rawModel
- model
- sortKey
- catalogStatus
- selectorStatus
- selectorEligible
- isActive
- primaryImageUrl
- rawDataJson

`selectorStatus` values:

- `not_applicable`
- `ready`
- `incomplete`
- `conflict`

`catalogStatus` values:

- `published`
- `draft`
- `needs_review`

### ProductSpecDefinition

Defines a spec field at the family or series level.

Core fields:

- key
- labelEn
- labelZh
- unit
- dataType
- appliesToFamilyId
- appliesToSeriesId
- filterable
- comparable
- sortOrder

Examples:

- strokeMm
- optimalVelocityRange
- energyPerCycleNm
- energyPerHourNm
- maxImpactForceN
- maxThrustForceN
- totalLengthMm
- threadSize
- weightKg
- maxStaticLoadN
- vibrationStiffnessNPerM
- shockStiffnessNPerM
- maxDeflectionMm
- mountingOption
- cableDiameterMm
- loopCount
- nominalDiameterDn
- flangeOuterDiameterMm
- boltHolePattern
- interfaceStandard

### ProductSpecValue

Stores model-specific values for any spec definition.

Core fields:

- modelId
- specDefinitionId
- valueNumber
- valueText
- valueJson
- rawValue
- sourceRefId
- confidenceStatus

`confidenceStatus` values:

- `verified_by_pdf_and_excel`
- `pdf_catalog_only`
- `excel_selector_only`
- `conflict_needs_review`
- `needs_review`

### ProductSourceReference

Tracks where a value, model, series, or description came from.

Core fields:

- sourceType
- sourcePath
- sourceTitle
- language
- pageNumber
- sectionTitle
- rawText
- extractionMethod
- confidenceStatus

Source types:

- `PDF_ENGLISH`
- `PDF_CHINESE_FULL_CATALOG`
- `EXCEL_SELECTOR`
- `MANUAL_SEED`

### ImportIssue

Records import warnings and data conflicts.

Core fields:

- severity
- issueType
- modelId
- seriesId
- specKey
- message
- sourceRefs
- rawJson

## Import Workflow

Replace the current Excel-only import with a multi-source catalog import.

Recommended entry point:

- `scripts/import-catalog.ts`

Supporting modules:

- `scripts/catalog-sources/excel-products.ts`
- `scripts/catalog-sources/pdf-catalogs.ts`
- `scripts/catalog-sources/seed-series-copy.ts`
- `scripts/catalog-sources/model-normalization.ts`
- `scripts/catalog-sources/import-report.ts`

### Import Source Rules

PDF catalog data drives the complete product library.

For absorber selector series, PDF-only models must be imported even if the Excel workbook does not contain them.

Excel data supplements and validates selector-relevant fields. It must not be treated as the complete product database.

If Excel and PDF both contain a model:

- merge fields
- keep all source references
- mark matching values as `verified_by_pdf_and_excel`
- create `ImportIssue` records for conflicting values

If PDF contains an absorber model but required selector fields are missing:

- import the model
- set `selectorEligible = true`
- set `selectorStatus = incomplete`
- allow catalog and buyer visibility
- exclude it from final engineer recommendations until required fields are complete

If Excel contains an absorber model not matched in PDFs:

- import the model
- set confidence to `excel_selector_only`
- keep it visible for selector review
- include in selector only if required fields are present

WR, CR, HGGS, HGGN, JYXR(P), and JYXR(H) are catalog/inquiry products in this phase and must use `selectorStatus = not_applicable`.

### Database Branch Safety

Catalog rebuild and import must not run directly against the production database.

Required workflow:

1. Create or select a non-production database branch before schema migration and bulk import.
2. Run Prisma migration against the database branch.
3. Run `scripts/import-catalog.ts` against the database branch.
4. Review the generated import report.
5. Smoke-test product pages, buyer filter, and engineer selector against the branch.
6. Only after approval, apply the migration/import process to production using an explicit user-approved step.

The import script should print the target database branch or connection label before making changes. If the target cannot be identified as a non-production branch, the script should refuse to run unless an explicit override is provided.

## Data Cleaning Rules

### Model Normalization

Store both:

- `rawModel`: the exact source text
- `model`: normalized display/search model
- `sortKey`: stable technical sort key

Normalization examples:

- `EK 10x7 (B)` remains display-safe
- `EK(L) 33x25` should preserve combined variant meaning
- `WR6-400-10` should preserve dash structure
- `HGGN16-206` should preserve HGGN size and variant
- `JYXR(P)XXX100X-LEA` should preserve placeholder structure

### Unit Handling

Keep normalized units in `ProductSpecDefinition.unit` and original text in `ProductSpecValue.rawValue`.

Use metric units from the catalogs:

- mm
- m/s
- Nm/C
- Nm/h
- N
- kN
- kg
- g
- kN/m

### Conflict Handling

Do not silently overwrite conflicting values.

When a conflict is detected:

- choose a provisional displayed value using deterministic source priority
- preserve both source values in raw data
- create an `ImportIssue`
- mark the affected field as `conflict_needs_review`
- set model `selectorStatus = conflict` if the field affects selector recommendations

## Page and API Replacement

### Catalog services

Replace old product services with catalog-oriented services:

- family catalog service
- series detail service
- model search service
- selector candidate service

### `/products`

Read from the new family and series tables.

Display grouped product architecture:

- Shock Absorbers
- Heavy Duty Buffers
- Wire Rope Vibration Isolators
- Special Vibration Isolators
- Flexible Pipe Connections

### `/products/[familySlug]`

Show family-level content:

- overview
- applications
- construction or principle summary
- related series cards
- representative models
- PDF/source resources

### `/products/[familySlug]/[seriesSlug]`

Add a series-detail page.

Show:

- series overview
- working principle
- construction/materials
- features and benefits
- applications
- technical model table
- source PDF references
- selector eligibility status

### `/selector/buyer`

Use the new model search service.

Support dynamic filters based on spec definitions:

- absorber specs for shock absorber families
- isolator specs for vibration isolators
- pipe specs for JYXR products

Buyer view may show `incomplete` records, but must mark them clearly as parameter-incomplete.

### `/selector/engineer`

Use the new selector candidate service.

Only recommend models where:

- `selectorEligible = true`
- `selectorStatus = ready`

Models with `selectorStatus = incomplete` may be shown as catalog matches needing parameter completion, but must not be final automatic recommendations.

## Import Report

Generate:

- `data/generated/catalog-import-report.json`
- `data/generated/catalog-import-report.md`

Report must include:

- family count
- series count
- model count per series
- selector eligible model count
- selector ready count
- selector incomplete count
- conflict count
- PDF-only absorber models
- Excel-only absorber models
- models without source references
- models without specs
- unresolved import issues

## Testing Strategy

### Parser tests

Cover:

- model normalization
- numeric parsing
- unit parsing
- source reference creation
- conflict detection

### Repository and service tests

Cover:

- family queries
- series queries
- model search
- dynamic spec filters
- selector ready/incomplete filtering

### Calculator regression tests

Existing absorber formulas should not change.

The selector candidate source changes, but calculations must still only recommend models with complete required selector fields.

### Page smoke tests

Verify:

- `/products`
- `/products/[familySlug]`
- `/products/[familySlug]/[seriesSlug]`
- `/selector/buyer`
- `/selector/engineer`

### Import acceptance checks

Verify:

- EK / EKL imports models
- EN imports models
- ES imports models
- EI imports models
- ED imports models
- WR imports models
- CR imports models
- HGGS imports models
- HGGN imports models
- JYXR(P) imports models
- JYXR(H) imports models
- PDF-only absorber models are not dropped
- Excel-only absorber models are not dropped
- conflicts are reported instead of silently overwritten

## Success Criteria

- The catalog no longer depends on the old absorber-only `Product` model as its primary structure.
- Product center shows the complete PDF-backed product architecture.
- Series pages show introductions, working principles, construction/process notes, product tables, and source references.
- Buyer filtering can search the rebuilt catalog.
- Engineer selector only recommends selector-ready absorber models.
- PDF-only absorber models are imported and tracked.
- Import reports clearly identify incomplete and conflicting data.
- Database migration/import is tested on a database branch before production approval.
