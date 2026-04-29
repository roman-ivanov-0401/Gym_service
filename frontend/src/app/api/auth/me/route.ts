import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_ACCESS } from '@/lib/cookies';
import { authServiceUrl } from '@/lib/env';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_ACCESS)?.value;
  if (!token) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }
  const upstream = await fetch(`${authServiceUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
