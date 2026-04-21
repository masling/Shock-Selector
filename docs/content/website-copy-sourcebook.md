# Website Copy Sourcebook

## Purpose

This document consolidates customer-facing content inputs for the EKD website so future page work can pull from one place instead of repeatedly re-reading Excel, PPT, PDF, and planning documents.

It is intended to support:

- homepage copy
- product family pages
- applications and solutions pages
- engineer sizing and buyer filtering pages
- about, downloads, and contact pages

This is a working sourcebook, not a final brand guideline.

---

## Source Inventory

### High-confidence local sources

1. `docs/implementation/omx-workspace-guide.md`
2. `docs/website-v1-requirements-and-plan.md`
3. `docs/source-materials/PRD.md`
4. `docs/source-materials/SCENARIO_DESIGN.md`
5. `docs/source-materials/EKD_SEO_keyword_strategy_en_markets.md`
6. `data/选型程序算法.xlsx`
7. `data/EKD产品知识培训V1.pptx`
8. `data/EKD产品知识培训V2.pptx`

### Medium-confidence local sources

1. `data/EKD全本样册.pdf`
2. `data/隔振器综合样本2024.pdf`
3. `public/catalogs/ekd-full-catalog.pdf`
4. `public/catalogs/vibration-isolator-catalog-2024.pdf`

Note:

- The PDF files are present locally, but this session could not reliably extract full readable text from them with the available tools.
- Their filenames and role in the site are still useful for content planning, but detailed wording from the PDFs should be validated manually later.

### Old website note

- `docs/website-v1-requirements-and-plan.md` references the old site at `http://ekdcn.com/`.
- During this session, the old homepage, about page, download page, and contact page were fetched successfully.
- The raw extraction notes are archived at `docs/archive/content/legacy-website-content-notes.md`.
- The verified structural and messaging takeaways have been merged into this sourcebook so page work can stay in one place.

### Legacy website facts now kept in this sourcebook

Verified structural facts from the old English site:

- title used: `Jiangsu EKD Machinery Technical Co., Ltd`
- top navigation: `Home`, `About`, `Product`, `News`, `Download`, `Contact`, `Sizing`
- important caveat: old `Sizing` linked to contact, not to a real tool
- download structure exposed `Catalog`, `Drawing`, `3D`, `CAD`, and `PDF`
- public contact details included `office@ekdchina.com`, `+86 510 82801575`, and the Wuxi address already used elsewhere in the repo

Verified product-family wording worth preserving:

- Adjustable Shock Absorber
- Non-adjustable Shock Absorber
- Heavy Duty Shock Absorber
- Super Long Life Shock Absorber
- Heavy Industry Buffer
- Wire Rope Vibration Isolator
- Special Vibration Isolator

Reuse rule:

- Keep old-site family naming, contact facts, and resource structure as trustworthy inputs.
- Treat old-site promotional performance claims as provisional unless validated against official catalogs.

---

## Core Positioning

### Recommended primary positioning

`EKD — Industrial Shock Absorber Selection and Sizing Platform`

This line is the strongest positioning candidate because it aligns with:

- the SEO strategy
- the product-first website plan
- the tool + catalog hybrid nature of the project

### Supporting positioning variants

Use selectively by page:

1. `Industrial shock absorbers for automation, machinery, and motion protection`
2. `Shock absorbers, heavy-duty buffers, and vibration isolation products for industrial applications`
3. `Product catalog, sizing guidance, and application support for engineers and sourcing teams`

### What the site is

- an industrial product website
- a product catalog
- a sizing and selection tool
- an application knowledge base

### What the site is not

- a brochure-first corporate site
- a generic marketing homepage
- a technical note dump with no product path

---

## Audience Model

### Design and application engineers

Need:

- correct scenario routing
- calculation confidence
- parameter clarity
- clear matching logic
- downloadable technical information

Best content style:

- direct
- technical but readable
- clear input/output language
- explain assumptions without over-teaching

### Procurement and sourcing users

Need:

- fast shortlist
- visible product differences
- thread, stroke, energy, force, length comparison
- easy contact and downloads

Best content style:

- low-friction
- table-friendly
- less formula language
- strong comparison wording

### New visitors / OEM prospects

Need:

- fast understanding of what EKD sells
- evidence of industrial experience
- clear industry fit
- trust signals
- quick path to products or sizing

Best content style:

- confidence without hype
- application-led
- industrial, not decorative

---

## Voice And Messaging Rules

### Use these primary terms

- industrial shock absorber
- hydraulic shock absorber
- shock absorber selection
- shock absorber sizing
- heavy-duty shock absorber
- vibration isolator
- wire rope vibration isolator

### Use with care

- industrial damper
- machine damper

These can appear as supporting synonyms but should not replace `shock absorber` on core pages.

### Avoid in customer-facing copy

- implementation
- registry
- database
- PostgreSQL
- imported products
- raw data
- prototype
- MVP
- route ready
- internal architecture terms

### Default tone

- practical
- clear
- industrial
- selection-focused
- confident but not aggressive

---

## Product Universe From Local Materials

