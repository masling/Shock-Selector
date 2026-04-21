import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  calculatorService,
  UnsupportedScenarioError,
} from "@/lib/calculators/calculator-service";
import { localizeCalculateResponse } from "@/lib/calculators/presenter";
import { resolveLocale } from "@/lib/i18n/config";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const locale = resolveLocale(
      typeof body === "object" && body && "locale" in body ? String(body.locale) : undefined,
    );
    const result = await calculatorService(body);
    return NextResponse.json(localizeCalculateResponse(result, locale));
  } catch (error) {
    if (error instanceof UnsupportedScenarioError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid calculate payload.", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Calculate request failed", error);
    return NextResponse.json(
      { message: "We could not complete the sizing request right now. Please try again in a moment." },
      { status: 500 },
    );
  }
}
