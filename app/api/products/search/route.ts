import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { productSearchService } from "@/lib/products/product-search-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await productSearchService(body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid search payload.", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Product search failed", error);
    return NextResponse.json(
      { message: "We could not complete the product search right now. Please try again in a moment." },
      { status: 500 },
    );
  }
}
