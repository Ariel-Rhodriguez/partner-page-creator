import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth'];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico';

  if (isPublic) return NextResponse.next();

  // Check for a NextAuth session cookie (secure or non-secure)
  const sessionCookie =
    request.cookies.get('__Secure-next-auth.session-token') ||
    request.cookies.get('next-auth.session-token');

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
