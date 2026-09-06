import { staffJson, requireStaffSession, staffRouteParamsSchema } from "@/lib/inquiry-staff/api";
import { staffStatusSchema } from "@/lib/inquiry-staff/schemas";
import { boundedJson, sameOriginMutation } from "@/lib/inquiry/request-security";
import { runNotificationWorkerAfterMutation } from "@/lib/notifications/worker";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  if (!sameOriginMutation(request)) return staffJson({ error: "invalid_origin" }, 403);
  const parsedParams = staffRouteParamsSchema.safeParse(await params);
  if (!parsedParams.success) return staffJson({ error: "not_found" }, 404);

  let input: ReturnType<typeof staffStatusSchema.safeParse>;
  try {
    input = staffStatusSchema.safeParse((await boundedJson(request, 4096) as { status?: unknown }).status);
  } catch {
    return staffJson({ error: "invalid_request" }, 400);
  }
  if (!input.success) return staffJson({ error: "invalid_request" }, 400);

  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    const inquiry = await session.repository.updateStatus(parsedParams.data.id, input.data);
    await runNotificationWorkerAfterMutation();
    return staffJson({ inquiry });
  } catch {
    return staffJson({ error: "save_failed" }, 503);
  }
}
