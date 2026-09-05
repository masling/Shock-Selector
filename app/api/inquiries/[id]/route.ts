import { NextResponse } from "next/server";
import { z } from "zod";
import { getInquirySession, isInquiryPortalEnabled } from "@/lib/inquiry/inquiry-service";
import { inquiryMessageSchema } from "@/lib/inquiry/schemas";
import { boundedJson, sameOriginMutation } from "@/lib/inquiry/request-security";
import { InquiryConflictError, InquiryPersistenceError } from "@/lib/inquiry/idempotency";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function GET(_request: Request, { params }: Context) {
  if (!isInquiryPortalEnabled()) return json({ error: "unavailable" }, 503);
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return json({ error: "not_found" }, 404);
  try {
    const session = await getInquirySession();
    if (!session) return json({ error: "sign_in_required" }, 401);
    const result = await session.repository.detail(session.user.id, id);
    return result ? json(result) : json({ error: "not_found" }, 404);
  } catch { return json({ error: "unavailable" }, 503); }
}

export async function POST(request: Request, { params }: Context) {
  if (!sameOriginMutation(request)) return json({ error: "invalid_origin" }, 403);
  if (!isInquiryPortalEnabled()) return json({ error: "unavailable" }, 503);
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return json({ error: "not_found" }, 404);
  let input;
  try { input = inquiryMessageSchema.safeParse(await boundedJson(request, 16384)); }
  catch { return json({ error: "invalid_request" }, 400); }
  if (!input.success) return json({ error: "invalid_request" }, 400);
  try {
    const session = await getInquirySession();
    if (!session) return json({ error: "sign_in_required" }, 401);
    const detail = await session.repository.detail(session.user.id, id);
    if (!detail) return json({ error: "not_found" }, 404);
    if (detail.inquiry.status === "closed") return json({ error: "closed" }, 409);
    const message = await session.repository.message(session.user.id, id, input.data);
    return json({ message, notificationStatus: "pending" }, 201);
  } catch (error) {
    if (error instanceof InquiryConflictError) return json({ error: "submission_conflict" }, 409);
    const diagnostic = process.env.NODE_ENV === "development" && error instanceof InquiryPersistenceError ? error.code : undefined;
    return json({ error: "save_failed", ...(diagnostic ? { diagnostic } : {}) }, 503);
  }
}
