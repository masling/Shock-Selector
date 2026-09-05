import assert from "node:assert/strict";
import test from "node:test";
import { createInquirySchema } from "./schemas";
import { sameOriginMutation, boundedJson } from "./request-security";
import { matchesSubmittedInquiry } from "./idempotency";
import type { InquiryRecord } from "./schemas";

const valid = { submissionKey: "a1111111-1111-4111-8111-111111111111", kind: "project", locale: "en", contactName: "Buyer", country: "Germany", message: "Conveyor end stop" };
test("formal inquiry is bounded and cannot spoof ownership or status", () => {
  assert.equal(createInquirySchema.safeParse(valid).success, true);
  for (const extra of [{ userId: "other" }, { status: "quoted" }, { email: "other@example.com" }]) assert.equal(createInquirySchema.safeParse({ ...valid, ...extra }).success, false);
  assert.equal(createInquirySchema.safeParse({ ...valid, message: "x".repeat(10001) }).success, false);
  assert.equal(createInquirySchema.safeParse({ ...valid, kind: "standard" }).success, false);
  assert.equal(createInquirySchema.safeParse({ ...valid, kind: "replacement" }).success, false);
});
test("cross-origin submissions are rejected and body limit is enforced while reading", async () => {
  const request = (origin: string, body = "{}") => new Request("https://www.vibroabsorber.com/api/inquiries", { method: "POST", headers: { origin, "content-type": "application/json" }, body });
  assert.equal(sameOriginMutation(request("https://evil.example")), false);
  assert.equal(sameOriginMutation(request("https://www.vibroabsorber.com")), true);
  assert.equal(sameOriginMutation(new Request("https://www.vibroabsorber.com/api/inquiries", {
    method: "POST", headers: { "sec-fetch-site": "same-origin", "content-type": "application/json" }, body: "{}",
  })), true);
  assert.equal(sameOriginMutation(new Request("https://www.vibroabsorber.com/api/inquiries", {
    method: "POST", headers: { origin: "https://www.vibroabsorber.com", "sec-fetch-site": "cross-site", "content-type": "application/json" }, body: "{}",
  })), false);
  assert.equal(sameOriginMutation(new Request("https://www.vibroabsorber.com/api/inquiries", {
    method: "POST", headers: { "content-type": "application/json" }, body: "{}",
  })), false);
  assert.deepEqual(await boundedJson(request("https://www.vibroabsorber.com")), {});
  await assert.rejects(boundedJson(request("https://www.vibroabsorber.com", "x".repeat(20)), 10));
});

test("retry identity includes request content, not only an idempotency key", () => {
  const input = createInquirySchema.parse(valid);
  const record = { ...input, id: "test", reference: "EKD-test", status: "received", email: "test@example.invalid", createdAt: "", updatedAt: "" } as InquiryRecord;
  assert.equal(matchesSubmittedInquiry(record, input), true);
  assert.equal(matchesSubmittedInquiry(record, { ...input, message: "Different request" }), false);
  assert.equal(matchesSubmittedInquiry(record, { ...input, items: [{ model: "EK42X50", quantity: 1, note: "" }] }), false);
});
