import nodemailer from "nodemailer";
import { createHash } from "node:crypto";
import { z } from "zod";
import { brand } from "@/lib/brand";

export const transactionalEmailSchema = z.object({
  eventKey: z.string().min(1).max(200),
  to: z.email().max(254),
  subject: z.string().min(1).max(200).regex(/^[^\r\n]+$/),
  text: z.string().min(1).max(20000),
});
export type TransactionalEmail = z.infer<typeof transactionalEmailSchema>;
export type DeliveryResult =
  | { status: "accepted"; providerId: string }
  | { status: "not_configured" | "failed" | "uncertain"; code: string; retryable: boolean };

export function smtpConfig(env: Record<string, string | undefined> = process.env) {
  if (env.TRANSACTIONAL_EMAIL_ENABLED !== "true") return null;
  // Only the provider approved for automated mail is enabled. Zoho Mail's
  // ordinary smtp/smtppro servers must not be used for transactional messages.
  if (env.SMTP_HOST !== "smtp.zeptomail.com" || !env.SMTP_USERNAME || !env.SMTP_PASSWORD) return null;
  const port = Number(env.SMTP_PORT ?? "587");
  if (port !== 465 && port !== 587) return null;
  return {
    host: env.SMTP_HOST, port, secure: port === 465, requireTLS: port === 587,
    auth: { user: env.SMTP_USERNAME, pass: env.SMTP_PASSWORD },
    tls: { rejectUnauthorized: true, minVersion: "TLSv1.2" as const, servername: env.SMTP_HOST },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    disableFileAccess: true, disableUrlAccess: true, logger: false as const, debug: false,
  };
}

type SmtpClient = Pick<ReturnType<typeof nodemailer.createTransport>, "sendMail">;
export async function sendTransactionalEmail(input: TransactionalEmail, injectedClient?: SmtpClient): Promise<DeliveryResult> {
  const parsed = transactionalEmailSchema.safeParse(input);
  if (!parsed.success) return { status: "failed", code: "invalid_message", retryable: false };
  const config = smtpConfig();
  if (!config && !injectedClient) return { status: "not_configured", code: "smtp_disabled_or_incomplete", retryable: false };
  const transport = injectedClient ?? nodemailer.createTransport(config!);
  const messageId = `<${createHash("sha256").update(`${input.eventKey}:${input.to.toLowerCase()}`).digest("hex")}@vibroabsorber.com>`;
  try {
    const result = await transport.sendMail({
      from: { name: brand.name, address: brand.email },
      to: { address: input.to, name: "" }, replyTo: brand.email,
      subject: input.subject, text: input.text, messageId,
      disableFileAccess: true, disableUrlAccess: true,
      headers: { "Auto-Submitted": "auto-generated", "X-Auto-Response-Suppress": "All" },
    });
    if (!result.accepted?.length || result.rejected?.length) return { status: "failed", code: "recipient_rejected", retryable: false };
    // SMTP acceptance is NOT confirmation of delivery or reading.
    return { status: "accepted", providerId: String(result.messageId ?? messageId) };
  } catch (error) {
    const details = error as { code?: string; responseCode?: number; command?: string };
    if (details.responseCode && details.responseCode >= 400) return { status: "failed", code: `smtp_${details.responseCode}`, retryable: details.responseCode < 500 };
    if (["EAUTH", "EENVELOPE", "EDNS", "ECONNECTION"].includes(details.code ?? "")) return { status: "failed", code: details.code!, retryable: details.code !== "EAUTH" && details.code !== "EENVELOPE" };
    // After DATA or an unknown connection failure, provider acceptance can be
    // ambiguous. Do not auto-retry and risk duplicate customer messages.
    return { status: "uncertain", code: "smtp_outcome_unknown", retryable: false };
  }
}
