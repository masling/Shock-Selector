import test from "node:test";
import assert from "node:assert/strict";
import { approvedProject, poolerHost } from "./with-supabase.mjs";
import { buildProductionEnvironment } from "./configure-vercel-production.mjs";

const supabase = {
  SUPABASE_PROJECT_REF: approvedProject,
  DATABASE_URL: `postgresql://vibro_runtime.${approvedProject}:test-only@${poolerHost}:6543/postgres?pgbouncer=true&sslmode=require&sslaccept=strict`,
  DIRECT_URL: `postgresql://vibro_runtime.${approvedProject}:test-only@${poolerHost}:5432/postgres?sslmode=require&sslaccept=strict`,
  NEXT_PUBLIC_SUPABASE_URL: `https://${approvedProject}.supabase.co`,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test-only",
};
const storage = { SUPABASE_PROJECT_REF: approvedProject, SUPABASE_SECRET_KEY: `sb_secret_${"x".repeat(32)}` };
const notifications = {
  ZEPTOMAIL_API_ENABLED: "true", ZEPTOMAIL_SEND_TOKEN: "test-only-send-token-123456",
  FEISHU_WEBHOOK_ENABLED: "true", FEISHU_WEBHOOK_URL: "https://open.feishu.cn/open-apis/bot/v2/hook/test-only",
  FEISHU_WEBHOOK_SIGNING_SECRET: "test-only-signing-secret-123456",
};

test("production environment contains only approved runtime values", () => {
  const result = buildProductionEnvironment({ supabase, storage, notifications, cronSecret: "test-only-cron-secret-123456" });
  assert.equal(result.config.NEXT_PUBLIC_SITE_URL, "https://www.vibroabsorber.com");
  assert.equal(result.config.NOTIFICATION_WORKER_ENABLED, "true");
  assert.equal(result.secret.NOTIFICATION_STAFF_EMAILS, "service@vibroabsorber.com");
  const names = [...Object.keys(result.config), ...Object.keys(result.secret)];
  assert.equal(names.includes("NOTIFICATION_TEST_EMAIL"), false);
  assert.equal(names.some((name) => name.startsWith("SMTP_")), false);
  assert.equal(names.includes("ENGINEERING_ASSET_ROOT"), false);
});

test("production environment fails closed on wrong projects and incomplete providers", () => {
  assert.throws(() => buildProductionEnvironment({ supabase: { ...supabase, SUPABASE_PROJECT_REF: "wrong" }, storage, notifications, cronSecret: "test-only-cron-secret-123456" }));
  assert.throws(() => buildProductionEnvironment({ supabase, storage, notifications: { ...notifications, ZEPTOMAIL_SEND_TOKEN: "" }, cronSecret: "test-only-cron-secret-123456" }));
});
