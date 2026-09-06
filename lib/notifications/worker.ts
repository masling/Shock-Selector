import { randomUUID } from "node:crypto";
import { brand } from "@/lib/brand";
import type { TransactionalEmail, DeliveryResult } from "./smtp";
import { getZeptoMailApiConfig, sendZeptoMailApiEmail } from "./zeptomail-api";
import { customerNotification } from "./templates";
import { getFeishuConfig, sendFeishuText } from "./feishu";
import {
  createNotificationRepository,
  type ChannelDeliveryResult,
  type ExistingDelivery,
  type LeasedNotificationJob,
  type NotificationKind,
  type NotificationChannel,
  type NotificationRepository,
} from "./repository";

type EmailSender = (input: TransactionalEmail) => Promise<DeliveryResult>;
type FeishuSender = (text: string) => Promise<DeliveryResult>;

export type NotificationWorkerConfig =
  | { enabled: false; reason: string }
  | {
      enabled: true;
      batchSize: number;
      leaseSeconds: number;
      workerId: string;
      staffEmails: string[];
    };

const customerKinds = new Set(["inquiry_received", "staff_reply", "status_changed", "quote_published"]);
const internalKinds = new Set(["inquiry_received", "customer_message"]);
type CustomerNotificationKind = Exclude<NotificationKind, "customer_message">;

function isCustomerNotificationKind(kind: NotificationKind): kind is CustomerNotificationKind {
  return customerKinds.has(kind);
}

function splitEmails(value: string | undefined) {
  return (value ?? "")
    .split(/[,\s]+/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    .slice(0, 1);
}

function boundedInteger(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, min), max) : fallback;
}

export function getNotificationWorkerConfig(env: Record<string, string | undefined> = process.env): NotificationWorkerConfig {
  if (env.NOTIFICATION_WORKER_ENABLED !== "true") return { enabled: false, reason: "worker_disabled" };
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) return { enabled: false, reason: "supabase_secret_missing" };
  const staffEmails = splitEmails(env.NOTIFICATION_STAFF_EMAILS);
  if (!getZeptoMailApiConfig(env) || !getFeishuConfig(env) || staffEmails.length === 0) {
    return { enabled: false, reason: "provider_configuration_incomplete" };
  }
  return {
    enabled: true,
    batchSize: boundedInteger(env.NOTIFICATION_WORKER_BATCH_SIZE, 10, 1, 25),
    leaseSeconds: boundedInteger(env.NOTIFICATION_WORKER_LEASE_SECONDS, 300, 60, 900),
    workerId: env.NOTIFICATION_WORKER_ID?.slice(0, 120) || `worker-${randomUUID()}`,
    staffEmails,
  };
}

function terminalDelivery(deliveries: ExistingDelivery[], channel: NotificationChannel) {
  const delivery = deliveries.find((item) => item.channel === channel);
  return delivery?.status === "accepted" || delivery?.status === "skipped" || delivery?.status === "uncertain";
}

function mapResult(channel: NotificationChannel, result: DeliveryResult): ChannelDeliveryResult {
  if (result.status === "accepted") return { channel, status: "accepted", providerId: result.providerId };
  if (result.status === "not_configured") return { channel, status: "deferred", code: result.code, retryable: false };
  if (result.status === "uncertain") return { channel, status: "uncertain", code: result.code, retryable: false };
  return { channel, status: "failed", code: result.code, retryable: result.retryable };
}

function internalSubject(job: LeasedNotificationJob) {
  return `${brand.name} · ${job.kind === "customer_message" ? "Customer follow-up" : "New inquiry"} · ${job.reference}`;
}

function internalText(job: LeasedNotificationJob) {
  const label = job.kind === "customer_message" ? "Customer follow-up" : "New inquiry";
  return `${label}\n${job.reference}\n\nReview in the staff workbench:\n${brand.website}/${job.locale}/staff/inquiries/${encodeURIComponent(job.inquiryId)}\n\n${brand.name}`;
}

function feishuText(job: LeasedNotificationJob) {
  const label = job.kind === "customer_message" ? "Customer follow-up" : "New inquiry";
  return `${brand.name}: ${label} ${job.reference}\n${brand.website}/${job.locale}/staff/inquiries/${encodeURIComponent(job.inquiryId)}`;
}

async function processJob(
  job: LeasedNotificationJob,
  config: Extract<NotificationWorkerConfig, { enabled: true }>,
  sendEmail: EmailSender,
  sendFeishu: FeishuSender,
) {
  const results: ChannelDeliveryResult[] = [];

  if (isCustomerNotificationKind(job.kind) && !terminalDelivery(job.deliveries, "customer_email")) {
    results.push(mapResult("customer_email", await sendEmail(customerNotification({
      eventKey: job.eventKey,
      inquiryId: job.inquiryId,
      reference: job.reference,
      email: job.customer.email,
      locale: job.locale,
      kind: job.kind,
    }))));
  }

  if (internalKinds.has(job.kind) && !terminalDelivery(job.deliveries, "staff_email")) {
    if (config.staffEmails.length === 0) {
      results.push({ channel: "staff_email", status: "deferred", code: "staff_email_not_configured", retryable: false });
    } else {
      for (const email of config.staffEmails) {
        const result = mapResult("staff_email", await sendEmail({
          eventKey: `${job.eventKey}:staff:${email}`,
          to: email,
          subject: internalSubject(job),
          text: internalText(job),
        }));
        results.push(result);
        if (result.status !== "accepted") break;
      }
    }
  }

  if (internalKinds.has(job.kind) && !terminalDelivery(job.deliveries, "feishu")) {
    results.push(mapResult("feishu", await sendFeishu(feishuText(job))));
  }

  return results.length > 0 ? results : [{ channel: "feishu", status: "skipped", code: "all_channels_already_terminal", retryable: false } satisfies ChannelDeliveryResult];
}

export async function runNotificationWorker(options: {
  env?: Record<string, string | undefined>;
  repository?: NotificationRepository;
  sendEmail?: EmailSender;
  sendFeishu?: FeishuSender;
} = {}) {
  const config = getNotificationWorkerConfig(options.env);
  if (!config.enabled) return { status: "disabled" as const, reason: config.reason, claimed: 0, finished: 0 };

  const repository = options.repository ?? createNotificationRepository(options.env);
  if (!repository) return { status: "disabled" as const, reason: "repository_unavailable", claimed: 0, finished: 0 };

  const jobs = await repository.claimJobs({ limit: config.batchSize, workerId: config.workerId, leaseSeconds: config.leaseSeconds });
  let finished = 0;
  const errors: string[] = [];

  for (const job of jobs) {
    try {
      const results = await processJob(job, config, options.sendEmail ?? sendZeptoMailApiEmail, options.sendFeishu ?? sendFeishuText);
      await repository.finishJob({ jobId: job.id, leaseToken: job.leaseToken, results });
      finished++;
    } catch {
      errors.push(job.id);
    }
  }

  return { status: errors.length ? "partial" as const : "ok" as const, claimed: jobs.length, finished, failed: errors.length };
}
