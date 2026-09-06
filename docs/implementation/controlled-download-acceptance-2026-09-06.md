# Controlled download acceptance — 2026-09-06

## Boundary

- Target: non-production Frankfurt Supabase project `nvfbyhprwiyigdcqgjtd`.
- Production website and production environment variables were not changed.
- A dedicated modern server-only Secret key named `ekd_stage1_backend` is stored only in ignored owner-only local configuration. Its value is not committed or logged.
- Only the user-approved EK42x50 PDF was uploaded. The DWG remains pending native review, and the STEP remains rejected because its internal identity is `OEMXT 1.5M X 2`.

## Source and approval

- Model: `EK42x50`, published model ID `cmq7qe9sr00wm1yqajju0cyz6`.
- Source: `缓冲器/PDF/EK42x50.pdf` under the engineering source root.
- Size: `153960` bytes.
- SHA-256: `c3e2cc00c3c9ceea6bd7883249c611ea8d475681b23e854296fc7ae2cc23b3eb`.
- Render review confirmed the title block identifies EK42x50 and uses EKD branding only.
- Adjacent `备注.txt` representative-image rules were not used to authorize any technical file inheritance.

## Supabase result

- Created private bucket `ekd-model-files` with a 25 MiB file limit and bounded technical-document MIME types.
- Uploaded object `c3e2cc00c3c9ceea6bd7883249c611ea8d475681b23e854296fc7ae2cc23b3eb.pdf`.
- Inserted approved `CatalogDownload` metadata ID `856066bc-c1e5-4e29-9788-2881e623f8bd`.
- Added explicit service-role column grants only for target-model reads and controlled-download metadata read/insert. No update or delete grant was added.
- Security advisors after the grant reported the existing intentional deny-by-default RLS notices and leaked-password warning; no new grant-related security warning appeared.

## Customer acceptance

- Local acceptance site: `http://127.0.0.1:3026` with `CONTROLLED_DOWNLOADS_ENABLED=true`.
- The authenticated Google test account saw a single `PDF` action only on the EK42x50 row.
- Clicking it produced a browser download event through the protected POST endpoint and a 60-second signed Storage URL.
- `DownloadAccessLog` recorded ID `589136d3-9581-4de1-8f17-1b0becd9ba66` for the authenticated user.
- Downloaded `/Users/maguibo/Downloads/EK42x50.pdf` was `153960` bytes and its SHA-256 exactly matched the approved source and stored metadata.

## Remaining production boundary

- Do not expose the Secret key to browser code or `NEXT_PUBLIC_*` variables.
- Do not upload the DWG until native drawing review is completed.
- Do not upload the rejected STEP; obtain a correct EK42x50 neutral 3D export first.
- Production activation remains a separate deployment decision.
