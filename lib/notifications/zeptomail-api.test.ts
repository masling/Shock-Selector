import assert from "node:assert/strict";
import test from "node:test";
import { getZeptoMailApiConfig, sendZeptoMailApiEmail } from "./zeptomail-api";

const config = { endpoint: "https://api.zeptomail.com/v1.1/email" as const, sendToken: "test-only-send-token-123456", timeoutMs: 5000 };
const input = { eventKey: "test:event", to: "customer@example.invalid", subject: "EKD inquiry received", text: "Test body" };

test("ZeptoMail API config is explicit and strips an optional authorization prefix", () => {
  assert.equal(getZeptoMailApiConfig({}), null);
  assert.equal(getZeptoMailApiConfig({ ZEPTOMAIL_API_ENABLED: "true", ZEPTOMAIL_SEND_TOKEN: "short" }), null);
  assert.equal(getZeptoMailApiConfig({
    ZEPTOMAIL_API_ENABLED: "true",
    ZEPTOMAIL_SEND_TOKEN: "Zoho-enczapikey test-only-send-token-123456",
    ZEPTOMAIL_API_TIMEOUT_MS: "5000",
  })?.sendToken, "test-only-send-token-123456");
});

test("ZeptoMail API sends text-only transactional payload and requires EM_104 acceptance", async () => {
  let request: RequestInit | undefined;
  const result = await sendZeptoMailApiEmail(input, config, (async (_url, init) => {
    request = init;
    return new Response(JSON.stringify({ data: [{ code: "EM_104", message: "Email request received" }], request_id: "request_123" }), { status: 201 });
  }) as typeof fetch);
  assert.deepEqual(result, { status: "accepted", providerId: "zeptomail:request_123" });
  const payload = JSON.parse(String(request?.body));
  assert.equal(payload.from.address, "service@vibroabsorber.com");
  assert.equal(payload.to[0].email_address.address, input.to);
  assert.equal(payload.textbody, input.text);
  assert.equal(payload.htmlbody, undefined);
  assert.equal(payload.track_clicks, false);
  assert.equal(JSON.stringify(payload).includes(config.sendToken), false);
  assert.equal(String((request?.headers as Record<string, string>).Authorization).endsWith(config.sendToken), true);

  const unknown = await sendZeptoMailApiEmail(input, config, (async () => new Response("{}", { status: 200 })) as typeof fetch);
  assert.deepEqual(unknown, { status: "uncertain", code: "zeptomail_response_unknown", retryable: false });
});

test("ZeptoMail API classifies provider, server and network failures without leaking responses", async () => {
  const denied = await sendZeptoMailApiEmail(input, config, (async () =>
    new Response(JSON.stringify({ error: { code: "SM_128", message: "not approved" } }), { status: 403 })) as typeof fetch);
  assert.deepEqual(denied, { status: "failed", code: "zeptomail_SM_128", retryable: false });
  const retryable = await sendZeptoMailApiEmail(input, config, (async () => new Response("error", { status: 503 })) as typeof fetch);
  assert.deepEqual(retryable, { status: "failed", code: "zeptomail_http_503", retryable: true });
  const uncertain = await sendZeptoMailApiEmail(input, config, (async () => { throw new Error("private network detail"); }) as typeof fetch);
  assert.deepEqual(uncertain, { status: "uncertain", code: "zeptomail_outcome_unknown", retryable: false });
});
