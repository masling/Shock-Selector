import { staffJson, requireStaffSession, staffRouteParamsSchema } from "@/lib/inquiry-staff/api";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const parsedParams = staffRouteParamsSchema.safeParse(await params);
  if (!parsedParams.success) return staffJson({ error: "not_found" }, 404);

  const { session, response } = await requireStaffSession();
  if (!session) return response;

  try {
    return staffJson(await session.repository.detail(parsedParams.data.id));
  } catch {
    return staffJson({ error: "not_found" }, 404);
  }
}
