import { sendTransactionalEmail } from "@/lib/notifications/smtp";

async function main() {
  const to = process.env.NOTIFICATION_TEST_EMAIL ?? "";
  const result = await sendTransactionalEmail({
    eventKey: "test-only:email-notification-integration",
    to,
    subject: "TEST ONLY — EKD inquiry email integration",
    text: "TEST ONLY — EKD inquiry email integration test. No customer data. No reply is required.",
  });

  if (result.status !== "accepted") {
    console.error(JSON.stringify({ acceptedByProvider: false, status: result.status, code: result.code }));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ acceptedByProvider: true, channel: "email", containsCustomerData: false, deliveredOrRead: false }));
  }
}

void main();
