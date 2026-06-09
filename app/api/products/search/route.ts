import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { catalogModelSearchService } from "@/lib/catalog/catalog-service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await catalogModelSearchService(payload);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Invalid product search input.", issues: error.issues }, { status: 400 });
    }

    console.error("Product search failed.", error);
    return NextResponse.json({ message: "Product search failed." }, { status: 500 });
  }
}
