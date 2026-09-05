# First-stage account and inquiry foundation

## Release boundary

The visual release is live at https://www.vibroabsorber.com/en (commit `7f699e5`). The account/inquiry slice is separate local development, not deployed to production. The existing production database and environment values were not changed.

## Implemented slice

- Supabase cookie-based session support, email-code login and optional Google OAuth entry. Browsing and drafts remain public; formal submissions and history require a verified email identity.
- Three inquiry types, bounded input validation, user-owned history/detail, customer follow-up messages and idempotent submission keys.
- User-session Data API access with database-enforced RLS. The catalog still uses Prisma and the existing least-privilege runtime connection.
- Separate internal-note storage, inaccessible to customers. Notification jobs are queued atomically with inquiry/message creation; no sending worker is enabled yet. A saved inquiry is not a delivered/read email.
- Feature remains off unless `INQUIRY_PORTAL_ENABLED=true` and the public Auth URL/key are configured. Google additionally requires `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`.

## Database verification

Applied only to the dedicated Frankfurt Supabase development project. Migration `20260905022102_customer_inquiry_foundation.sql` is aligned to the applied migration-history version.

`20260905023624_inquiry_payload_integrity.sql` additionally enforces item JSON shape, quantity limits, duplicate-model rejection and type-specific required fields directly in PostgreSQL, including when the website API is bypassed. The RLS fixture also verifies malformed item rejection.

`scripts/sql/inquiry-rls-check.sql` passed using temporary, transactional Auth fixtures: owner reads/writes; another customer cannot read/reply/spoof ownership; unverified and anonymous access is rejected; status is immutable to customers; internal notes and notification jobs are inaccessible; duplicate keys do not insert twice; outbox events are atomic. All fixtures were rolled back (zero Auth users, inquiries and jobs afterward).

Supabase security advisors reported only informational RLS-without-policy notices on deliberately deny-by-default internal tables and pre-existing internal catalog tables. Do not add permissive policies to silence these. See [Supabase RLS advisory explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

Database quotas currently cap each verified customer at 20 inquiries and 60 messages per hour; this also applies to direct Data API requests. Public product data is unchanged.

Final local verification: production build passed (229 generated pages), 37 focused regression tests passed, and mobile missing-configuration UI stayed within a 390px viewport. Account and sign-in routes are absent from the production prerender manifest and use private/no-store session responses. Actual authenticated browser submission remains pending the email setup below.

## Required before real customer acceptance

1. Configure Supabase Auth production SMTP and an email template containing `{{ .Token }}` for the code flow. Account email receiving and automated website sending are separate capabilities.
2. Configure approved site/redirect URLs for local test and production; set Google OAuth client credentials in Supabase if Google login is enabled. No secrets belong in `NEXT_PUBLIC_*`.
3. Configure local public project URL/publishable key, enable the portal in the ignored local environment and exercise real login with an authorized test mailbox.
4. Implement the protected staff reply/workbench and notification delivery/retry worker. Configure the verified email sender and Feishu webhook separately; never claim pending jobs were sent.
5. Implement and verify controlled file downloads, including object-level authorization. The current slice does not secure arbitrary existing public asset URLs.
6. Only after end-to-end acceptance, plan production environment activation separately. No automatic production database switch is included here.

## References

- [Supabase Next.js SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Email OTP verification](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- [Explicit Data API table grants](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
