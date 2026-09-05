import { staffJson, requireStaffSession, staffRouteParamsSchema } from "@/lib/inquiry-staff/api";
import { quoteDraftSchema } from "@/lib/inquiry-staff/schemas";
import { boundedJson, sameOriginMutation } from "@/lib/inquiry/request-security";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  if (!sameOriginMutation(request)) return staffJson({ error: "invalid_origin" }, 403);
  const parsedParams = staffRouteParamsSchema.safeParse(await params);
  if (!parsedParams.success) return staffJson({ error: "not_found" }, 404);

  let body: unknown;
  try {
    body = await boundedJson(request, 65536);
  } catch {
    return staffJson({ error: "invalid_request" }, 400);
  }

  const action = typeof body === "object" && body ? (body as { action?: unknown }).action : null;
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    if (action === "approve") return staffJson({ quote: await session.repository.approveQuote(parsedParams.data.id) });
    if (action === "publish") return staffJson({ quote: await session.repository.publishQuote(parsedParams.data.id), notificationStatus: "pending" });

    const payload = typeof body === "object" && body ? (body as { payload?: unknown }).payload : null;
    const input = quoteDraftSchema.safeParse(payload);
    if (!input.success) return staffJson({ error: "invalid_request" }, 400);
    return staffJson({ quote: await session.repository.saveQuoteDraft(parsedParams.data.id, input.data) });
  } catch {
    return staffJson({ error: "save_failed" }, 503);
  }
}
