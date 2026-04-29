'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_ACCESS, COOKIE_REFRESH, cookieOptions } from '@/lib/cookies';
import { authServiceUrl } from '@/lib/env';
import { messageFromResponseBody } from '@/lib/apiError';

export type AuthFormState = { error: string | null };

async function setSessionFromLogin(email: string, password: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await fetch(`${authServiceUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: messageFromResponseBody(json, 'Не удалось войти') };
  }
  const d = json?.data as { accessToken?: string; refreshToken?: string } | undefined;
  if (!d?.accessToken || !d?.refreshToken) {
    return { ok: false, message: 'Некорректный ответ сервера' };
  }
  const jar = await cookies();
  jar.set(COOKIE_ACCESS, d.accessToken, cookieOptions());
  jar.set(COOKIE_REFRESH, d.refreshToken, cookieOptions());
  return { ok: true };
}

/** Для `useActionState`: ошибка в state, успех — `redirect`. */
export async function loginFormAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const r = await setSessionFromLogin(email, password);
  if (!r.ok) return { error: r.message };
  redirect('/dashboard');
}

export async function registerAndLoginFormAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get('name') ?? '');
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'client');
  const reg = await fetch(`${authServiceUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  const regJson = await reg.json().catch(() => ({}));
  if (!reg.ok) {
    return { error: messageFromResponseBody(regJson, 'Не удалось зарегистрироваться') };
  }
  const login = await setSessionFromLogin(email, password);
  if (!login.ok) {
    redirect(`/login?notice=${encodeURIComponent('Аккаунт создан. Войдите с тем же паролем.')}`);
  }
  redirect('/dashboard');
}

export async function logoutAction() {
  const jar = await cookies();
  const token = jar.get(COOKIE_ACCESS)?.value;
  jar.delete(COOKIE_ACCESS);
  jar.delete(COOKIE_REFRESH);
  if (token) {
    await fetch(`${authServiceUrl()}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  redirect('/login');
}
