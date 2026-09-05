import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/auth/supabase-server";
import {
  getLocaleFromAuthRedirect,
  getSafeAuthRedirect,
  getSignInPath,
} from "@/lib/auth/redirects";
import { defaultLocale, localeCookieName, resolveLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const fallbackLocale = resolveLocale(requestUrl.pathname.split("/").filter(Boolean)[0]) || defaultLocale;
  const cookieLocale = resolveLocale(request.headers.get("cookie")?.match(new RegExp(`${localeCookieName}=([^;]+)`))?.[1]);
  const nextPath = getSafeAuthRedirect(requestUrl.searchParams.get("next"), cookieLocale || fallbackLocale);
  const locale = getLocaleFromAuthRedirect(nextPath, cookieLocale || fallbackLocale);
  const code = requestUrl.searchParams.get("code");
  const authClient = await createAuthClient();

  if (!authClient || !code) {
    return redirectWithNoStore(request, getSignInPath(locale, nextPath, "auth_unavailable"));
  }

  const { error } = await authClient.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectWithNoStore(request, getSignInPath(locale, nextPath, "auth_failed"));
  }

  return redirectWithNoStore(request, nextPath);
}

function redirectWithNoStore(request: Request, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
