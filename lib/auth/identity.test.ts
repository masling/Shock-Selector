import assert from "node:assert/strict";
import test from "node:test";
import { isVerifiedEmailUser } from "./identity";

test("identity accepts only verified email users", () => {
  assert.equal(isVerifiedEmailUser({
    email: "buyer@example.com",
    email_confirmed_at: "2026-09-05T00:00:00.000Z",
    is_anonymous: false,
  }), true);

  assert.equal(isVerifiedEmailUser({
    email: "buyer@example.com",
    email_confirmed_at: undefined,
    is_anonymous: false,
  }), false);

  assert.equal(isVerifiedEmailUser({
    email: "buyer@example.com",
    email_confirmed_at: undefined,
    confirmed_at: "2026-09-05T00:00:00.000Z",
    is_anonymous: false,
  } as Parameters<typeof isVerifiedEmailUser>[0]), false);

  assert.equal(isVerifiedEmailUser({
    email: "buyer@example.com",
    email_confirmed_at: "2026-09-05T00:00:00.000Z",
    is_anonymous: true,
  }), false);

  assert.equal(isVerifiedEmailUser(null), false);
});
