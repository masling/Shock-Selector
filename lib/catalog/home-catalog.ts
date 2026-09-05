import { getCatalogTranslation } from "@/lib/catalog/catalog-i18n";
import type { Locale } from "@/lib/i18n/config";

type FamilySource = {
  slug: string;
  translations: Array<{ locale: string; name: string; summary: string }>;
  series: Array<{ code: string }>;
};

/** Receives the published-family repository result; never truncates the category list. */
export function buildHomeCatalog(families: FamilySource[], locale: Locale) {
  return families.map((family) => {
    const translation = getCatalogTranslation(family.translations, locale);
    return {
      slug: family.slug,
      name: translation?.name ?? family.slug,
      summary: translation?.summary ?? "",
      language: translation?.locale === "zh-cn" ? "zh-CN" : translation?.locale,
      seriesCodes: family.series.map((series) => series.code),
    };
  });
}
