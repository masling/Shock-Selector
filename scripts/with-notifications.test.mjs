import test from "node:test";
import assert from "node:assert/strict";
import { validateEmailEnvironment, validateFeishuEnvironment } from "./with-notifications.mjs";

const fixture = () => ({
  FEISHU_WEBHOOK_ENABLED: "true",
  FEISHU_WEBHOOK_URL: "https://open.feishu.cn/open-apis/bot/v2/hook/test-only-id",
  FEISHU_WEBHOOK_SIGNING_SECRET: "test-only-secret",
  FEISHU_TIMEOUT_MS: "5000",
});

test("accepts only a signed HTTPS custom-bot webhook", () => {
  assert.deepEqual(validateFeishuEnvironment(fixture()), {
    webhookHost: "open.feishu.cn", signingEnabled: true, timeoutMs: 5000,
  });
  for (const change of [
    (values) => { values.FEISHU_WEBHOOK_ENABLED = "false"; },
    (values) => { values.FEISHU_WEBHOOK_URL = "https://evil.example/open-apis/bot/v2/hook/test"; },
    (values) => { values.FEISHU_WEBHOOK_URL = "http://open.feishu.cn/open-apis/bot/v2/hook/test"; },
    (values) => { values.FEISHU_WEBHOOK_URL = "https://open.feishu.cn/other/test"; },
    (values) => { values.FEISHU_WEBHOOK_SIGNING_SECRET = ""; },
    (values) => { values.FEISHU_TIMEOUT_MS = "20000"; },
  ]) { const values = fixture(); change(values); assert.throws(() => validateFeishuEnvironment(values)); }
});

test("validation errors never include the webhook token or signing secret", () => {
  const values = fixture();
  values.FEISHU_WEBHOOK_URL = "https://evil.example/open-apis/bot/v2/hook/private-webhook-token";
  values.FEISHU_WEBHOOK_SIGNING_SECRET = "private-signing-secret";
  assert.throws(() => validateFeishuEnvironment(values), (error) =>
    !error.message.includes("private-webhook-token") && !error.message.includes("private-signing-secret"));
});

const emailFixture = () => ({
  ZEPTOMAIL_API_ENABLED: "true",
  ZEPTOMAIL_SEND_TOKEN: "test-only-send-token-123456",
  ZEPTOMAIL_API_TIMEOUT_MS: "10000",
  NOTIFICATION_TEST_EMAIL: "test@example.com",
});

test("accepts only explicitly enabled ZeptoMail HTTPS API credentials and a test recipient", () => {
  assert.deepEqual(validateEmailEnvironment(emailFixture()), {
    apiHost: "api.zeptomail.com", transport: "https", timeoutMs: 10000, testRecipientDomain: "example.com",
  });
  for (const change of [
    (values) => { values.ZEPTOMAIL_API_ENABLED = "false"; },
    (values) => { values.ZEPTOMAIL_SEND_TOKEN = ""; },
    (values) => { values.ZEPTOMAIL_API_TIMEOUT_MS = "25000"; },
    (values) => { values.NOTIFICATION_TEST_EMAIL = "not-an-email"; },
  ]) { const values = emailFixture(); change(values); assert.throws(() => validateEmailEnvironment(values)); }
});

test("email validation errors never include credentials or recipient", () => {
  const values = emailFixture();
  values.ZEPTOMAIL_SEND_TOKEN = "private-send-token-123456789";
  values.ZEPTOMAIL_API_TIMEOUT_MS = "25000";
  values.NOTIFICATION_TEST_EMAIL = "private@example.com";
  assert.throws(() => validateEmailEnvironment(values), (error) =>
    !error.message.includes("private-send-token") && !error.message.includes("private@example.com"));
});
