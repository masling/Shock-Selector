import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { isLocale } from "@/lib/i18n/config";

export const notificationKinds = [
  "inquiry_received",
  "customer_message",
  "staff_reply",
  "status_changed",
  "quote_published",
] as const;
export type NotificationKind = (typeof notificationKinds)[number];

export const notificationChannels = ["customer_email", "staff_email", "feishu"] as const;
export type NotificationChannel = (typeof notificationChannels)[number];

export type DeliveryStatus = "accepted" | "deferred" | "failed" | "uncertain" | "skipped";

export type ExistingDelivery = {
  channel: NotificationChannel;
  status: DeliveryStatus;
  providerId?: string | null;
  errorCode?: string | null;
};

export type LeasedNotificationJob = {
  id: string;
  inquiryId: string;
  eventKey: string;
  kind: NotificationKind;
  attempts: number;
  leaseToken: string;
  reference: string;
  locale: "en" | "zh-cn" | "de" | "fr" | "it";
  customer: { email: string; name?: string | null };
  deliveries: ExistingDelivery[];
};

export type ChannelDeliveryResult = {
  channel: NotificationChannel;
  status: DeliveryStatus;
  providerId?: string;
  code?: string;
  retryable?: boolean;
};

export type NotificationRepository = {
  claimJobs(input: { limit: number; workerId: string; leaseSeconds: number }): Promise<LeasedNotificationJob[]>;
  finishJob(input: { jobId: string; leaseToken: string; results: ChannelDeliveryResult[] }): Promise<void>;
};

const existingDeliverySchema = z.object({
  channel: z.enum(notificationChannels),
  status: z.enum(["accepted", "deferred", "failed", "uncertain", "skipped"]),
  providerId: z.string().nullable().optional(),
  errorCode: z.string().nullable().optional(),
});

const jobSchema = z.object({
  id: z.uuid(),
  inquiryId: z.uuid(),
  eventKey: z.string().min(1).max(240),
  kind: z.enum(notificationKinds),
  attempts: z.number().int().nonnegative(),
  leaseToken: z.uuid(),
  reference: z.string().min(1).max(80),
  locale: z.string().refine(isLocale),
  customer: z.object({
    email: z.email(),
    name: z.string().nullable().optional(),
  }),
  deliveries: z.array(existingDeliverySchema).default([]),
});

const rpcRowSchema = z.union([jobSchema, z.object({ job: jobSchema })]);

export function createNotificationServiceClient(env: Record<string, string | undefined> = process.env): SupabaseClient | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;
  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export function createSupabaseNotificationRepository(client: SupabaseClient): NotificationRepository {
  return {
    async claimJobs(input) {
      const { data, error } = await client.rpc("notification_claim_jobs", {
        claim_limit: input.limit,
        worker_id: input.workerId,
        lease_seconds: input.leaseSeconds,
      });
      if (error) throw error;
      return (Array.isArray(data) ? data : []).map((row) => {
        const parsed = rpcRowSchema.parse(row);
        return "job" in parsed ? parsed.job : parsed;
      });
    },

    async finishJob(input) {
      const { error } = await client.rpc("notification_finish_job", {
        job_id: input.jobId,
        lease_token: input.leaseToken,
        channel_results: input.results,
      });
      if (error) throw error;
    },
  };
}

export function createNotificationRepository(env: Record<string, string | undefined> = process.env): NotificationRepository | null {
  const client = createNotificationServiceClient(env);
  return client ? createSupabaseNotificationRepository(client) : null;
}
