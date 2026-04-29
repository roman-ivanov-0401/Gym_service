import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_ACCESS, COOKIE_REFRESH, applyAuthCookies, clearAuthCookiesOnResponse } from '@/lib/cookies';
import { authServiceUrl } from '@/lib/env';
import { safeRedirectOrigin } from '@/lib/server/redirect-origin';

const protectedPrefixes = ['/dashboard', '/profile', '/subscriptions', '/admin', '/feedback'];

function isProtected(pathname: string) {
  return protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthPage(pathname: string) {
  return pathname === '/login' || pathname === '/register';
}

async function refreshPair(refreshToken: string) {
  const res = await fetch(`${authServiceUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { accessToken: string; refreshToken: string } };
  const d = json?.data;
  if (!d?.accessToken || !d?.refreshToken) return null;
  return d;
}

async function meOk(accessToken: string) {
  const res = await fetch(`${authServiceUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.ok;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let access = req.cookies.get(COOKIE_ACCESS)?.value ?? null;
  const refresh = req.cookies.get(COOKIE_REFRESH)?.value ?? null;

  if (access && !(await meOk(access))) {
    access = null;
  }

  if (!access && refresh) {
    const pair = await refreshPair(refresh);
    if (pair) {
      access = pair.accessToken;
      const res = NextResponse.next();
      applyAuthCookies(res, pair.accessToken, pair.refreshToken);
      if (isAuthPage(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', safeRedirectOrigin(req)));
      }
      return res;
    }
    if (isProtected(pathname)) {
      const login = NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(pathname)}`, safeRedirectOrigin(req)),
      );
      clearAuthCookiesOnResponse(login);
      return login;
    }
    const cleared = NextResponse.next();
    clearAuthCookiesOnResponse(cleared);
    return cleared;
  }

  if (isProtected(pathname) && !access) {
    const url = new URL('/login', safeRedirectOrigin(req));
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage(pathname) && access) {
    return NextResponse.redirect(new URL('/dashboard', safeRedirectOrigin(req)));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
