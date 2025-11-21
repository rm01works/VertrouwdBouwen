import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Skip middleware for API routes, static files, and Next.js internals
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/images/')
    ) {
      return NextResponse.next();
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard'];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Only check auth for protected routes
    if (isProtectedRoute) {
      // Check if user has auth cookie
      const token = request.cookies.get('token');
      
      // Debug logging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] ${request.method} ${pathname}`);
        console.log(`[Middleware] Token cookie:`, token ? 'present' : 'missing');
        const allCookies = request.cookies.getAll();
        console.log(`[Middleware] All cookies:`, allCookies.map(c => c.name));
        if (token) {
          console.log(`[Middleware] Token value preview:`, token.value.substring(0, 20) + '...');
        }
      }

      // Only redirect if we're certain there's no token
      // If token exists (even if invalid), let the request through
      // The client-side auth check in the layout will handle invalid tokens
      if (!token || !token.value) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Middleware] Redirecting ${pathname} to / (no token)`);
        }
        const redirectUrl = new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    // If middleware throws an error, log it and let the request through
    // This prevents middleware errors from breaking static asset serving
    console.error('[Middleware] Error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internal files - static, chunks, etc.)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next|favicon.ico).*)',
  ],
};

