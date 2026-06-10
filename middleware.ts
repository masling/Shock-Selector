import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { defaultLocale, getPathLocale, localeCookieName } from "@/lib/i18n/config";

function isBypassedPath(pathname: string) {
  return pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".");
}

export function middleware(request: NextRequest) {
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

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(localeCookieName, pathnameLocale, { path: "/", sameSite: "lax" });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
