import { NextResponse } from "next/server";
import { createInquirySchema } from "@/lib/inquiry/schemas";
import { getInquirySession, isInquiryPortalEnabled, validateInquiryModels } from "@/lib/inquiry/inquiry-service";
import { boundedJson, sameOriginMutation } from "@/lib/inquiry/request-security";
import { InquiryConflictError, InquiryPersistenceError } from "@/lib/inquiry/idempotency";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function GET(request: Request) {
  if (!isInquiryPortalEnabled()) return json({ error: "unavailable" }, 503);
  const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
  if (!Number.isInteger(page) || page < 1 || page > 10000) return json({ error: "invalid_page" }, 400);
  try {
    const session = await getInquirySession();
    if (!session) return json({ error: "sign_in_required" }, 401);
    return json(await session.repository.list(session.user.id, page));
  } catch { return json({ error: "unavailable" }, 503); }
}

export async function POST(request: Request) {
  if (!sameOriginMutation(request)) return json({ error: "invalid_origin" }, 403);
  if (!isInquiryPortalEnabled()) return json({ error: "unavailable" }, 503);
  let input;
  try { input = createInquirySchema.safeParse(await boundedJson(request)); }
  catch { return json({ error: "invalid_request" }, 400); }
  if (!input.success) return json({ error: "invalid_request", fields: input.error.issues.map((issue) => issue.path.join(".")) }, 400);
  let session: Awaited<ReturnType<typeof getInquirySession>>;
  try { session = await getInquirySession(); }
  catch { return json({ error: "save_failed", ...(process.env.NODE_ENV === "development" ? { diagnostic: "session_lookup_failed" } : {}) }, 503); }
  if (!session) return json({ error: "sign_in_required" }, 401);
  try {
    if (!await validateInquiryModels(input.data)) return json({ error: "product_unavailable" }, 400);
  } catch {
    return json({ error: "save_failed", ...(process.env.NODE_ENV === "development" ? { diagnostic: "catalog_validation_failed" } : {}) }, 503);
  }
  try {
    const result = await session.repository.create(session.user.id, session.user.email!, input.data);
    // The database trigger queues notification work atomically. No provider send
    // happens in this request; do not equate persistence with email delivery.
    return json({ ...result, notificationStatus: "pending" }, result.created ? 201 : 200);
  } catch (error) {
    if (error instanceof InquiryConflictError) return json({ error: "submission_conflict" }, 409);
    const diagnostic = process.env.NODE_ENV === "development"
      ? error instanceof InquiryPersistenceError ? error.code : "unexpected_insert_failure"
      : undefined;
    if (diagnostic) console.warn("Inquiry save failed", { code: diagnostic });
    return json({ error: "save_failed", ...(diagnostic ? { diagnostic } : {}) }, 503);
  }
}
