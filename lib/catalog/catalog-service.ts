import { getCatalogSpecLabel } from "@/lib/catalog/catalog-i18n";
import { catalogModelSearchSchema, type CatalogModelListItem, type CatalogModelSearchResult } from "@/lib/catalog/catalog-schemas";
import { searchCatalogModels } from "@/lib/catalog/catalog-repository";
import { resolveLocale } from "@/lib/i18n/config";

function localizedFamilyName(locale: string, translations: Array<{ locale: string; name: string }>, fallback: string) {
  return translations.find((item) => item.locale === locale)?.name ?? translations.find((item) => item.locale === "en")?.name ?? fallback;
}

function mapModel(item: Awaited<ReturnType<typeof searchCatalogModels>>["items"][number], locale: string): CatalogModelListItem {
  return {
    id: item.id,
    model: item.model,
    familySlug: item.series.family.slug,
    familyName: localizedFamilyName(locale, item.series.family.translations, item.series.family.slug),
    seriesSlug: item.series.slug,
    seriesCode: item.series.code,
    seriesName: item.series.name,
    selectorEligible: item.selectorEligible,
    selectorStatus: item.selectorStatus,
    catalogStatus: item.catalogStatus,
    primaryImageUrl: item.primaryImageUrl,
    specs: item.specValues.map((value) => ({
      key: value.specDefinition.key,
      label: getCatalogSpecLabel(value.specDefinition, resolveLocale(locale)),
      unit: value.specDefinition.unit,
      value: value.valueNumber?.toNumber() ?? value.valueText ?? null,
      rawValue: value.rawValue,
    })),
  };
}

export async function catalogModelSearchService(rawInput: unknown): Promise<CatalogModelSearchResult> {
  const input = catalogModelSearchSchema.parse(rawInput);
  const result = await searchCatalogModels(input);

  return {
    total: result.total,
    page: input.page,
    pageSize: input.pageSize,
    items: result.items.map((item) => mapModel(item, input.locale)),
  };
}
