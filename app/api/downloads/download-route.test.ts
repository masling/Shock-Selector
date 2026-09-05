import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "./[id]/route";

test("controlled download fails closed and rejects cross-site requests", async () => {
  const before = process.env.CONTROLLED_DOWNLOADS_ENABLED;
  delete process.env.CONTROLLED_DOWNLOADS_ENABLED;
  const context = { params: Promise.resolve({ id: "123" }) };
  try {
    const denied = await POST(new Request("https://www.vibroabsorber.com/api/downloads/123", { method: "POST" }), context);
    assert.equal(denied.status, 403);
    const unavailable = await POST(new Request("https://www.vibroabsorber.com/api/downloads/123", { method: "POST", headers: { origin: "https://www.vibroabsorber.com" } }), context);
    assert.equal(unavailable.status, 503);
    assert.equal(unavailable.headers.get("cache-control"), "private, no-store");
    assert.ok(!(await unavailable.text()).includes("signedUrl"));
  } finally { if (before === undefined) delete process.env.CONTROLLED_DOWNLOADS_ENABLED; else process.env.CONTROLLED_DOWNLOADS_ENABLED = before; }
});
