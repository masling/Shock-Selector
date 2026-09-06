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

1. Feishu destination group/custom bot and local server-only webhook/signing secret are configured. A single no-customer-data `TEST ONLY` message returned Feishu business success; production worker deployment remains disabled.
2. Application notification SMTP credentials are stored in an ignored owner-only local file. ZeptoMail customer validation was submitted on 2026-09-05; the Agent remains shut down and processed-email count remains zero while review is pending, so SMTP acceptance/delivery testing is not complete.
3. Controlled download acceptance completed on 2026-09-06: private `ekd-model-files` bucket, one approved EK42x50 PDF, exact metadata/hash verification, authenticated browser download and access log. DWG remains pending and the mismatched STEP remains rejected.
4. Decide whether the `TEST ONLY` inquiry should be retained as acceptance evidence or removed before production activation.
5. Configure production environment variables and deploy the account feature branch only after the remaining delivery/download checks; the catalog database connection can remain unchanged during this activation.

## Controlled-download source review update

- `EK42x50.pdf`: exact filename, valid PDF signature and rendered title block identify EK42x50 with EKD-only branding; user approved private upload, and authenticated download acceptance passed.
- `EK42x50.dwg`: exact filename and valid AutoCAD 2013-2017 signature; retained pending native drawing review.
- `EK42x50.STEP`: rejected for download because its internal `FILE_NAME` and `PRODUCT` identify `OEMXT 1.5M X 2`, despite the EK42x50 filename.
- The adjacent `备注.txt` authorizes representative-image reuse for specified models only; it does not authorize PDF/CAD/STEP inheritance.
