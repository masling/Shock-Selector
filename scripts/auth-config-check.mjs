import fs from "node:fs";
import { parseEnv } from "node:util";
import { randomBytes, createHash } from "node:crypto";

// Read-only Auth configuration/redirect smoke test. No login, email or user is
// created. Output is deliberately limited to non-secret flags and URL hosts.
const values = parseEnv(fs.readFileSync(".env.supabase.local", "utf8"));
const expected = "https://nvfbyhprwiyigdcqgjtd.supabase.co";
if (values.NEXT_PUBLIC_SUPABASE_URL !== expected || !values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.startsWith("sb_publishable_")) throw new Error("Approved public Auth configuration is missing");
const headers = { apikey: values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY };
try {
  const settingsResponse = await fetch(`${expected}/auth/v1/settings`, { headers, signal: AbortSignal.timeout(15000) });
  if (!settingsResponse.ok) throw new Error(`Auth settings returned ${settingsResponse.status}`);
  const settings = await settingsResponse.json();
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const parameters = new URLSearchParams({ provider: "google", redirect_to: "http://127.0.0.1:3025/auth/callback?next=%2Fen%2Faccount%2Finquiries", code_challenge: challenge, code_challenge_method: "s256" });
  const response = await fetch(`${expected}/auth/v1/authorize?${parameters}`, { headers, redirect: "manual", signal: AbortSignal.timeout(15000) });
  const location = response.headers.get("location");
  const target = location ? new URL(location) : null;
  console.log(JSON.stringify({
    settingsStatus: settingsResponse.status,
    googleEnabled: settings.external?.google === true,
    emailEnabled: settings.external?.email === true,
    authorizeStatus: response.status,
    authorizeHost: target?.hostname ?? null,
    callbackMatchesProject: target?.searchParams.get("redirect_uri") === `${expected}/auth/v1/callback`,
    loginCompleted: false,
    emailSent: false,
  }));
  if (settings.external?.google !== true || target?.hostname !== "accounts.google.com") process.exitCode = 1;
} catch (error) {
  console.error(error instanceof Error && error.message.startsWith("Auth settings returned") ? error.message : "Auth configuration check could not reach the service");
  process.exitCode = 1;
}
