import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/auth/supabase-server";
import { isAllowedAuthOrigin } from "@/lib/auth/redirects";
import { defaultLocale, localeCookieName, resolveLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAllowedAuthOrigin(request)) {
    return NextResponse.json({ success: false }, { status: 403, headers: { "Cache-Control": "private, no-store" } });
  }

  const requestUrl = new URL(request.url);
  const cookieLocale = resolveLocale(request.headers.get("cookie")?.match(new RegExp(`${localeCookieName}=([^;]+)`))?.[1]);
  const locale = resolveLocale(requestUrl.searchParams.get("locale") || cookieLocale || defaultLocale);
  const authClient = await createAuthClient();

  if (authClient) {
    await authClient.auth.signOut();
  }

  const response = NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url), { status: 303 });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
