import { NextResponse } from "next/server";
import { z } from "zod";
import { getStaffInquirySession } from "./staff-repository";

export const staffJson = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export const staffRouteParamsSchema = z.object({ id: z.uuid() }).strict();

type StaffSession = NonNullable<Awaited<ReturnType<typeof getStaffInquirySession>>>;

type RequireStaffSessionResult =
  | { session: StaffSession; response: null }
  | { session: null; response: NextResponse };

export async function requireStaffSession(): Promise<RequireStaffSessionResult> {
  try {
    const session = await getStaffInquirySession();
    if (!session) {
      return { session: null, response: staffJson({ error: "staff_required" }, 403) };
    }
    return { session, response: null };
  } catch {
    return { session: null, response: staffJson({ error: "staff_unavailable" }, 503) };
  }
}
