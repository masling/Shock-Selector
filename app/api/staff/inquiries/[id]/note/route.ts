import { staffJson, requireStaffSession, staffRouteParamsSchema } from "@/lib/inquiry-staff/api";
import { internalNoteSchema } from "@/lib/inquiry-staff/schemas";
import { boundedJson, sameOriginMutation } from "@/lib/inquiry/request-security";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  if (!sameOriginMutation(request)) return staffJson({ error: "invalid_origin" }, 403);
  const parsedParams = staffRouteParamsSchema.safeParse(await params);
  if (!parsedParams.success) return staffJson({ error: "not_found" }, 404);

  let input: ReturnType<typeof internalNoteSchema.safeParse>;
  try {
    input = internalNoteSchema.safeParse(await boundedJson(request, 16384));
  } catch {
    return staffJson({ error: "invalid_request" }, 400);
  }
  if (!input.success) return staffJson({ error: "invalid_request" }, 400);

  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    return staffJson({ note: await session.repository.addInternalNote(parsedParams.data.id, input.data.body) }, 201);
  } catch {
    return staffJson({ error: "save_failed" }, 503);
  }
}
