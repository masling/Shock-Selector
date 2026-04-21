# OMX Workspace Guide

Last updated: 2026-04-15

## Purpose

This is the primary workspace handoff for Codex and oh-my-codex sessions.

Read it after `AGENTS.md` and before making planning or implementation decisions. It summarizes the current product direction, the rules that still matter, and the places where older context has been archived.

## Read This Repo In This Order

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/website-v1-requirements-and-plan.md`
4. Task-specific docs based on what you are changing

Use `.omx/` for active-session state. Use `docs/` for durable project knowledge.

## Product North Star

- This is a product-discovery-first industrial website, not a company-intro-first brochure site.
- The site combines product catalog, application guidance, and shock absorber sizing.
- Public-facing UX should help engineers and buyers reach suitable products quickly.
- The MVP should stay small, runnable, and extensible instead of trying to clone all 19 Excel scenarios at once.

## Non-Negotiable Product Rules

- Front-facing scenario entry points stay limited to 5 groups.
- Calculator logic stays out of React page components.
- Database access, calculation logic, and UI state remain layered.
- Product-family grouping logic should stay centralized, not scattered across pages.
- Customer-facing copy should avoid internal architecture language such as `registry`, `database`, `raw data`, or `MVP`.

## Current Working Architecture

- Next.js App Router + TypeScript + Prisma + PostgreSQL
- Zod-based validation for APIs and calculator inputs
- Scenario registry drives current engineer-flow routing metadata
- Calculator modules implement formulas and filter generation
- Product search runs through centralized repository/service layers
- Localized route scaffolding and `lib/i18n/*` modules already exist, but multilingual cleanup is still an active concern

## What Is Already In Place

- Website shell for homepage, products, solutions, applications, downloads, about, and contact
- Product import flow from the Excel workbook
- Buyer quick-filter API and page
- Scenario registry and calculate API
- First-pass calculator coverage across all 5 front-facing motion entry groups
- Product taxonomy and copy reference docs for future content work

## Guidance For OMX / Codex Sessions

- Start from the canonical docs listed in `docs/README.md`.
- Treat `docs/source-materials/*.md` as upstream requirement inputs.
- Treat `docs/website-v1-requirements-and-plan.md` as the current integrated plan.
- Treat `docs/content/website-copy-sourcebook.md` as the main writing evidence layer.
- Treat `docs/archive/` as history only unless a task explicitly asks for historical context.

## Technical Decisions To Preserve

- Keep the scenario registry as the source of truth for routing metadata in the current phase.
- Keep calculator refinement localized to `lib/calculators/*`.
- Keep product-family content curated while allowing live product stats and search results to come from the database.
- Prefer resilient behavior when DB access is unavailable during build or preview contexts.

## Environment Notes

- Local development expects PostgreSQL through `compose.yaml`.
- Prisma migration behavior has been inconsistent in this environment; verify before assuming `prisma migrate dev` is the correct path for a change.
- Excel import and DB-backed verification depend on a valid `DATABASE_URL`.

## Next High-Value Areas

- Continue tightening multilingual consistency between route structure, content modules, and UI labels.
- Improve calculator fidelity toward Excel parity without breaking the layering rules.
- Decide which product taxonomy/grouping rules should stay heuristic and which should be persisted during import.
- Expand scenario coverage incrementally through the existing registry + calculator interface.
