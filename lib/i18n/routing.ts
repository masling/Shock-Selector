import type { Locale } from "@/lib/i18n/config";
import { getPathLocale } from "@/lib/i18n/config";

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  );
}

export function getLocalizedHref(locale: Locale, href: string) {
  if (!href || isExternalHref(href)) {
    return href;
  }

  const normalizedHref = href.startsWith("/") ? href : `/${href}`;

  if (getPathLocale(normalizedHref)) {
    return normalizedHref;
  }

  return normalizedHref === "/" ? `/${locale}` : `/${locale}${normalizedHref}`;
}

export function replaceLocaleInPathname(pathname: string, locale: Locale) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const currentLocale = getPathLocale(normalizedPath);

  if (!currentLocale) {
    return getLocalizedHref(locale, normalizedPath);
  }

  const segments = normalizedPath.split("/").filter(Boolean);
  segments[0] = locale;

  return `/${segments.join("/")}`;
}
