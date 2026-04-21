export const locales = ["en", "zh-cn", "de", "fr", "it"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookieName = "ekd-locale";

const localeAliases: Record<string, Locale> = {
  en: "en",
  "en-us": "en",
  zh: "zh-cn",
  "zh-cn": "zh-cn",
  "zh_cn": "zh-cn",
  de: "de",
  fr: "fr",
  it: "it",
};

export const htmlLangByLocale: Record<Locale, string> = {
  en: "en",
  "zh-cn": "zh-CN",
  de: "de",
  fr: "fr",
  it: "it",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function resolveLocale(value: string | null | undefined): Locale {
  if (!value) {
    return defaultLocale;
  }

  return localeAliases[value.trim().toLowerCase()] ?? defaultLocale;
}

export function getPathLocale(pathname: string): Locale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : null;
}
