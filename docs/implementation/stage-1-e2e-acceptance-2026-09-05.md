# Stage 1 customer/staff workflow acceptance — 2026-09-05

## Environment and boundary

- Local website: `http://127.0.0.1:3025` (do not mix with `localhost`; browser cookies are host-specific).
- Database/Auth: Frankfurt Supabase project `nvfbyhprwiyigdcqgjtd`.
- Production website/database were not switched to the account feature branch.
- All content below is explicitly marked `TEST ONLY`. Notification delivery remains disabled, so no customer email or Feishu message was sent.

## Submission defect and fix

The first real browser submission failed with `invalid_origin`. The browser supplied the protected `Sec-Fetch-Site: same-origin` signal but omitted `Origin`; `sameOriginMutation` incorrectly required both. The fix accepts the browser-controlled `same-origin` value, continues to reject `cross-site`, and still fails closed when neither a trusted fetch-site value nor an exact Origin is present. Regression tests cover all three cases.

Draft recovery was also made explicit and durable for up to seven days in browser local storage, with schema/length validation, expiry and clearing on success. The privacy notice and localized UI copy disclose this behavior.

## Accepted test record

- Reference: `EKD-2E23AA9C19454B7F81F408FB571675E2`
- Type: application requirements
- Destination: Germany
- Initial request: `TEST ONLY — not a real purchasing request`
- The browser displayed `Inquiry saved`, and the database returned the same record with one pending `inquiry_received` event.

## Staff workflow

Using the single explicitly authorized test manager account:

- claimed the inquiry;
- changed customer-visible status to `Under review`;
- saved one customer-visible test reply;
- saved one staff-only test note;
- created, approved and published an immutable EUR 0.00 test quote with no commercial validity, shipment or payment.

The customer page then displayed status `Quotation provided`, the public reply and the published test quote. A DOM inspection confirmed that the internal note text was absent. Database counts matched: one public reply, one internal note, one published quote and four pending notification events. The notification worker was not invoked.

## Remaining before production activation

1. Configure the Feishu destination group/custom bot and server-only webhook/signing secret.
2. Configure application notification SMTP credentials separately from Supabase Auth SMTP; run controlled delivery tests and confirm accepted versus delivered semantics.
3. Create the private `ekd-model-files` Storage bucket, upload only reviewed files, insert approved metadata and test a 60-second signed download. No files are currently uploaded/approved.
4. Decide whether the `TEST ONLY` inquiry should be retained as acceptance evidence or removed before production activation.
5. Configure production environment variables and deploy the account feature branch only after the remaining delivery/download checks; the catalog database connection can remain unchanged during this activation.
