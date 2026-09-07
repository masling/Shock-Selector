import fs from "node:fs";
import path from "node:path";
import { publishedMedia } from "@/lib/catalog/published-media";

export function previewModelKey(model: string) {
  return model.trim().toUpperCase().replace(/[×✕✖]/g, "X").replace(/\s+/g, "");
}

export function previewMedia(model: string): { file: string; source: string } | null {
  if (process.env.NODE_ENV === "production") return null;
  const key = previewModelKey(model);
  for (const filename of ["manifest.json", "pipe-catalog-manifest.json"]) {
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data/staging/ui-media", filename), "utf8"));
      if (!Object.hasOwn(manifest, key)) continue;
      const value = manifest[key];
      if (/^[a-f0-9]{64}\.(jpg|jpeg|png)$/.test(value.file)) return value;
    } catch { /* A missing local preview manifest does not block the catalog. */ }
  }
  return null;
}

export function productImageUrl(model: string): string | null {
  const key = previewModelKey(model);
  if (Object.hasOwn(publishedMedia, key)) return publishedMedia[key];
  return previewMedia(model) ? `/api/preview-product-image/${encodeURIComponent(previewModelKey(model))}` : null;
}

export const familyVisualModels: Record<string, string> = {
  "shock-absorbers": "EK42X50",
  "heavy-duty-buffers": "EI100X400",
  "wire-rope-vibration-isolators": "OVTW32-50-10",
  "special-vibration-isolators": "HGGS_SERIES",
  "rubber-vibration-isolators": "6JX-100",
  "flexible-pipe-connections": "JYXR_P",
};
