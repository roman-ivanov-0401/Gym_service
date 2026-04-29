import { cookies } from 'next/headers';
import { COOKIE_ACCESS, COOKIE_REFRESH } from '@/lib/cookies';
import { fetchMe, refreshTokensRequest } from '@/lib/server/auth-fetch';
import type { User } from '@/lib/types';

export type ServerSession = { user: User; accessToken: string };

/** Сессия для RSC / server actions: cookie или refresh в памяти (cookie обновит middleware). */
export async function getSession(): Promise<ServerSession | null> {
  const jar = await cookies();
  let access = jar.get(COOKIE_ACCESS)?.value ?? null;
  const refresh = jar.get(COOKIE_REFRESH)?.value ?? null;

  if (!access && refresh) {
    const pair = await refreshTokensRequest(refresh);
    if (pair) access = pair.accessToken;
  }

  if (!access) return null;
  const user = await fetchMe(access);
  if (!user) return null;
  return { user, accessToken: access };
}
