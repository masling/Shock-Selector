# ZeptoMail domain setup

- Organization display name: **EKD**. This is a brand display name, not an invented registered English legal entity.
- User approved ZeptoMail free trial and its terms; no credits purchased and no auto top-up enabled.
- User explicitly authorized adding the two DNS records below to Cloudflare.

| Type | Host | Value |
| --- | --- | --- |
| TXT | `4201557._domainkey` | ZeptoMail-provided DKIM public key, saved exactly from the domain verification screen |
| CNAME | `bounce-zem` | `cluster89.zeptomail.com`, DNS only |

Cloudflare record count increased from 13 to 15. Existing website, SPF, DMARC, verification and Zoho Mail MX records were not modified. Authoritative DNS queries returned both new records. Existing MX remained `mx.zoho.com` (10), `mx2.zoho.com` (20), `mx3.zoho.com` (50).

ZeptoMail displayed **Your domain is verified** and both DKIM/CNAME records showed **Verified**.

After refresh, the account's Subscription page showed **1 credit / 10,000 emails**, expiry **06 Oct 2026**, and **Auto Top-up: Disabled**. A Customer Validation banner remains; account review and delivery acceptance still need to be checked separately.

## Next integration boundary

User authorized saving ZeptoMail SMTP credentials into the Frankfurt project's Auth settings. Automated form filling did not reliably persist the values and was stopped without saving. User subsequently reported completing the email settings manually. No credential was printed to chat or committed. Actual SMTP delivery remains unverified; do not overwrite the user's configuration based on the earlier disabled-state observation.

## Google-first login and local readiness

User chose Google as the primary login method, with email OTP as backup. User created Google Cloud project `ekd-vibroabsorber` and reported saving the Google provider and URL Configuration in Supabase. Browser operation is now manual at the user's request.

Program-side read-only check (`scripts/auth-config-check.mjs`) verified: Auth settings HTTP 200, Google enabled, email enabled, Google authorization HTTP 302 to accounts.google.com, and OAuth provider callback matching the correct Supabase project. This did not sign in, create a user, or send email.

The ignored owner-only `.env.supabase.local` now includes the project publishable key, Google enabled flag and inquiry portal flag. No Client Secret or service-role key was added to the browser configuration. Only the local preview was restarted.

Local `/en/sign-in` returned 200 with the Google button visible; unauthenticated `/api/inquiries` returned 401 with private/no-store caching. Seven Auth regression tests and TypeScript checking passed. Actual browser login and inquiry submission still require the user's manual end-to-end test.

Domain verification alone does not prove account review/free sending eligibility or successful email delivery. Confirm those separately during SMTP acceptance. No change to the live website's database connection is included.
