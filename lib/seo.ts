import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

const productionSiteUrl = "https://www.vibroabsorber.com";

export const staticSeoPaths = [
  "",
  "/products",
  "/solutions",
  "/applications",
  "/downloads",
  "/about",
  "/contact",
  "/selector/buyer",
  "/selector/engineer",
] as const;

export type SeoPath = (typeof staticSeoPaths)[number] | `/${string}`;

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? productionSiteUrl;

  return configuredUrl.replace(/\/+$/, "");
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export function getLocalizedPath(locale: Locale, path: SeoPath) {
  const normalizedPath = path === "/" ? "" : path;
  return `/${locale}${normalizedPath}`;
}

export function getAbsoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

export function getLanguageAlternates(path: SeoPath) {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [locale, getAbsoluteUrl(getLocalizedPath(locale, path))]),
    ),
    "x-default": getAbsoluteUrl(getLocalizedPath(defaultLocale, path)),
  };
}

export function getLocalizedAlternates(locale: Locale, path: SeoPath): Metadata["alternates"] {
  return {
    canonical: getAbsoluteUrl(getLocalizedPath(locale, path)),
    languages: getLanguageAlternates(path),
  };
}
