import { NextResponse } from 'next/server';

const COOKIE = 'ppc_session';
const MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request) {
  const { password } = await request.json();

  if (!process.env.AUTH_PASSWORD) {
    return NextResponse.json({ error: 'AUTH_PASSWORD env var is not set.' }, { status: 500 });
  }

  if (password !== process.env.AUTH_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, process.env.AUTH_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
  return response;
}
