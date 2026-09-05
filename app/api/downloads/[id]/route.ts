import { NextResponse } from "next/server";
import { createModelDownload } from "@/lib/downloads/download-service";
import { sameOriginMutation } from "@/lib/inquiry/request-security";

export const dynamic = "force-dynamic";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
  if (!sameOriginMutation(request)) return NextResponse.json({ error: "invalid_origin" }, { status: 403, headers });
  try {
    const result = await createModelDownload((await params).id);
    return NextResponse.json(result, { status: result.status, headers });
  } catch { return NextResponse.json({ error: "unavailable" }, { status: 503, headers }); }
}
