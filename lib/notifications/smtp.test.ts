import assert from "node:assert/strict";
import test from "node:test";
import { smtpConfig, sendTransactionalEmail } from "./smtp";
import { customerNotification } from "./templates";

const input = { eventKey: "test:123", to: "test@example.invalid", subject: "EKD test", text: "Fixture only" };
test("SMTP stays disabled without explicit complete config and always verifies TLS", () => {
  assert.equal(smtpConfig({}), null);
  assert.equal(smtpConfig({ TRANSACTIONAL_EMAIL_ENABLED: "true", SMTP_HOST: "smtp.zoho.com", SMTP_USERNAME: "test", SMTP_PASSWORD: "test-only" }), null);
  const config = smtpConfig({ TRANSACTIONAL_EMAIL_ENABLED: "true", SMTP_HOST: "smtp.zeptomail.com", SMTP_USERNAME: "emailapikey", SMTP_PASSWORD: "test-only" })!;
  assert.equal(config.requireTLS, true); assert.equal(config.tls.rejectUnauthorized, true);
  assert.equal(config.disableFileAccess, true); assert.equal(config.disableUrlAccess, true);
});
test("SMTP reports accepted, rejected and ambiguous outcomes accurately without actual email", async () => {
  const fake = (fn: (data: unknown) => Promise<unknown>) => ({ sendMail: fn }) as Parameters<typeof sendTransactionalEmail>[1];
  let firstId: string | undefined;
  const accepted = fake(async (data) => { const mail = data as { messageId: string }; if (firstId) assert.equal(mail.messageId, firstId); firstId = mail.messageId; return { accepted: [input.to], rejected: [], messageId: mail.messageId }; });
  assert.equal((await sendTransactionalEmail(input, accepted)).status, "accepted");
  await sendTransactionalEmail(input, accepted);
  assert.equal((await sendTransactionalEmail(input, fake(async () => { throw { code: "ETIMEDOUT", command: "DATA" }; }))).status, "uncertain");
  assert.deepEqual(await sendTransactionalEmail(input, fake(async () => { throw { responseCode: 451 }; })), { status: "failed", code: "smtp_451", retryable: true });
  assert.equal((await sendTransactionalEmail({ ...input, subject: "bad\r\nBcc: x@example.invalid" }, accepted)).status, "failed");
});
test("customer notification points to protected history, not internal content or tracking pixels", () => {
  const mail = customerNotification({ eventKey: "event", inquiryId: "123", reference: "EKD-test", email: input.to, locale: "de", kind: "staff_reply" });
  assert.ok(mail.text.includes("/de/account/inquiries/123"));
  assert.equal("html" in mail, false);
  assert.ok(!mail.text.includes("/staff/"));
});
