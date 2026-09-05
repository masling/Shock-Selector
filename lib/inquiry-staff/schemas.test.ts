import assert from "node:assert/strict";
import test from "node:test";
import { internalNoteSchema, quoteDraftSchema, staffMessageSchema, staffStatusSchema } from "./schemas";

test("staff status accepts only customer-visible workflow states", () => {
  assert.equal(staffStatusSchema.safeParse("reviewing").success, true);
  assert.equal(staffStatusSchema.safeParse("internal_hold").success, false);
});

test("public replies require stable idempotency key and bounded body", () => {
  assert.equal(staffMessageSchema.safeParse({
    submissionKey: "11111111-1111-4111-8111-111111111111",
    body: "Visible customer reply",
  }).success, true);
  assert.equal(staffMessageSchema.safeParse({ submissionKey: "not-a-uuid", body: "reply" }).success, false);
  assert.equal(staffMessageSchema.safeParse({
    submissionKey: "11111111-1111-4111-8111-111111111111",
    body: "",
  }).success, false);
});

test("internal notes are a separate bounded input", () => {
  assert.equal(internalNoteSchema.safeParse({ body: "Private staff-only note" }).success, true);
  assert.equal(internalNoteSchema.safeParse({ body: "" }).success, false);
});

test("quote draft is structured and requires at least one line", () => {
  assert.equal(quoteDraftSchema.safeParse({
    currency: "EUR",
    validity: "30 days",
    deliveryTerm: "EXW",
    paymentTerm: "T/T",
    notes: "Draft only",
    lines: [{ model: "EK-STF-A", quantity: 2, unitPrice: "12.34", leadTime: "2 weeks", note: "" }],
  }).success, true);

  assert.equal(quoteDraftSchema.safeParse({
    currency: "EUR",
    lines: [],
  }).success, false);
});
