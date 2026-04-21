import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { resolveLocale } from "@/lib/i18n/config";
import { localizeScenarioCatalog } from "@/lib/i18n/scenario-copy";
import { getScenarioCatalog } from "@/lib/scenarios/registry";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = resolveLocale(searchParams.get("locale"));
    const result = getScenarioCatalog({
      entryKey: searchParams.get("entryKey") ?? undefined,
      familyKey: searchParams.get("familyKey") ?? undefined,
      motionKind: searchParams.get("motionKind") ?? undefined,
      implementedOnly: searchParams.get("implementedOnly") ?? undefined,
    });

    return NextResponse.json(localizeScenarioCatalog(result, locale));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid scenario query.", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Scenario catalog request failed", error);
    return NextResponse.json(
      { message: "Scenario catalog request failed." },
      { status: 500 },
    );
  }
}
