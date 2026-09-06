import { createHash } from "node:crypto";
import { brand } from "@/lib/brand";
import { transactionalEmailSchema, type DeliveryResult, type TransactionalEmail } from "./smtp";

export type ZeptoMailApiConfig = {
  endpoint: "https://api.zeptomail.com/v1.1/email";
  sendToken: string;
  timeoutMs: number;
};

type FetchLike = typeof fetch;
type ZeptoMailApiResponse = {
  data?: Array<{ code?: unknown }>;
  error?: { code?: unknown };
  request_id?: unknown;
};

export function getZeptoMailApiConfig(env: Record<string, string | undefined> = process.env): ZeptoMailApiConfig | null {
  if (env.ZEPTOMAIL_API_ENABLED !== "true") return null;
  const raw = env.ZEPTOMAIL_SEND_TOKEN?.trim() ?? "";
  const sendToken = raw.replace(/^zoho-enczapikey\s+/i, "");
  if (sendToken.length < 20 || /\s/.test(sendToken) || /PLACEHOLDER|YOUR-|CHANGE-ME/i.test(sendToken)) return null;
  const parsedTimeout = Number(env.ZEPTOMAIL_API_TIMEOUT_MS ?? "10000");
  const timeoutMs = Number.isInteger(parsedTimeout) ? Math.min(Math.max(parsedTimeout, 3000), 20000) : 10000;
  return { endpoint: "https://api.zeptomail.com/v1.1/email", sendToken, timeoutMs };
}

function providerCode(value: unknown) {
  return typeof value === "string" && /^[A-Za-z0-9_]{1,40}$/.test(value) ? value : null;
}

export async function sendZeptoMailApiEmail(
  input: TransactionalEmail,
  config = getZeptoMailApiConfig(),
  fetchImpl: FetchLike = fetch,
): Promise<DeliveryResult> {
  const parsed = transactionalEmailSchema.safeParse(input);
  if (!parsed.success) return { status: "failed", code: "invalid_message", retryable: false };
  if (!config) return { status: "not_configured", code: "zeptomail_api_disabled_or_incomplete", retryable: false };

  const clientReference = createHash("sha256").update(`${input.eventKey}:${input.to.toLowerCase()}`).digest("hex").slice(0, 40);
  try {
    const response = await fetchImpl(config.endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Zoho-enczapikey ${config.sendToken}`,
      },
      body: JSON.stringify({
        from: { address: brand.email, name: brand.name },
        to: [{ email_address: { address: input.to, name: "" } }],
        reply_to: [{ address: brand.email, name: brand.name }],
        subject: input.subject,
        textbody: input.text,
        track_clicks: false,
        track_opens: false,
        client_reference: clientReference,
      }),
      signal: AbortSignal.timeout(config.timeoutMs),
    });

    let body: ZeptoMailApiResponse | null = null;
    try { body = JSON.parse(await response.text()) as ZeptoMailApiResponse; } catch { /* handled below */ }
    const errorCode = providerCode(body?.error?.code);
    if (!response.ok) {
      return {
        status: "failed",
        code: errorCode ? `zeptomail_${errorCode}` : `zeptomail_http_${response.status}`,
        retryable: response.status === 429 || response.status >= 500,
      };
    }
    const accepted = body?.data?.some((item) => providerCode(item.code) === "EM_104") === true;
    if (!accepted) return { status: "uncertain", code: "zeptomail_response_unknown", retryable: false };
    const requestId = providerCode(body?.request_id);
    return { status: "accepted", providerId: `zeptomail:${requestId ?? clientReference}` };
  } catch {
    return { status: "uncertain", code: "zeptomail_outcome_unknown", retryable: false };
  }
}
