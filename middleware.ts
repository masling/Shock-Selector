import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAuthConfig, isAuthConfigured } from "@/lib/auth/config";
import { defaultLocale, getPathLocale, localeCookieName } from "@/lib/i18n/config";

function isBypassedPath(pathname: string) {
  return pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".");
}

function isPersonalizedPath(pathname: string) {
  return /^\/(?:en|zh-cn|de|fr|it)\/(?:account|staff|sign-in)(?:\/|$)/.test(pathname);
}

function isAuthRefreshPath(pathname: string) {
  return /^\/(?:en|zh-cn|de|fr|it)\/(?:account|staff|sign-in|inquiry)(?:\/|$)/.test(pathname);
}

function setPrivateNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
}

function updateForwardedCookieHeader(headers: Headers, cookies: ReturnType<NextRequest["cookies"]["getAll"]>) {
  const cookieHeader = cookies.map(({ name, value }) => `${name}=${encodeURIComponent(value)}`).join("; ");

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  } else {
    headers.delete("cookie");
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isBypassedPath(pathname)) {
    return NextResponse.next();
  }

  const pathnameLocale = getPathLocale(pathname);

  if (!pathnameLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-locale", pathnameLocale);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(localeCookieName, pathnameLocale, { path: "/", sameSite: "lax" });

  if (isPersonalizedPath(pathname)) {
    setPrivateNoStore(response);
  }

  if (!isAuthConfigured() || !isAuthRefreshPath(pathname)) {
    return response;
  }

  const authConfig = getAuthConfig();

  if (!authConfig) {
    return response;
  }

  const authClient = createServerClient(
    authConfig.url,
    authConfig.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          updateForwardedCookieHeader(requestHeaders, request.cookies.getAll());
          response = NextResponse.next({ request: { headers: requestHeaders } });
          response.cookies.set(localeCookieName, pathnameLocale, { path: "/", sameSite: "lax" });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          setPrivateNoStore(response);
        },
      },
    },
  );

  await authClient.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
