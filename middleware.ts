import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/about',
  '/contact',
  '/',
  '/review',    // review invite pages are token-protected, no auth needed
  '/gallery',   // PG owner visit gallery — public to all
];

// Auth routes (login/register)
const authRoutes = [
  '/user/login',
  '/user/register',
  '/admin/login',
  '/admin/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth token from cookies
  const token = request.cookies.get('authToken')?.value;
  const userType = request.cookies.get('userType')?.value; // 'user' or 'admin'

  // If user is authenticated (has token)
  if (token && userType) {
    // Prevent access to login/register pages - redirect to respective dashboard
    if (authRoutes.some(route => pathname === route || pathname.startsWith(route))) {
      const dashboardPath = userType === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Check for role mismatch on private routes
    if (pathname.startsWith('/user') && userType !== 'user') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (pathname.startsWith('/admin') && userType !== 'admin') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }

    // Allow access to private routes
    return NextResponse.next();
  }

  // Check if route is public (no auth required)
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  // If public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Private routes: check if user is authenticated
  if (!token) {
    // Redirect to appropriate login page
    const loginPath = pathname.startsWith('/admin') ? '/admin/login' : '/user/login';
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  // Allow access to private routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
