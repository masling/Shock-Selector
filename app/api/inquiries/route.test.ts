import assert from "node:assert/strict";
import test from "node:test";
import { GET, POST } from "./route";
import { GET as getDetail, POST as postMessage } from "./[id]/route";

test("disabled inquiry feature never pretends to save or exposes account data", async () => {
  const before = process.env.INQUIRY_PORTAL_ENABLED;
  delete process.env.INQUIRY_PORTAL_ENABLED;
  try {
    const request = new Request("https://www.vibroabsorber.com/api/inquiries", { method: "POST", headers: { origin: "https://www.vibroabsorber.com" }, body: "{}" });
    for (const response of [await GET(request), await POST(request), await getDetail(request, { params: Promise.resolve({ id: "invalid" }) }), await postMessage(request, { params: Promise.resolve({ id: "invalid" }) })]) {
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
    }
    const crossOrigin = await POST(new Request(request.url, { method: "POST", headers: { origin: "https://evil.example" }, body: "{}" }));
    assert.equal(crossOrigin.status, 403);
  } finally { if (before === undefined) delete process.env.INQUIRY_PORTAL_ENABLED; else process.env.INQUIRY_PORTAL_ENABLED = before; }
});
