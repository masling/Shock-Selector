# Notification delivery processor slice

Notification delivery processor implementation and non-production database verification. No production deployment, no production database switch, no staff enrollment, no emails and no Feishu webhooks were sent.

## Boundary

- Worker stays disabled unless `NOTIFICATION_WORKER_ENABLED=true`, the Supabase server credentials, complete ZeptoMail SMTP configuration, one staff mailbox, and a valid signed Feishu webhook are all present. This prevents a partially configured deployment from stranding jobs as deferred.
- `SUPABASE_SECRET_KEY` must never be exposed through `NEXT_PUBLIC_*` or browser code.
- `/api/internal/notifications` requires `Authorization: Bearer <CRON_SECRET>` and compares bearer tokens with a timing-safe digest. No schedule is enabled here.
- SMTP/Feishu provider calls are adapter boundaries and were tested with fakes only.

## Delivery semantics

- Database leasing is via service-role-only RPCs using `FOR UPDATE SKIP LOCKED`, lease tokens and expiry.
- Channel outcomes are stored separately in `inquiry_private."NotificationDelivery"` so an accepted customer email is not retried if Feishu later fails.
- `accepted` means provider accepted the message; it is not delivery/read confirmation.
- SMTP uncertain outcomes are terminal for that channel and are not auto-retried.
- Missing provider configuration records `deferred`, not `accepted`.
- Retries are capped with exponential backoff; transactional outbox rows remain the durable source before any delivery attempt.

## Recipients

- Customer email events: `inquiry_received`, `staff_reply`, `status_changed`, `quote_published`.
- Internal staff email and Feishu events: `inquiry_received`, `customer_message`.
- The internal staff mailbox comes from server config (`NOTIFICATION_STAFF_EMAILS`); this first-stage worker uses the first valid address only because delivery state is tracked per channel.
- Feishu messages contain only event type, inquiry reference and staff-workbench link; no customer email, name, company, country, request body or quote payload.

## External setup still missing

1. Configure server-only notification env values and verified provider credentials.
2. Add a scheduler or cron trigger only after a separate production activation decision.
3. Enable leaked-password protection in Supabase Auth if password login is later used; security advisors currently report this as an existing project-level warning.

## Non-production Frankfurt verification

Target project: `nvfbyhprwiyigdcqgjtd`.

- Preflight remote history did not contain `notification_worker_leases`.
- Preflight schema check confirmed `inquiry_private."NotificationDelivery"`, notification lease columns, and public notification RPCs were absent.
- `notification_worker_leases` applied successfully through Supabase `apply_migration`; remote history recorded it as `20260905142225_notification_worker_leases`, and the local migration filename was aligned to that version.
- `scripts/sql/notification-worker-rls-check.sql` passed in a rollback transaction: anon/authenticated cannot claim jobs, service role can claim with `SKIP LOCKED`, expired leases are reclaimable with a new token, stale leases cannot finish, and accepted channel delivery state persists.
- Fixture residue check returned zero matching auth users, customer inquiries and notification delivery rows.
- Security advisors returned expected INFO `rls_enabled_no_policy` notices for deny-by-default private/internal tables, plus an existing project-level WARN that leaked-password protection is disabled.
