import assert from "node:assert/strict";
import test from "node:test";
import { getInquiryInitialMessage, getInquiryRequestHref } from "./inquiry-context";

test("replacement and project links retain distinct intent and existing model context", () => {
  const target = new URL(getInquiryRequestHref("en", "replacement"), "https://example.com");
  assert.equal(target.pathname, "/en/contact");
  const replacement = getInquiryInitialMessage({ request: target.searchParams.get("request")!, models: " EK42X50, EN8x6 " }, "en");
  assert.match(replacement, /Replacement review/);
  assert.match(replacement, /EK42X50, EN8x6/);
  assert.match(getInquiryInitialMessage({ request: "project" }, "zh-cn"), /运行工况/);
  assert.equal(getInquiryInitialMessage({ request: "unknown" }, "en"), "");
  assert.match(getInquiryInitialMessage({ models: ["EK42X50", "EN8x6"] }, "en"), /^Inquiry models: EK42X50$/);
  assert.ok(getInquiryInitialMessage({ models: "X".repeat(5000) }, "en").length < 1200);
});
