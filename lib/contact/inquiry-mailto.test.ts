import assert from "node:assert/strict";
import test from "node:test";
import { buildInquiryMailto } from "./inquiry-mailto";

test("email fallback encodes model and contact details into a draft without losing special characters", () => {
  const url = new URL(buildInquiryMailto({ name: "A & B", email: "buyer@example.com", company: "测试公司", phone: "+49 123", message: "EK42X50\nQty: 2 & 3" }));
  assert.equal(url.protocol, "mailto:");
  assert.equal(url.pathname, "service@vibroabsorber.com");
  assert.equal(url.searchParams.get("subject"), "EKD product inquiry");
  const body = url.searchParams.get("body")!;
  assert.ok(body.includes("A & B"));
  assert.ok(body.includes("测试公司"));
  assert.ok(body.includes("+49 123"));
  assert.ok(body.includes("EK42X50\nQty: 2 & 3"));
});
