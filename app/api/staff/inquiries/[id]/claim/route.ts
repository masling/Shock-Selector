import { staffJson, requireStaffSession, staffRouteParamsSchema } from "@/lib/inquiry-staff/api";
import { sameOriginMutation } from "@/lib/inquiry/request-security";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  if (!sameOriginMutation(request)) return staffJson({ error: "invalid_origin" }, 403);
  const parsedParams = staffRouteParamsSchema.safeParse(await params);
  if (!parsedParams.success) return staffJson({ error: "not_found" }, 404);

  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    return staffJson({ assignment: await session.repository.claim(parsedParams.data.id) });
  } catch {
    return staffJson({ error: "save_failed" }, 503);
  }
}