### Product categories explicitly shown in training materials

From `data/EKD产品知识培训V1.pptx`:

1. Hydraulic shock absorbers
2. Heavy-duty hydraulic shock absorbers
3. Wire rope vibration isolators
4. Special vibration isolators

### Additional product categories confirmed by the old website

From `http://ekdcn.com/` homepage:

1. Adjustable Shock Absorber
2. Non-adjustable Shock Absorber
3. Heavy Duty Shock Absorber
4. Super Long Life Shock Absorber
5. Heavy Industry Buffer
6. Wire Rope Vibration Isolator
7. Special Vibration Isolator
8. Vibration isolation solution
9. Anti impact compound vibration isolator
10. All metal three-way equal stiffness isolator

### Product-family logic supported by local data

From the Excel database sheet and current implementation:

- `EK` / `EKL` series map to adjustable shock absorbers
- `EN` series map to non-adjustable shock absorbers
- `ED` series map to heavy-duty shock absorbers
- `EI` series map to heavy industry buffers
- `ES` series map to super long life shock absorbers

### Product-level proof points from training PPT

Hydraulic shock absorber positioning:

- absorbs harmful impact energy from precision moving parts
- supports cylinder-driven, motor-driven, and inertia-driven motion
- adjustable models support varying loads and changing application parameters
- fixed models support easier installation and longer service life

Hydraulic shock absorber features:

- excellent cushioning effect
- smooth deceleration curve
- very low end-stop speed
- stable performance
- strong batch consistency
- compact structure
- smaller size with higher absorption ability
- stable behavior under extreme high-frequency impact conditions for small models

### Product copy patterns directly validated on the old site

Observed recurring value propositions:

- adjustable damping through a knob or similar tuning feature
- compact construction with high absorption ability
- smooth damping force and low end-stop speed
- high-frequency suitability
- long life cycle
- maintenance-free integrated unit
- suitability for cranes, rail equipment, automatic warehouse, packaging, and precision equipment

### Claims that should be treated as provisional until manually verified

Do not use these as broad site claims without checking the original catalogs:

- `25 million cycles`
- `0-fault operation`
- `30% higher energy absorption than competitors`
- `20% lighter than competitors`
- `complete replacement` claims against competitor brands

These can be preserved as internal sales notes, not as default website copy.

---

## Product Naming Notes

### Current naming tension

The SEO strategy favors:

- `self-compensating shock absorber`
- `adjustable shock absorber`
- `heavy-duty industrial shock absorber`
- `compact shock absorber`

The current product-family implementation uses:

- `Adjustable Shock Absorbers`
- `Non-adjustable Shock Absorbers`
- `Heavy Duty Shock Absorbers`
- `Super Long Life Shock Absorbers`
- `Heavy Industry Buffers`
- `Wire Rope Vibration Isolators`

### Recommendation

Keep the current family labels for now, but document one naming decision for later:

- decide whether `Non-adjustable Shock Absorbers` should become `Self-Compensating Shock Absorbers`

Reason:

- `self-compensating` is stronger for search intent and industry terminology
- `non-adjustable` is simpler and easier for first-time users

Until validated against the catalog, keep both terms available in copy:

- primary visible label: `Non-adjustable Shock Absorbers`
- supporting explanation: `Self-compensating / non-adjustable models for repeatable motion`

### Broader taxonomy note

The current site implementation only covers the core selector-related product families.

A broader taxonomy recommendation based on the legacy product center now lives in:

- `docs/content/product-taxonomy-and-naming.md`

---

## Sizing And Scenario Inputs From Excel

### Front-facing motion groups

The Excel file supports 19 bottom-layer scenarios that were consolidated into these 5 front-facing entries:

1. Linear motion · free motion
2. Linear motion · force driven
3. Linear motion · motor driven
4. Linear motion · cylinder driven
5. Rotary motion

### Shared input concepts visible in the Excel workbook

The extracted shared strings show the following recurring engineering inputs:

- number of shock absorbers used simultaneously
- cycles per hour
- load weight
- velocity
- height
- slope angle
- propelling force
- motor power
- cylinder quantity
- cylinder bore
- cylinder working pressure
- angular velocity
- torque
- installation radius
- rotation angle

### Shared result concepts visible in the Excel workbook

- required stroke
- total energy per cycle
- total energy per hour
- propelling force
- deceleration
- impact velocity

### Sizing-page content implication

Engineer-facing pages should consistently explain results using:

- required stroke
- energy per cycle
- energy per hour
- impact force or stopping force
- matching product family
- matching models

---

## Applications And Industry Evidence

### Strongest application clusters from local materials

From `data/EKD产品知识培训V2.pptx` and planning docs:

1. PET blowing machinery
2. Automated warehouse / stacker crane
3. Automotive manufacturing
4. Tire machinery
5. Port and lifting equipment
6. Railway safety
7. Paper machinery
8. General industrial automation

### PET blowing machinery

Most useful points:

- high impact frequency
- long service life matters
- mold closing and stretch positions are clear use cases
- repeated deceleration and stable stopping are central

Safe wording:

