import assert from "node:assert/strict";
import test from "node:test";
import { getDefaultAuthRedirect, getSafeAuthRedirect, getSignInPath, isAllowedAuthOrigin } from "./redirects";

test("auth redirect defaults to localized inquiry history", () => {
  assert.equal(getDefaultAuthRedirect("de"), "/de/account/inquiries");
  assert.equal(getSafeAuthRedirect(undefined, "fr"), "/fr/account/inquiries");
});

test("auth redirect allows only localized inquiry paths", () => {
  assert.equal(getSafeAuthRedirect("/en/account/inquiries", "de"), "/en/account/inquiries");
  assert.equal(getSafeAuthRedirect("/zh-cn/account/inquiries/inq_123", "en"), "/zh-cn/account/inquiries/inq_123");
  assert.equal(getSafeAuthRedirect("/it/inquiry", "en"), "/it/inquiry");
});

test("auth redirect rejects external, encoded, loop, and malformed paths", () => {
  for (const target of [
    "https://example.com/en/account/inquiries",
    "//example.com/en/account/inquiries",
    "/en/sign-in",
    "/auth/callback",
    "/en/account/%69nquiries",
    "/en/account/inquiries%2f..%2fsign-in",
    "\\en\\account\\inquiries",
    "account/inquiries",
    "/es/account/inquiries",
  ]) {
    assert.equal(getSafeAuthRedirect(target, "en"), "/en/account/inquiries");
  }
});

test("sign-in path preserves safe next path as a query parameter", () => {
  assert.equal(
    getSignInPath("en", "/en/account/inquiries/abc", "auth_failed"),
    "/en/sign-in?next=%2Fen%2Faccount%2Finquiries%2Fabc&error=auth_failed",
  );
});

test("origin guard fails closed without browser origin or same-site fetch metadata", () => {
  assert.equal(isAllowedAuthOrigin(new Request("https://www.vibroabsorber.com/api/auth/sign-out")), false);
  assert.equal(isAllowedAuthOrigin(new Request("https://www.vibroabsorber.com/api/auth/sign-out", {
    headers: { "sec-fetch-site": "same-origin" },
  })), true);
  assert.equal(isAllowedAuthOrigin(new Request("https://www.vibroabsorber.com/api/auth/sign-out", {
    headers: { "sec-fetch-site": "same-site" },
  })), false);
  assert.equal(isAllowedAuthOrigin(new Request("https://www.vibroabsorber.com/api/auth/sign-out", {
    headers: { origin: "https://www.vibroabsorber.com" },
  })), true);
  assert.equal(isAllowedAuthOrigin(new Request("https://www.vibroabsorber.com/api/auth/sign-out", {
    headers: { origin: "https://evil.example" },
  })), false);
});
