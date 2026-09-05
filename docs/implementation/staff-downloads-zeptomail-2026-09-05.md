# First-stage continuation: staff, downloads and transactional email

## External service

- User selected ZeptoMail free trial, no purchase or auto top-up.
- User completed Zoho login and explicitly accepted the ZeptoMail terms.
- Organization display name is **EKD**, following the user's preference for English-facing branding. Do not invent a registered English legal company name.
- `vibroabsorber.com` added; domain status remains pending verification.
- Cloudflare requires two additional records: TXT `4201557._domainkey` (value from ZeptoMail's domain screen), and DNS-only CNAME `bounce-zem` → `cluster89.zeptomail.com`.
- Existing website records and Zoho Mail MX records must stay unchanged. User confirmation for these DNS additions is still pending. Do not click auto-add authorization as a workaround.
- Ordinary Zoho Mail SMTP is not used for automated mail. ZeptoMail credentials are not yet configured, and no test emails were sent.

## Local implementation

- Staff workbench: verified database-backed operator/manager membership, list/detail, claim, public status/reply, separate internal notes, quote draft/approve/publish and activity logs. No user was enrolled as staff.
- Published quote snapshots are customer-readable only by the inquiry owner. Approval alone does not publish a quote; publication is immutable and idempotent.
- Quote UI uses labeled fields and repeatable line items, not raw JSON. Staff routes refresh sessions and are private/no-store.
- ZeptoMail SMTP adapter requires explicit enablement, verified TLS, fixed EKD sender, bounded text-only messages and no attachment file/URL reads. Acceptance, failure and uncertain outcomes are distinct; an ambiguous SMTP result is not blindly retried.
- Controlled-download API requires a verified user and uses 60-second signed URLs. Metadata is deny-by-default pending explicit approval; private bucket and approved file uploads are still required. Existing public catalogs are unchanged.

Verification completed locally: production build passed after fixing staff route return typing; 19 focused auth/staff/inquiry/SMTP/download tests passed. The staff SQL fixtures have not run against the remote project because the migrations are awaiting authorization. Read-only verification confirmed the new staff/download tables are absent.

## Remote database blocker

Both new migration attempts were rejected by the safety approval layer as remote permission/schema changes lacking explicit authorization. They were not retried through another tool or mechanism:

- `20260905031318_inquiry_staff_workbench.sql`
- `20260905030529_controlled_product_downloads.sql`

Request authorization specifically for the existing Frankfurt Supabase development project `nvfbyhprwiyigdcqgjtd`, with no production database/environment switch. After approval: apply migrations, align filenames with remote history, run transactional SQL fixtures and advisors. Do not claim these new remote permissions have been verified before doing so.

## Remaining acceptance

1. DNS verification, ZeptoMail customer validation and free sending eligibility.
2. Configure ZeptoMail SMTP in Supabase Auth and the app's ignored/server-only environment; real OTP test with an authorized mailbox.
3. Confirm initial staff operator/manager identities; no automatic privileged enrollment.
4. Implement durable notification delivery processing and Feishu configuration; current outbox only queues jobs.
5. Create private storage bucket and approve/upload exact model attachments after checking the source remarks; run authenticated download tests.
6. Run customer/staff end-to-end acceptance, then authorize production activation separately.
