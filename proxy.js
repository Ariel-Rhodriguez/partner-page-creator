import { NextResponse } from 'next/server';

const COOKIE = 'ppc_session';
const PUBLIC_PATHS = ['/login', '/api/auth'];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico';

  if (isPublic) return NextResponse.next();

  const session = request.cookies.get(COOKIE);
  const valid = session?.value && session.value === process.env.AUTH_PASSWORD;

  if (!valid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
