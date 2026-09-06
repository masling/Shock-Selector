import smtpModule from "@/lib/notifications/smtp";

const { sendTransactionalEmail } = smtpModule as typeof import("@/lib/notifications/smtp");

const to = process.env.NOTIFICATION_TEST_EMAIL ?? "";
let timeout: NodeJS.Timeout | undefined;
const guard = new Promise<{ status: "uncertain"; code: string; retryable: false }>((resolve) => {
  timeout = setTimeout(() => resolve({ status: "uncertain", code: "smtp_test_timeout", retryable: false }), 30000);
});
const result = await Promise.race([
  sendTransactionalEmail({
    eventKey: "test-only:email-notification-integration",
    to,
    subject: "TEST ONLY — EKD inquiry email integration",
    text: "TEST ONLY — EKD inquiry email integration test. No customer data. No reply is required.",
  }),
  guard,
]);
if (timeout) clearTimeout(timeout);

if (result.status !== "accepted") {
  console.error(JSON.stringify({ acceptedByProvider: false, status: result.status, code: result.code }));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ acceptedByProvider: true, channel: "email", containsCustomerData: false, deliveredOrRead: false }));
}
