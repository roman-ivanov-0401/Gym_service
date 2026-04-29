import { authServiceUrl } from '@/lib/env';
import type { User } from '@/lib/types';

export async function fetchMe(accessToken: string): Promise<User | null> {
  const res = await fetch(`${authServiceUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  // auth-service: sendSuccess(res, user) → { success, data: User }
  const json = (await res.json()) as { data?: User };
  return json?.data ?? null;
}

export async function refreshTokensRequest(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  const res = await fetch(`${authServiceUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { accessToken: string; refreshToken: string } };
  const d = json?.data;
  if (!d?.accessToken || !d?.refreshToken) return null;
  return { accessToken: d.accessToken, refreshToken: d.refreshToken };
}
