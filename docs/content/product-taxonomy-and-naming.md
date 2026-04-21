# Product Taxonomy And Naming Recommendation

## Purpose

The legacy EKD website exposes more categories than the current MVP product-family layer.

This document recommends:

- which categories should be treated as primary product families
- which should be grouped as secondary categories
- which should be treated as solution/service pages rather than product-family cards
- where naming should be corrected or expanded

---

## Legacy Product Center Categories

Observed on the old website product center:

1. Adjustable Shock Absorber
2. Vibration isolation solution
3. Heavy Duty Shock Absorber
4. Anti impact compound vibration isolator
5. Heavy Industry Buffer
6. All metal three-way equal stiffness isolator
7. Non-adjustable Shock Absorber
8. Super Long Life Shock Absorber
9. Wire Rope Vibration Isolator
10. Special Vibration Isolator
11. Steel mesh pad & rubber vibration isolator
12. Fluid Viscous Damper
13. TMD - Tuned Mass Damper System
14. Particle Damper
15. Import Substitute
16. Metal working and manufacturing
17. Friction Spring Damper
18. Locking Assemblies & Coupling

---

## Recommended New-Site Product Architecture

### Group A: Core shock absorber families

These should stay as the main industrial product-finding families in phase 1.

1. Adjustable Shock Absorbers
2. Non-adjustable Shock Absorbers
   Supporting naming: `Self-compensating / non-adjustable shock absorbers`
3. Super Long Life Shock Absorbers
4. Heavy Duty Shock Absorbers
5. Heavy Industry Buffers

Reason:

- these are closest to the sizing tool
- these align with the Excel product data
- these are the strongest fit for product-led navigation

### Group B: Core vibration-isolation families

These should be visible in the catalog architecture, even if not all get homepage priority.

1. Wire Rope Vibration Isolators
2. Anti-Impact Compound Vibration Isolators
3. All-Metal Equal-Stiffness Vibration Isolators
4. Steel Mesh Pad & Rubber Vibration Isolators
5. Special Vibration Isolators

Reason:

- they are real legacy product lines, not just services
- they broaden EKD beyond hydraulic shock absorbers
- they deserve structured catalog treatment

### Group C: Structural / advanced damping systems

These should likely be secondary product lines or dedicated solution pages, not first-wave homepage family cards.

1. Fluid Viscous Dampers
2. TMD / Tuned Mass Damper Systems
3. Particle Dampers
4. Friction Spring Dampers

Reason:

- these target different search and buying logic from machine shock absorbers
- they may need separate landing-page structure and different technical content

### Group D: Service / capability pages

These should not be treated as product-family cards in the same way as shock absorbers.

1. Vibration Isolation Solutions
2. Import Replacement Solutions
3. Metal Working and Manufacturing Services

Reason:

- they describe capability or commercial offering, not one specific product family
- they fit better under `Solutions`, `Applications`, or a future `Capabilities` structure

### Group E: Mechanical components

These should be handled as an auxiliary product/business line, not mixed into the main shock absorber selector story.

1. Locking Assemblies & Couplings

Reason:

- this is a different buying intent from damping / isolation products
- it can live as a separate product branch if retained

---

## Naming Corrections

### Keep as-is

- Adjustable Shock Absorbers
- Heavy Duty Shock Absorbers
- Super Long Life Shock Absorbers
- Heavy Industry Buffers
- Wire Rope Vibration Isolators
- Special Vibration Isolators
- Fluid Viscous Dampers

### Correct / improve

`Non-adjustable Shock Absorbers`

Recommended display:

- `Non-adjustable Shock Absorbers`

Recommended supporting term:

- `Self-compensating / non-adjustable models`

Reason:

- old site uses `Non-adjustable`
- industrial English and SEO often favor `Self-compensating`

`Anti impact compound vibration isolator`

Recommended display:

- `Anti-Impact Compound Vibration Isolators`

`All metal three-way equal stiffness isolator`

Recommended display:

- `All-Metal Three-Way Equal-Stiffness Vibration Isolators`

`Steel mesh pad & rubber vibration isolator`

Recommended display:

- `Steel Mesh Pad & Rubber Vibration Isolators`

`TMD - Tuned Mass Damper System`

Recommended display:

- `Tuned Mass Damper Systems`

Supporting term:

- `TMD / TLD systems`

`Import Substitute`

Recommended display:

- `Import Replacement Solutions`

`Metal working and manufacturing`

Recommended display:

- `Metal Working & Manufacturing Services`

`Locking Assemblies & Coupling`

Recommended display:

- `Locking Assemblies & Couplings`

---

## Recommended Phase-1 Visible Catalog Set

If the new site still wants a focused first release, use this as the visible catalog core:

1. Adjustable Shock Absorbers
2. Non-adjustable Shock Absorbers
3. Heavy Duty Shock Absorbers
4. Super Long Life Shock Absorbers
5. Heavy Industry Buffers
6. Wire Rope Vibration Isolators
7. Special Vibration Isolators

Optional phase-1 additions if the site wants broader catalog credibility:

8. Anti-Impact Compound Vibration Isolators
9. All-Metal Equal-Stiffness Vibration Isolators
10. Steel Mesh Pad & Rubber Vibration Isolators

---

## Homepage Recommendation

### Homepage hero / discovery layer

Keep the homepage focused on:

- core shock absorbers
- heavy-duty buffers
- wire rope / key vibration-isolation products
- sizing and filtering

### Do not foreground on homepage yet

- locking assemblies
- machining services
- import replacement
- TMD systems
- particle dampers
- friction spring dampers

These can still exist in navigation, product pages, or secondary sections without weakening the product-finding story.

---

## Products Page Recommendation

Use a grouped structure rather than one flat list.

### Suggested groups

1. Shock Absorbers
2. Buffers
3. Vibration Isolators
4. Advanced Damping Systems
5. Solutions & Services

This is easier to scan than a flat list of 18 mixed categories.

---

## Current-MVP Alignment Note

The current implementation in `lib/content/site.ts` is a focused subset aligned with:

- the Excel database
- the sizing engine
- the strongest product-discovery use cases

This is structurally reasonable for the MVP, but the broader taxonomy above should guide:

- future product-center expansion
- more accurate category naming
- future decisions on which lines become primary navigation items
