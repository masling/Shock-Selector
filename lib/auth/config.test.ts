import assert from "node:assert/strict";
import test from "node:test";
import { getAuthConfig, isAuthConfigured, isGoogleAuthEnabled } from "./config";

test("auth config is disabled unless both public Supabase values exist", () => {
  const before = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    google: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED,
  };

  try {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED;
    assert.equal(isAuthConfigured(), false);
    assert.equal(getAuthConfig(), null);
    assert.equal(isGoogleAuthEnabled(), false);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    assert.equal(isAuthConfigured(), false);

    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED = "true";
    assert.equal(isAuthConfigured(), true);
    assert.deepEqual(getAuthConfig(), {
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_test",
    });
    assert.equal(isGoogleAuthEnabled(), true);
  } finally {
    if (before.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = before.url;

    if (before.key === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = before.key;

    if (before.google === undefined) delete process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED;
    else process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED = before.google;
  }
});
