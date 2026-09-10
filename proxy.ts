import { NextRequest, NextResponse } from "next/server";

/**
 * Public routes — accessible without authentication.
 *
 * Private routes (protected by JWT cookie check):
 *   /dashboard, /become-seller, /seller — handled here + client-side by SellerRoute
 */
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/contact",
  // NOTE: /become-seller and /seller are intentionally NOT listed here — they are private.
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("jwt")?.value;

  // If no token and visiting a private page → redirect to login
  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "?") || pathname.startsWith(r + "/")
  );

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