- `Built for high-frequency machine motion where service life and repeatable deceleration matter.`
- `Used in PET blowing machinery for mold-closing and stretching positions.`

### Automated warehouse / stacker crane

Most useful points:

- track-end protection
- emergency impact protection
- brake-failure stopping scenarios

Safe wording:

- `Used at track ends and aisle ends to protect stacker cranes under normal and emergency conditions.`
- `Supports end-stop protection where equipment safety cannot depend on braking alone.`

### Automotive manufacturing

Most useful points:

- welding fixtures
- transfer and conveyor systems
- assembly lines
- stamping equipment

Safe wording:

- `Used in welding fixtures, conveyor stops, assembly lines, and stamping equipment.`
- `Helps control stopping behavior and reduce harmful impact in automated transfer systems.`

### Tire machinery

Most useful points:

- tire building machines
- curing machine take-out applications
- moving arms and side-load cases

Safe wording:

- `Applied in tire building and curing-machine take-out systems where moving arms require controlled stopping.`

### Port, crane, and railway

Most useful points:

- terminal protection
- accidental impact conditions
- high-energy scenarios
- safety emphasis

Safe wording:

- `Heavy-duty solutions for terminal protection under severe impact conditions.`
- `Suitable for crane, port, and railway end-stop safety duties.`

### Paper machinery and industrial automation

Most useful points:

- heavy moving rolls
- drop-hammer equipment
- guide-rail end stops
- cylinder-assisted automation

Safe wording:

- `Used where large moving masses or repetitive machine motion require reliable stopping at end positions.`

---

## Trust, Company, And Capability Signals

### Signals supported by local planning docs and current content

- 30+ employees
- core team with 15+ years of industry experience
- engineering support for sizing review and application recommendations
- quality/compliance references: ISO9001, ROHS, CE

### Additional trust signals now directly validated from the old site

- high-tech enterprise positioning
- 5 invention patents
- 1 appearance patent
- 50+ utility model patents
- 3 software copyrights
- qualifications related to military production, quality management, and confidentiality
- production equipment showcase
- test equipment showcase

### Safe company narrative

Use this direction:

- EKD focuses on industrial shock absorption, heavy-duty motion protection, and vibration isolation.
- The company supports both standard automation applications and severe-duty industrial use cases.
- EKD provides product guidance, application review, and sizing support.

### Avoid unless verified from official assets

- factory size
- export volume
- exact number of patents
- exact customer count
- exact replacement compatibility with competitor brands

---

## Competitive Notes

The training material references these competitor brands:

- ITT Enidine
- ACE
- Weforma
- Oleo
- Zimmer
- CJAC

This is useful internally for positioning, but should not automatically appear on public pages.

Public-safe positioning angle:

- `Selection support, industrial fit, and practical application guidance`

Avoid public comparison language unless legal and technical review is done.

---

## Downloads And Resource Layer

### Assets clearly present in the repository

1. `EKD Full Product Catalog`
2. `Vibration Isolator Catalog 2024`

### Download structure validated from the old site

The old site grouped downloads under:

- Catalog
- Drawing
- 3D
- CAD
- PDF

This confirms that the future downloads/resource center should be broader than static PDF-only cards.

### Resource-page implication

Downloads pages should frame these as:

- catalog access
- technical reference
- product review support

Not as:

- generic marketing collateral

---

## Contact Layer

### Contact details currently used in the website code

- `office@ekdchina.com`
- `tech@ekdchina.com`
- `sales1@ekdchina.com`
- `service@ekdchina.com`

These are now partially validated by the old website:

- `office@ekdchina.com` is directly visible on the old contact page
- `Tech@ekdchina.com`, `Sales1@ekdchina.com`, and `Service@ekdchina.com` appear in hidden contact blocks on the old contact page

Additional old-site contact details:

- address: `No.26 Nankai Road Xinwu District Wuxi, Jiangsu, China`
- tel: `+86 510 82801575`
- mobile / WeChat: `+86 18762450769`
- contact name shown: `Miss.Shao`

### Contact-page messaging direction

Lead with:

- machine type
- motion case
- required performance range
- product family already under evaluation

This matches the project goal and the way the training materials describe customer conversations.

---

## Content Gaps To Resolve Later

These items should be marked for later validation before final content production:

1. exact old-website wording and brand claims
2. detailed readable text from the two PDF catalogs
3. official English family naming from the catalog
4. which customer names from the PPT can be used publicly
5. whether military-facing qualifications should appear on general commercial pages

---

## Recommended Writing Priorities

### Ready to write now

1. homepage
2. products overview page
3. product family overview blocks
4. solutions page
5. applications page
6. engineer sizing intro copy
7. buyer quick filter intro copy
8. downloads page
9. contact page
10. about page

### Should wait for more verification

1. detailed product detail long-form descriptions
2. exact customer logo/case-study pages
3. strong competitor-replacement pages
4. exact lifecycle/performance superiority claims

---

## Practical Recommendation

For future content production, treat this document as the evidence base and use a separate page-draft document for actual English page copy.

The page-draft companion for this sourcebook is:

- `docs/content/page-copy-drafts-en.md`
