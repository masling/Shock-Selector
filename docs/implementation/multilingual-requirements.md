# Multilingual Requirements

Last updated: 2026-04-15

## 1. Purpose

This document defines the requirements for turning the current single-language EKD MVP into a multilingual website that can serve the intended Europe / North America markets while also providing a Chinese version.

It is based on the current workspace status and rules summarized in `docs/implementation/omx-workspace-guide.md`.

The goal is not only to translate page copy, but to make the following parts localization-ready:

- route structure and SEO metadata
- shared navigation and page copy
- engineer sizing flow labels and messages
- buyer quick-filter labels and messages
- product-facing display fields that are currently tied to imported Chinese source values

## 2. Current State Summary

The current site is effectively English-first and single-locale:

- the root layout is fixed to `lang="en"`
- shared navigation and product-family content live in `lib/content/site.ts` as hardcoded English text
- page-level copy is hardcoded directly in App Router pages and client components
- engineer sizing text is hardcoded in `components/selector/engineer-sizing-client.tsx`
- buyer quick-filter text is hardcoded in `components/marketing/buyer-search-client.tsx`
- scenario entry / family / field labels are hardcoded in `lib/scenarios/registry.ts`
- no i18n library or message-loading layer is installed yet

The data layer is also only partially language-neutral:

- `Product.type` currently stores imported source text such as `固定型` and `可调型`
- product-family grouping still depends partly on Chinese raw values from the Excel import
- `rawDataJson` preserves the original Chinese Excel row, which is useful for traceability but should not become the direct source of multilingual UI labels
- `ScenarioFamily` and `Scenario` only have single-language `name` / `description` style fields in the database schema

## 3. Locale Strategy

### 3.1 Supported locale set

The architecture should be designed to support these locales:

- `en`
- `zh-CN`
- `de`
- `fr`
- `it`

### 3.2 Delivery priority

Recommended rollout:

1. `en` as the public default locale
2. `zh-CN` as the Chinese version requested for current business and internal usage
3. `de` as the first Europe-focused translated market
4. `fr` and `it` as later expansion locales

This matches the existing SEO document, which already identifies English as the primary launch language and German, French, and Italian as the next market locales.

### 3.3 Practical requirement

Even if only `en` and `zh-CN` are filled out first, the route structure, message organization, metadata generation, and fallback behavior must be designed for all 5 locales from the start.

## 4. Scope

The multilingual project should cover the full customer-facing shell, not just marketing copy.

### 4.1 In scope

- homepage
- Products / family / catalog detail pages
- Solutions / Applications / Downloads / About / Contact pages
- shared header, footer, CTAs, badges, empty states, and error messages
- buyer quick-filter page and results table labels
- engineer sizing page, including scenario entry names, variant names, field labels, result labels, and user-facing messages
- page `metadata`, `title`, `description`, and `html lang`
- locale-aware internal links and language switching
- `hreflang`, sitemap, and canonical strategy

### 4.2 Not in scope for the first multilingual pass

- translating internal API field names
- translating calculator keys, scenario keys, or Prisma enum values
- localizing product model numbers
- localizing route slugs per language
- building a CMS or translation admin backend

These can be revisited later, but should not block the first multilingual implementation.

## 5. Routing And SEO Requirements

### 5.1 Route strategy

Use locale-prefixed routes in App Router:

- `/en/...`
- `/zh-cn/...`
- `/de/...`
- `/fr/...`
- `/it/...`

Recommended rule:

- keep the same route shape under every locale
- keep product family slugs and catalog ids stable across locales in phase 1
- redirect bare `/` to the default locale or serve the default locale through middleware consistently

### 5.2 SEO requirements

For each localized page, the system must support:

- localized `title` and `description`
- `html lang` matching the active locale
- `alternates.languages` / `hreflang`
- locale-aware canonical URLs
- sitemap coverage for each locale

### 5.3 Content consistency rule

English should remain the base content source for route naming, metadata structure, and translation keys.

Translated copy should change visible text and SEO fields, but should not create a second routing architecture in the first phase.

## 6. UI And Content Requirements

### 6.1 Shared content layer

The current `lib/content/site.ts` mixes:

- stable structural data
- product-family metadata
- user-facing English copy

This should be split conceptually into:

1. stable identifiers and page structure
2. locale-specific messages
3. reusable content blocks per locale

Requirement:

- structure keys remain language-neutral
- visible labels, summaries, descriptions, highlights, and CTA text move into locale message files or locale content modules

### 6.2 Engineer sizing flow

The engineer flow cannot stay as raw English strings inside React components or registry definitions.

Requirement:

- scenario entry names and descriptions must be localizable
- scenario family guide-question labels and option labels must be localizable
- input field labels and unit labels must be localizable
- result labels, empty states, loading text, and error text must be localizable
- calculator logic remains language-neutral

Important design rule:

- calculators should not return final English explanation sentences as the only output format
- prefer explanation keys or explanation fragments that can be rendered through locale-aware templates

This avoids having to translate dynamic result sentences after calculation.

### 6.3 Buyer quick-filter flow

Requirement:

- filter labels and helper text must be localized
- table headers and empty states must be localized
- the API payload keys remain English and stable

This means the UI can show translated labels while posting the same canonical request fields such as `minStrokeMm` and `threadSize`.

### 6.4 Number and unit handling

Because Europe is in scope, the multilingual plan must consider locale-specific number behavior.

Requirement:

- numeric display formatting should be locale-aware
- forms should tolerate both `.` and `,` decimal input where practical
- units should stay technically consistent and should not be silently changed by locale

## 7. Data And Database Design Requirements

