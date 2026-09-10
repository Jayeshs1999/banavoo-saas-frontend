import { NextRequest, NextResponse } from "next/server";

/**
 * Public routes — no auth required.
 * Add any path that should be accessible without a token.
 */
const PUBLIC_ROUTES = ["/", "/login", "/register", "/about", "/contact"];

/**
 * Auth routes — redirect to dashboard if already logged in.
 */
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("authToken")?.value;

  // If logged in and hitting an auth page → send to dashboard
  if (token && AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If not logged in and hitting a private page → send to login
  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r)
  );
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
