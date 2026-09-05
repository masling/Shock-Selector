import { staffJson, requireStaffSession } from "@/lib/inquiry-staff/api";
import { staffStatusSchema } from "@/lib/inquiry-staff/schemas";

export const dynamic = "force-dynamic";

function parsePage(value: string | null) {
  const page = Number(value ?? 1);
  return Number.isInteger(page) && page > 0 && page <= 10000 ? page : 1;
}

export async function GET(request: Request) {
  const { session, response } = await requireStaffSession();
  if (!session) return response;

  const requestUrl = new URL(request.url);
  const status = staffStatusSchema.safeParse(requestUrl.searchParams.get("status"));

  try {
    return staffJson(await session.repository.list(parsePage(requestUrl.searchParams.get("page")), status.success ? status.data : undefined));
  } catch {
    return staffJson({ error: "staff_unavailable" }, 503);
  }
}
