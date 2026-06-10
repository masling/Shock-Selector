import { defaultLocale, type Locale } from "@/lib/i18n/config";

export function catalogTranslationLocales(locale: Locale) {
  return locale === defaultLocale ? [defaultLocale] : [locale, defaultLocale];
}

export function getCatalogTranslation<T extends { locale: string }>(
  translations: T[],
  locale: Locale,
) {
  return translations.find((item) => item.locale === locale)
    ?? translations.find((item) => item.locale === defaultLocale)
    ?? translations[0];
}

export function getCatalogSpecLabel(
  spec: { labelEn: string; labelZh: string },
  locale: Locale,
) {
  const labels: Partial<Record<Locale, string>> = {
    en: spec.labelEn,
    "zh-cn": spec.labelZh,
  };

  return labels[locale] ?? spec.labelEn;
}
