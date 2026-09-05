import { createHmac } from "node:crypto";
import type { DeliveryResult } from "./smtp";

export type FeishuConfig = {
  webhookUrl: string;
  signingSecret?: string;
  timeoutMs: number;
};

type FetchLike = typeof fetch;

const allowedHosts = new Set(["open.feishu.cn", "open.larksuite.com"]);

export function getFeishuConfig(env: Record<string, string | undefined> = process.env): FeishuConfig | null {
  if (env.FEISHU_WEBHOOK_ENABLED !== "true") return null;
  if (!env.FEISHU_WEBHOOK_URL) return null;
  let url: URL;
  try {
    url = new URL(env.FEISHU_WEBHOOK_URL);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) return null;
  return {
    webhookUrl: url.toString(),
    signingSecret: env.FEISHU_WEBHOOK_SIGNING_SECRET || undefined,
    timeoutMs: Math.min(Math.max(Number(env.FEISHU_TIMEOUT_MS ?? 5000), 1000), 10000),
  };
}

export function feishuSignature(timestamp: string, secret: string) {
  return createHmac("sha256", `${timestamp}\n${secret}`).digest("base64");
}

export async function sendFeishuText(text: string, config = getFeishuConfig(), fetchImpl: FetchLike = fetch): Promise<DeliveryResult> {
  if (!config) return { status: "not_configured", code: "feishu_disabled_or_invalid", retryable: false };
  if (!text.trim() || text.length > 2000) return { status: "failed", code: "invalid_feishu_message", retryable: false };

  const payload: Record<string, unknown> = {
    msg_type: "text",
    content: { text },
  };

  if (config.signingSecret) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    payload.timestamp = timestamp;
    payload.sign = feishuSignature(timestamp, config.signingSecret);
  }

  try {
    const response = await fetchImpl(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(config.timeoutMs),
    });
    if (!response.ok) {
      return {
        status: "failed",
        code: `feishu_http_${response.status}`,
        retryable: response.status === 429 || response.status >= 500,
      };
    }
    return { status: "accepted", providerId: `feishu:${Date.now()}` };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    return {
      status: "failed",
      code: name === "TimeoutError" || name === "AbortError" ? "feishu_timeout" : "feishu_network",
      retryable: true,
    };
  }
}
