import { NextRequest, NextResponse } from 'next/server';
import { applyAuthCookies } from '@/lib/cookies';
import { authServiceUrl } from '@/lib/env';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const upstream = await fetch(`${authServiceUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await upstream.json().catch(() => ({}));
  const res = NextResponse.json(json, { status: upstream.status });
  if (upstream.ok) {
    const d = json?.data as { accessToken?: string; refreshToken?: string } | undefined;
    if (d?.accessToken && d?.refreshToken) applyAuthCookies(res, d.accessToken, d.refreshToken);
  }
  return res;
}
