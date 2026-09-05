import { z } from "zod";
import type { CatalogModelListItem } from "@/lib/catalog/catalog-schemas";
import { getModelAnchorId } from "@/lib/catalog/model-anchor";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";

export type DirectorySearchParams = { q?: string | string[]; page?: string | string[] };
export const directoryPageSize = 20;
const querySchema = z.string().trim().max(80);
const pageSchema = z.coerce.number().int().min(1).max(10000).catch(1);

export function parseDirectorySearch(params: DirectorySearchParams) {
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const parsed = querySchema.safeParse(rawQuery ?? "");
  const query = parsed.success ? parsed.data : (rawQuery ?? "").slice(0, 80);
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  return { query, modelQuery: query.replace(/[×✕✖]/g, "X"), page: pageSchema.parse(rawPage ?? 1), valid: parsed.success };
}

export function directorySearchHref(locale: Locale, query: string, page = 1) {
  const params = new URLSearchParams({ q: query });
  if (page > 1) params.set("page", String(page));
  return getLocalizedHref(locale, `/products?${params}#catalog-results`);
}

export function directoryModelHref(locale: Locale, model: Pick<CatalogModelListItem, "familySlug" | "seriesSlug" | "model">) {
  return getLocalizedHref(locale, `/products/${model.familySlug}/${model.seriesSlug}?model=${encodeURIComponent(model.model)}#${getModelAnchorId(model.model)}`);
}

export function directoryQuoteHref(locale: Locale, model?: string) {
  return getLocalizedHref(locale, `/contact${model ? "?" + new URLSearchParams({ models: model }) : ""}`);
}

export function directoryKeySpecs(model: Pick<CatalogModelListItem, "specs">) {
  const available = model.specs.filter((spec) => spec.rawValue?.trim() || spec.value !== null);
  const priority = ["strokeMm", "energyPerCycleNm", "threadSize"];
  const preferred = priority.flatMap((key) => available.filter((spec) => spec.key === key));
  return [...preferred, ...available.filter((spec) => !priority.includes(spec.key))].slice(0, 3);
}
