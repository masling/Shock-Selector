import assert from "node:assert/strict";
import test from "node:test";
import { feishuSignature, getFeishuConfig, sendFeishuText } from "./feishu";

test("Feishu config accepts only explicit approved HTTPS webhook hosts", () => {
  assert.equal(getFeishuConfig({ FEISHU_WEBHOOK_ENABLED: "true", FEISHU_WEBHOOK_URL: "https://evil.example/hook" }), null);
  assert.equal(getFeishuConfig({ FEISHU_WEBHOOK_ENABLED: "true", FEISHU_WEBHOOK_URL: "http://open.feishu.cn/hook" }), null);
  assert.equal(getFeishuConfig({ FEISHU_WEBHOOK_ENABLED: "true", FEISHU_WEBHOOK_URL: "https://open.feishu.cn/open-apis/bot/v2/hook/test" })?.webhookUrl, "https://open.feishu.cn/open-apis/bot/v2/hook/test");
  assert.equal(getFeishuConfig({ FEISHU_WEBHOOK_ENABLED: "true", FEISHU_WEBHOOK_URL: "https://open.larksuite.com/open-apis/bot/v2/hook/test" })?.webhookUrl, "https://open.larksuite.com/open-apis/bot/v2/hook/test");
});

test("Feishu sender signs when configured and reports accepted/failed without leaking secrets", async () => {
  const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
  const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), body: JSON.parse(String(init?.body)) as Record<string, unknown> });
    return new Response('{"StatusCode":0,"StatusMessage":"success"}', { status: 200 });
  };

  const accepted = await sendFeishuText("EKD: New inquiry EKD-TEST", {
    webhookUrl: "https://open.feishu.cn/open-apis/bot/v2/hook/test",
    signingSecret: "test-secret",
    timeoutMs: 1000,
  }, fetchImpl as typeof fetch);

  assert.equal(accepted.status, "accepted");
  assert.equal(calls[0].url.includes("open.feishu.cn"), true);
  assert.equal(typeof calls[0].body.sign, "string");
  assert.equal(JSON.stringify(calls[0].body).includes("test-secret"), false);
  assert.equal(feishuSignature("123", "secret"), "/1VVdZH3KitTHu9FiYl+TZ0EGq/rppGGi7XFsB5aJSA=");

  const failed = await sendFeishuText("EKD: New inquiry EKD-TEST", {
    webhookUrl: "https://open.feishu.cn/open-apis/bot/v2/hook/test",
    timeoutMs: 1000,
  }, (async () => new Response("retry", { status: 500 })) as typeof fetch);
  assert.deepEqual(failed, { status: "failed", code: "feishu_http_500", retryable: true });
});

test("Feishu sender does not mistake HTTP 200 application errors for acceptance", async () => {
  const config = {
    webhookUrl: "https://open.feishu.cn/open-apis/bot/v2/hook/test",
    signingSecret: "test-secret",
    timeoutMs: 1000,
  };
  const apiError = await sendFeishuText("TEST ONLY", config, (async () =>
    new Response('{"code":19021,"msg":"sign match fail"}', { status: 200 })) as typeof fetch);
  assert.deepEqual(apiError, { status: "failed", code: "feishu_api_19021", retryable: false });

  const unreadable = await sendFeishuText("TEST ONLY", config, (async () =>
    new Response("not-json", { status: 200 })) as typeof fetch);
  assert.deepEqual(unreadable, { status: "uncertain", code: "feishu_response_unreadable", retryable: false });
});
