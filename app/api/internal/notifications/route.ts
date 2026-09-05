import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runNotificationWorker } from "@/lib/notifications/worker";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };

function safeDigest(value: string) {
  return createHash("sha256").update(value).digest();
}

function authorized(request: Request, env: Record<string, string | undefined> = process.env) {
  const secret = env.CRON_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!secret || !token) return false;
  return timingSafeEqual(safeDigest(token), safeDigest(secret));
}

export async function POST(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ status: "disabled" }, { status: 503, headers });
  }
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  }

  try {
    return NextResponse.json(await runNotificationWorker(), { headers });
  } catch {
    return NextResponse.json({ error: "worker_failed" }, { status: 500, headers });
  }
}
