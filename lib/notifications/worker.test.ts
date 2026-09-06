import assert from "node:assert/strict";
import test from "node:test";
import { runNotificationWorker, getNotificationWorkerConfig } from "./worker";
import type { NotificationRepository, LeasedNotificationJob, ChannelDeliveryResult } from "./repository";
import type { TransactionalEmail, DeliveryResult } from "./smtp";

const job = (overrides: Partial<LeasedNotificationJob> = {}): LeasedNotificationJob => ({
  id: "11111111-1111-4111-8111-111111111111",
  inquiryId: "22222222-2222-4222-8222-222222222222",
  eventKey: "CustomerInquiry:111",
  kind: "inquiry_received",
  attempts: 1,
  leaseToken: "33333333-3333-4333-8333-333333333333",
  reference: "EKD-TEST",
  locale: "en",
  customer: { email: "customer@example.invalid", name: "Customer" },
  deliveries: [],
  ...overrides,
});

function repoWith(jobs: LeasedNotificationJob[]) {
  const finished: Array<{ jobId: string; leaseToken: string; results: ChannelDeliveryResult[] }> = [];
  const repository: NotificationRepository = {
    async claimJobs() { return jobs; },
    async finishJob(input) { finished.push(input); },
  };
  return { repository, finished };
}

const enabledEnv = {
  NOTIFICATION_WORKER_ENABLED: "true",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "sb_secret_test",
  NOTIFICATION_STAFF_EMAILS: "staff@example.invalid",
  ZEPTOMAIL_API_ENABLED: "true",
  ZEPTOMAIL_SEND_TOKEN: "test-only-send-token-123456",
  FEISHU_WEBHOOK_ENABLED: "true",
  FEISHU_WEBHOOK_URL: "https://open.feishu.cn/open-apis/bot/v2/hook/test-only",
  FEISHU_WEBHOOK_SIGNING_SECRET: "test-only-secret",
};

test("worker stays disabled unless explicitly enabled with server-only Supabase secret", () => {
  assert.deepEqual(getNotificationWorkerConfig({}), { enabled: false, reason: "worker_disabled" });
  assert.deepEqual(getNotificationWorkerConfig({ NOTIFICATION_WORKER_ENABLED: "true", NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" }), {
    enabled: false,
    reason: "supabase_secret_missing",
  });
  assert.deepEqual(getNotificationWorkerConfig({
    NOTIFICATION_WORKER_ENABLED: "true",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SECRET_KEY: "sb_secret_test",
  }), { enabled: false, reason: "provider_configuration_incomplete" });
});

test("worker uses one shared staff mailbox for first-stage channel tracking", () => {
  const config = getNotificationWorkerConfig({
    ...enabledEnv,
    NOTIFICATION_STAFF_EMAILS: "staff@example.invalid, second@example.invalid",
  });
  assert.equal(config.enabled, true);
  if (config.enabled) assert.deepEqual(config.staffEmails, ["staff@example.invalid"]);
});

test("worker records customer, staff and Feishu channel outcomes separately", async () => {
  const { repository, finished } = repoWith([job()]);
  const sent: TransactionalEmail[] = [];
  const sendEmail = async (input: TransactionalEmail): Promise<DeliveryResult> => {
    sent.push(input);
    return { status: "accepted", providerId: `mail-${sent.length}` };
  };
  const result = await runNotificationWorker({
    env: enabledEnv,
    repository,
    sendEmail,
    sendFeishu: async () => ({ status: "failed", code: "feishu_http_500", retryable: true }),
  });

  assert.equal(result.status, "ok");
  assert.equal(sent.length, 2);
  assert.deepEqual(finished[0].results.map((item) => [item.channel, item.status, item.retryable]), [
    ["customer_email", "accepted", undefined],
    ["staff_email", "accepted", undefined],
    ["feishu", "failed", true],
  ]);
});

test("worker does not retry an already accepted email when another channel retries", async () => {
  const { repository, finished } = repoWith([
    job({
      deliveries: [
        { channel: "customer_email", status: "accepted", providerId: "mail-1" },
        { channel: "staff_email", status: "accepted", providerId: "mail-2" },
      ],
    }),
  ]);
  let emailCalls = 0;
  await runNotificationWorker({
    env: enabledEnv,
    repository,
    sendEmail: async () => {
      emailCalls++;
      return { status: "accepted", providerId: "unexpected" };
    },
    sendFeishu: async () => ({ status: "accepted", providerId: "feishu-1" }),
  });

  assert.equal(emailCalls, 0);
  assert.deepEqual(finished[0].results, [{ channel: "feishu", status: "accepted", providerId: "feishu-1" }]);
});

test("SMTP not configured and uncertain outcomes are not marked accepted", async () => {
  const { repository, finished } = repoWith([job({ kind: "staff_reply" })]);
  await runNotificationWorker({
    env: enabledEnv,
    repository,
    sendEmail: async () => ({ status: "uncertain", code: "smtp_outcome_unknown", retryable: false }),
    sendFeishu: async () => ({ status: "accepted", providerId: "unused" }),
  });

  assert.deepEqual(finished[0].results, [{ channel: "customer_email", status: "uncertain", code: "smtp_outcome_unknown", retryable: false }]);
});
