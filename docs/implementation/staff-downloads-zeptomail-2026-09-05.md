# First-stage continuation: staff, downloads and transactional email

## External service

- User selected ZeptoMail free trial, no purchase or auto top-up.
- User completed Zoho login and explicitly accepted the ZeptoMail terms.
- Organization display name is **EKD**, following the user's preference for English-facing branding. Do not invent a registered English legal company name.
- `vibroabsorber.com` added for ZeptoMail. DNS additions and Zepto domain verification were handled separately by the parent task.
- Existing website records and Zoho Mail MX records must stay unchanged.
- Ordinary Zoho Mail SMTP is not used for automated mail. A web-console test was delivered. Because local outbound 465/587 connections close before TLS, application notifications were migrated to ZeptoMail's HTTPS API; a Send Mail Token and API acceptance test are still required.

## Local implementation

- Staff workbench: verified database-backed operator/manager membership, list/detail, claim, public status/reply, separate internal notes, quote draft/approve/publish and activity logs. No user was enrolled as staff.
- Published quote snapshots are customer-readable only by the inquiry owner. Approval alone does not publish a quote; publication is immutable and idempotent.
- Quote UI uses labeled fields and repeatable line items, not raw JSON. Staff routes refresh sessions and are private/no-store.
- ZeptoMail HTTPS API adapter requires explicit enablement, a server-only Agent Send Mail Token, the fixed EKD sender, bounded text-only messages, no tracking pixels/click tracking and no attachments. Only an `EM_104` response is recorded as accepted; provider, server and ambiguous network outcomes remain distinct, and ambiguous requests are not blindly retried.
- Controlled-download API requires a verified user and uses 60-second signed URLs. Metadata is deny-by-default pending explicit approval; private bucket and approved file uploads are still required. Existing public catalogs are unchanged.

Verification completed locally: production build passed after fixing staff route return typing; focused auth/staff/inquiry/email/download tests passed.

## Remote database status

User explicitly authorized the pending remote migrations for the existing Frankfurt Supabase development project `nvfbyhprwiyigdcqgjtd`, with no production database/environment switch.

- Preflight confirmed staff/download migration versions were absent from remote history and the target new tables were absent.
- `controlled_product_downloads` applied successfully through Supabase `apply_migration`; remote history recorded it as `20260905035151_controlled_product_downloads`, so the local migration filename was aligned to that version.
- `inquiry_staff_workbench` initially failed with raw body `{"error_code":"INVALID_ARGUMENT"}`. Bounded parser diagnosis found the cause: PL/pgSQL variables named `current_role` conflicted with PostgreSQL's reserved/special `CURRENT_ROLE` keyword. After renaming those locals to `staff_role_name`, the same intended migration applied successfully; remote history recorded it as `20260905041109_inquiry_staff_workbench`.
- A narrow follow-up migration `20260905041940_inquiry_staff_queue_event_trigger_fix` was applied after the rollback fixture exposed a trigger bug: shared `queue_customer_event()` referenced `NEW."authorRole"` when invoked for `CustomerInquiry`, whose record has no such field. The fix extracts InquiryMessage-only fields with `to_jsonb(new)` only on InquiryMessage triggers.
- Existing `scripts/sql/inquiry-rls-check.sql` passed remotely in a rollback transaction.
- `scripts/sql/inquiry-staff-rls-check.sql` passed remotely in a rollback transaction: staff membership is required, operator actions are allowed, quote approval/publish is manager-only, approval is hidden until publish, public quotes are owner-only and immutable, internal notes remain private, and public staff/status/quote events queue outbox rows only.
- `scripts/sql/download-rls-check.sql` passed remotely in a rollback transaction: anonymous and unverified users cannot read metadata, unapproved assets are hidden, customers cannot change approval state, and customers cannot insert storage object metadata. No storage bucket or file upload was created.
- Security advisors returned only INFO-level `rls_enabled_no_policy` notices for deliberate private/internal deny-by-default inquiry tables and existing restricted import/scenario tables.

## Remaining acceptance

1. DNS verification, ZeptoMail customer validation and free sending eligibility.
2. Keep ZeptoMail SMTP in Supabase Auth, configure the Agent Send Mail Token for the application's HTTPS notification API, then run controlled OTP/API delivery tests with an authorized mailbox.
3. Confirm initial staff operator/manager identities; no automatic privileged enrollment.
4. Implement durable notification delivery processing and Feishu configuration; current outbox only queues jobs.
5. Create private storage bucket and approve/upload exact model attachments after checking the source remarks; run authenticated download tests.
6. Run customer/staff end-to-end acceptance, then authorize production activation separately.
