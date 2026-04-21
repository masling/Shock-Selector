# Docs Map

## Purpose

This folder is organized so humans and Codex/oh-my-codex sessions can quickly find the current source of truth without re-reading historical prompts or duplicate planning notes.

Use this folder as the durable project knowledge layer.

- `AGENTS.md` remains the highest-priority workspace instruction file.
- `.omx/` remains the runtime state area for active sessions.
- `docs/` should keep only current planning, source material, and curated references.

## Recommended Reading Order For Codex / OMX

1. `AGENTS.md`
2. `docs/implementation/omx-workspace-guide.md`
3. `docs/website-v1-requirements-and-plan.md`
4. Task-specific supporting docs:
   - scenario logic: `docs/source-materials/PRD.md`, `docs/source-materials/SCENARIO_DESIGN.md`
   - content and taxonomy: `docs/content/website-copy-sourcebook.md`, `docs/content/product-taxonomy-and-naming.md`, `docs/content/page-copy-drafts-en.md`
   - SEO: `docs/source-materials/EKD_SEO_keyword_strategy_en_markets.md`, `docs/source-materials/EKD_SEO_keywords_master.csv`
   - localization: `docs/implementation/multilingual-requirements.md`

## Folder Structure

### `docs/implementation`

Current operating and delivery guidance.

- `omx-workspace-guide.md`: the main Codex / oh-my-codex handoff and workspace rules summary
- `multilingual-requirements.md`: localization scope, constraints, and implementation phases

### `docs/source-materials`

Stable upstream requirement and research inputs.

- `PRD.md`: original MVP requirement definition
- `SCENARIO_DESIGN.md`: scenario routing and calculator-family design
- `EKD_SEO_keyword_strategy_en_markets.md`: SEO architecture and keyword plan
- `EKD_SEO_keywords_master.csv`: supporting keyword list

### `docs/content`

Customer-facing messaging references and writing assets.

- `website-copy-sourcebook.md`: consolidated content evidence and writing rules
- `product-taxonomy-and-naming.md`: catalog grouping and naming decisions
- `page-copy-drafts-en.md`: reusable English page copy drafts

### Root-Level Planning Doc

- `website-v1-requirements-and-plan.md`: the current integrated product, IA, page, and delivery plan

## Documentation Rules

- Prefer updating an existing canonical doc over creating a new sibling note.
- Put transient execution notes in `.omx/`, not in a new `docs/*memory*.md` file.
- If a document is useful only as historical context, move it to `docs/archive/`.
- When a doc is archived, update references so active sessions are not steered toward stale material.
- If a rule matters for future agent sessions, capture it in `AGENTS.md`, this docs map, or `docs/implementation/omx-workspace-guide.md`.

## Archive Policy

`docs/archive/` holds historical prompts, one-off extraction notes, and superseded snapshots that are worth keeping for traceability but should not be read first.
