import fs from "node:fs/promises";
import path from "node:path";
import { previewMedia } from "@/lib/catalog/product-media";

export async function GET(_request: Request, context: { params: Promise<{ model: string }> }) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const { model } = await context.params;
  const image = previewMedia(model);
  if (!image) return new Response(null, { status: 404 });
  try {
    const bytes = await fs.readFile(path.join(process.cwd(), "data/staging/ui-media", image.file));
    return new Response(bytes, { headers: { "Content-Type": image.file.endsWith("png") ? "image/png" : "image/jpeg", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, noimageindex", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response(null, { status: 404 }); }
}
