import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/images/')
    ) {
      return NextResponse.next();
    }

    const protectedRoutes = ['/dashboard'];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      const token = request.cookies.get('token');
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] ${request.method} ${pathname}`);
        console.log(`[Middleware] Token cookie:`, token ? 'present' : 'missing');
        const allCookies = request.cookies.getAll();
        console.log(`[Middleware] All cookies:`, allCookies.map(c => c.name));
        if (token) {
          console.log(`[Middleware] Token value preview:`, token.value.substring(0, 20) + '...');
        }
      }

      // Let request through if token exists (even if invalid) - client-side auth check handles invalid tokens
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
    // Let request through on error to prevent middleware errors from breaking static asset serving
    console.error('[Middleware] Error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (Next.js internal files - static, chunks, etc.)
     * - favicon.ico (favicon file)
     */
    '/((?!_next|favicon.ico).*)',
  ],
};

