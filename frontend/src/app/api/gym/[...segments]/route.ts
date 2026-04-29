import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_ACCESS } from '@/lib/cookies';
import { gymServiceUrl } from '@/lib/env';

async function handle(req: NextRequest, ctx: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await ctx.params;
  const path = '/' + segments.join('/');
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  if (!token) {
    return NextResponse.json({ error: { message: 'Требуется авторизация' } }, { status: 401 });
  }

  const target = `${gymServiceUrl()}${path}${req.nextUrl.search}`;
  const method = req.method;
  const hasBody = !['GET', 'HEAD'].includes(method);
  const body = hasBody ? await req.arrayBuffer() : undefined;
  const contentType = req.headers.get('content-type');

  const upstream = await fetch(target, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(contentType && hasBody ? { 'Content-Type': contentType } : {}),
    },
    body: body && body.byteLength > 0 ? body : undefined,
    cache: 'no-store',
  });

  const ct = upstream.headers.get('content-type') ?? 'application/json';
  const buf = await upstream.arrayBuffer();
  return new NextResponse(buf, { status: upstream.status, headers: { 'content-type': ct } });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
