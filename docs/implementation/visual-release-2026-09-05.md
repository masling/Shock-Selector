# Visual release 0.2.0 — 2026-09-05

## Scope

- Compact EKD-only identity, consistent page typography, spacing, navigation and footer.
- Five product families, engineer sizing, buyer search and the existing knowledge center remain accessible.
- Contact details use service@vibroabsorber.com and WhatsApp +86 18069449700. Where delivery is not configured, the form opens an email draft and does not claim to have sent an inquiry.
- Privacy, terms and selection guidance are accessible from the footer. Optional analytics loads only after consent in privacy settings.
- Seven selected representative product/series images are included in public assets. Other staged source files and candidate records are not published.

## Data and release boundary

This release uses the existing production database environment. It does not migrate production, change connection credentials, run SQL migrations or promote candidate products. Supabase connection support is opt-in through explicit environment configuration; existing environments retain the native Prisma driver.

Registration, authenticated inquiry persistence, customer reply history and notification delivery remain subsequent functional work. Browser inquiry drafts are not server records.

## Representative media provenance

- Shock absorber, heavy-duty buffer, wire-rope and special-isolator photos come from the supplied EKD product materials; family photos are representative, not proof of dimensional equivalence for every model.
- JYXR-P photo and structure drawing: supplied EKD Special Isolator English catalog, printed page 27 (PDF page 29).
- JYXR-H photo: same catalog, printed page 29 (PDF page 31).
- The pipe structure drawing is a series reference, not a model-specific manufacturing drawing.

## Verification

- Production build completed successfully, including type checking and 214 generated pages.
- Calculator, catalog visibility/search, brand and inquiry-context regression tests passed before release.
- No automatic database migrations are part of the build or deployment command.
