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

Supabase Auth SMTP settings for the Frankfurt project are open but still disabled. Permission has been requested to save this ZeptoMail account's SMTP credentials there for EKD verification emails. No credential was printed to chat, entered into Supabase, or committed to the repository. No test email was sent yet.

Domain verification alone does not prove account review/free sending eligibility or successful email delivery. Confirm those separately during SMTP acceptance. No change to the live website's database connection is included.
