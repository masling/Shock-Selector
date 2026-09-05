import { defaultLocale, getPathLocale, isLocale, type Locale } from "@/lib/i18n/config";

const localOrigin = "https://vibroabsorber.local";
const unsafeRedirectPattern = /[\u0000-\u001f\u007f\\%]/;

type RedirectInput = string | string[] | null | undefined;

function firstValue(value: RedirectInput) {
  return Array.isArray(value) ? value[0] : value;
}

export function getDefaultAuthRedirect(locale: Locale = defaultLocale) {
  return `/${locale}/account/inquiries`;
}

export function getSafeAuthRedirect(value: RedirectInput, fallbackLocale: Locale = defaultLocale) {
  const fallback = getDefaultAuthRedirect(fallbackLocale);
  const rawValue = firstValue(value);

  if (!rawValue) {
    return fallback;
  }

  const trimmedValue = rawValue.trim();

  if (
    !trimmedValue.startsWith("/") ||
    trimmedValue.startsWith("//") ||
    trimmedValue.length > 300 ||
    unsafeRedirectPattern.test(trimmedValue)
  ) {
    return fallback;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedValue, localOrigin);
  } catch {
    return fallback;
  }

  if (parsedUrl.origin !== localOrigin) {
    return fallback;
  }

  const locale = getPathLocale(parsedUrl.pathname);

  if (!locale) {
    return fallback;
  }

  const accountRoot = `/${locale}/account/inquiries`;
  const inquiryPath = `/${locale}/inquiry`;
  const isAccountInquiryPath =
    parsedUrl.pathname === accountRoot ||
    parsedUrl.pathname.startsWith(`${accountRoot}/`);
  const isInquiryDraftPath = parsedUrl.pathname === inquiryPath;

  if (!isAccountInquiryPath && !isInquiryDraftPath) {
    return fallback;
  }

  return `${parsedUrl.pathname}${parsedUrl.search}`;
}

export function getLocaleFromAuthRedirect(pathname: string, fallbackLocale: Locale = defaultLocale) {
  const locale = getPathLocale(pathname);
  return isLocale(locale) ? locale : fallbackLocale;
}

export function getSignInPath(locale: Locale, nextPath?: string, error?: string) {
  const params = new URLSearchParams();

  if (nextPath) {
    params.set("next", nextPath);
  }

  if (error) {
    params.set("error", error);
  }

  const query = params.toString();
  return `/${locale}/sign-in${query ? `?${query}` : ""}`;
}

export function isAllowedAuthOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (secFetchSite === "same-origin") {
    return true;
  }

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
