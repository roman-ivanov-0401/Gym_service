import type { NextResponse } from 'next/server';

export const COOKIE_ACCESS = 'gym_access_token';
export const COOKIE_REFRESH = 'gym_refresh_token';

const isProd = process.env.NODE_ENV === 'production';

export function cookieOptions(maxAgeSeconds?: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    path: '/',
    ...(maxAgeSeconds != null ? { maxAge: maxAgeSeconds } : {}),
  };
}

export function applyAuthCookies(res: NextResponse, accessToken: string, refreshToken: string) {
  res.cookies.set(COOKIE_ACCESS, accessToken, cookieOptions());
  res.cookies.set(COOKIE_REFRESH, refreshToken, cookieOptions());
}

export function clearAuthCookiesOnResponse(res: NextResponse) {
  res.cookies.delete(COOKIE_ACCESS);
  res.cookies.delete(COOKIE_REFRESH);
}
