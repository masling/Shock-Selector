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
  TRANSACTIONAL_EMAIL_ENABLED: "true",
  SMTP_HOST: "smtp.zeptomail.com",
  SMTP_PORT: "587",
  SMTP_USERNAME: "emailapikey",
  SMTP_PASSWORD: "test-only-password",
  NOTIFICATION_TEST_EMAIL: "test@example.com",
});

test("accepts only explicitly enabled ZeptoMail credentials and a test recipient", () => {
  assert.deepEqual(validateEmailEnvironment(emailFixture()), {
    smtpHost: "smtp.zeptomail.com", port: 587, tlsMode: "starttls", testRecipientDomain: "example.com",
  });
  for (const change of [
    (values) => { values.TRANSACTIONAL_EMAIL_ENABLED = "false"; },
    (values) => { values.SMTP_HOST = "smtp.zoho.com"; },
    (values) => { values.SMTP_PORT = "25"; },
    (values) => { values.SMTP_PASSWORD = ""; },
    (values) => { values.NOTIFICATION_TEST_EMAIL = "not-an-email"; },
  ]) { const values = emailFixture(); change(values); assert.throws(() => validateEmailEnvironment(values)); }
});

test("email validation errors never include credentials or recipient", () => {
  const values = emailFixture();
  values.SMTP_HOST = "evil.example";
  values.SMTP_PASSWORD = "private-smtp-password";
  values.NOTIFICATION_TEST_EMAIL = "private@example.com";
  assert.throws(() => validateEmailEnvironment(values), (error) =>
    !error.message.includes("private-smtp-password") && !error.message.includes("private@example.com"));
});
