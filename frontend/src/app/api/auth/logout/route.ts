import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE_ACCESS, clearAuthCookiesOnResponse } from '@/lib/cookies';
import { authServiceUrl } from '@/lib/env';

export async function POST() {
  const jar = await cookies();
  const token = jar.get(COOKIE_ACCESS)?.value;
  if (token) {
    await fetch(`${authServiceUrl()}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  const res = NextResponse.json({ ok: true });
  clearAuthCookiesOnResponse(res);
  return res;
}
