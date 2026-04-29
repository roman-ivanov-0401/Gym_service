import type { NextRequest } from 'next/server';

/**
 * Origin для Location при редиректах. Если dev-сервер слушает 0.0.0.0, в req.url
 * попадает http://0.0.0.0:… — браузер не может открыть такой хост.
 */
export function safeRedirectOrigin(req: NextRequest): string {
  const xfHost = req.headers.get('x-forwarded-host');
  if (xfHost) {
    const proto = (req.headers.get('x-forwarded-proto') ?? 'https').split(',')[0].trim();
    return `${proto}://${xfHost.split(',')[0].trim()}`;
  }
  const host = req.headers.get('host');
  if (host && host !== '0.0.0.0' && !host.startsWith('0.0.0.0:')) {
    return `${req.nextUrl.protocol}//${host}`;
  }
  const u = new URL(req.url);
  if (u.hostname === '0.0.0.0' || u.hostname === '::') {
    u.hostname = '127.0.0.1';
  }
  return u.origin;
}