### 7.1 General rule

Technical product data should stay language-neutral wherever possible.

Numeric fields such as:

- `strokeMm`
- `energyPerCycleNm`
- `energyPerHourNm`
- `maxImpactForceN`
- `maxThrustForceN`
- `totalLengthMm`

do not need multilingual storage.

The multilingual design problem is mainly about:

- display text
- classification labels
- scenario text metadata
- SEO/content copy

### 7.2 Product data recommendation

Current risk:

- `Product.type` is storing raw imported text and is already affecting UI display and family grouping

Requirement:

- stop relying on raw Chinese source text as the long-term display or grouping field
- introduce canonical classification fields for stable logic

Recommended additions for product data:

- `typeCode` for stable values such as `ADJUSTABLE`, `NON_ADJUSTABLE`, `HEAVY_DUTY`, `BUFFER`, `ISOLATOR`
- optional `seriesCode` or `familySlug` if the imported dataset can support more explicit grouping
- keep `type` as raw imported source text for traceability during the transition
- keep `rawDataJson` unchanged as source evidence

This allows:

- search filters to work on stable codes
- UI to show locale-specific labels
- import logic to keep original Excel values without leaking them into the frontend

### 7.3 Scenario data recommendation

Current state:

- scenario registry is code-first
- database `ScenarioFamily` and `Scenario` tables are present but not yet the live source of multilingual UI text

Recommended rule for the MVP:

- keep scenario translations in code-level locale resources first
- keep scenario keys, family keys, enums, and formula metadata language-neutral

If scenario metadata later moves into the database for admin editing, prefer dedicated translation tables over many inline JSON blobs.

Recommended future tables:

- `ScenarioFamilyTranslation`
- `ScenarioTranslation`

Suggested fields:

- `locale`
- `name`
- `description`
- localized `guideQuestions`
- localized input/output display schema

Reason:

- easier validation
- clearer fallback behavior
- better queryability than opaque JSON-only text storage

### 7.4 Selection log recommendation

Add locale awareness to selection logs in a later schema pass.

Recommended field:

- `locale`

This will help analyze:

- which markets use engineer sizing vs buyer quick filter
- which locales have the highest no-match rate
- where translation quality or missing copy affects conversion

## 8. Import And Mapping Requirements

The Excel import pipeline should remain source-preserving, but it needs a clearer canonical mapping layer.

Requirement:

- import Chinese source columns exactly as today for raw traceability
- map source text to canonical fields during import
- tolerate row-level errors without stopping the full import

Recommended import behavior:

1. read raw Chinese Excel headers
2. normalize known values such as `固定型` and `可调型` into canonical `typeCode`
3. preserve the original row in `rawDataJson`
4. never use localized UI labels as imported canonical values

This keeps the import stable even when more locales are added later.

## 9. Translation Resource Strategy

For the current MVP stage, use file-based translations instead of a database-driven translation CMS.

Recommended organization:

- `messages/en/...`
- `messages/zh-CN/...`
- `messages/de/...`
- `messages/fr/...`
- `messages/it/...`

Suggested grouping:

- `common`
- `navigation`
- `home`
- `products`
- `selector`
- `scenarios`
- `metadata`

Important rule:

- translation keys should be based on stable business meaning, not current English sentences

Example direction:

- `selector.engineer.chooseMotionCase`
- `selector.buyer.searchProducts`
- `productType.adjustable`

not keys copied from full English paragraph text.

## 10. Recommended Implementation Phases

### Phase A: Architecture foundation

- choose the i18n solution for Next.js App Router
- add locale-prefixed routing
- add message loading, locale context, and language switcher
- make metadata locale-aware

### Phase B: Shared shell and page copy

- migrate header, footer, homepage, and all main pages to locale messages
- move product-family content out of hardcoded single-language copy

### Phase C: Selector flows

- localize buyer page
- localize engineer page
- refactor scenario registry copy into locale resources
- refactor calculator explanations into localizable output keys/templates

### Phase D: Data normalization

- add canonical product classification fields
- update import script to fill them
- stop using raw Chinese `type` values as UI-facing labels

### Phase E: Secondary locales

- ship `de`
- then add `fr` and `it`
- expand SEO metadata and content quality review per market

## 11. Acceptance Criteria

The multilingual requirements can be considered met for phase 1 when:

- the site can render at least `en` and `zh-CN` through locale-prefixed routing
- all shared navigation, page copy, and primary CTA text are locale-aware
- buyer and engineer flows show localized labels and messages
- page metadata and `html lang` follow the selected locale
- product display labels no longer depend directly on raw Chinese import values
- untranslated content falls back predictably to the default locale instead of breaking the page

## 12. Open Questions

These questions should be confirmed before implementation starts:

1. Should `zh-CN` be public at the same time as `en`, or only enabled for internal review first?
2. In phase 1, do we only localize UI copy, or do we also provide localized SEO metadata for `zh-CN` immediately?
3. Are PDF downloads and catalog assets language-specific, or will the first multilingual release still point to shared files?
4. Should European locales use English route slugs in phase 1, or do we want localized slugs in a later SEO phase?

## 13. Recommended Decision

For the current project stage, the best balance between speed and maintainability is:

- build the architecture for `en`, `zh-CN`, `de`, `fr`, `it`
- fully implement `en` and `zh-CN` first
- keep translation resources file-based
- keep technical data language-neutral
- add canonical product classification fields before large-scale translation work
- localize scenario and calculator copy through stable translation keys, not direct sentence translation from React components

This avoids a superficial “page translation only” solution and keeps the site extensible for both market growth and future product-data cleanup.
