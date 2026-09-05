import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "./route";

test("an unconfigured inquiry service fails honestly instead of reporting delivery", async () => {
  const before = { key: process.env.RESEND_API_KEY, to: process.env.CONTACT_EMAIL_TO };
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_EMAIL_TO;
  try {
    const response = await POST(new Request("http://localhost/api/contact", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Local test", email: "test@example.com", message: "EK42X50 test only", locale: "en" }),
    }));
    assert.equal(response.status, 503);
    assert.equal((await response.json()).success, false);
  } finally {
    if (before.key === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = before.key;
    if (before.to === undefined) delete process.env.CONTACT_EMAIL_TO; else process.env.CONTACT_EMAIL_TO = before.to;
  }
});
