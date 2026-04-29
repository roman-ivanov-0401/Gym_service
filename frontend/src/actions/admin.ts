'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authServiceUrl } from '@/lib/env';
import { getSession } from '@/lib/server/session';
import { adminCreateClient, adminCreateSubscription, adminDeleteClient } from '@/lib/server/gym-fetch';
import type { SubscriptionType } from '@/lib/types';

function extractUserId(json: unknown): string | undefined {
  const j = json as {
    data?: { user?: { id?: string }; id?: string };
    id?: string;
  };
  return j?.data?.user?.id ?? j?.data?.id ?? j?.id;
}

async function runAdminCreateUser(formData: FormData): Promise<{ ok: true } | { ok: false; message: string }> {
  const s = await getSession();
  if (!s || s.user.role !== 'admin') return { ok: false, message: 'Доступ запрещён' };

  const name = String(formData.get('name') ?? '');
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'client') as 'client' | 'admin';

  const reg = await fetch(`${authServiceUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  const regJson = await reg.json().catch(() => ({}));
  if (!reg.ok) {
    const msg =
      (regJson as { error?: { message?: string } })?.error?.message ??
      (regJson as { message?: string })?.message ??
      'Не удалось создать пользователя';
    return { ok: false, message: msg };
  }

  const userId = extractUserId(regJson);
  if (userId && role === 'client') {
    try {
      await adminCreateClient(s.accessToken, { userId, name, email });
    } catch {
      /* профиль в gym мог не создаться */
    }
  }
  revalidatePath('/admin');
  return { ok: true };
}

export async function adminCreateUserFormAction(formData: FormData) {
  const r = await runAdminCreateUser(formData);
  if (!r.ok) redirect(`/admin/users/new?error=${encodeURIComponent(r.message)}`);
  redirect('/admin?msg=' + encodeURIComponent('Пользователь создан'));
}

export async function adminDeleteClientAction(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const s = await getSession();
  if (!s || s.user.role !== 'admin') return { ok: false, message: 'Доступ запрещён' };
  try {
    await adminDeleteClient(s.accessToken, id);
    revalidatePath('/admin');
    return { ok: true };
  } catch {
    return { ok: false, message: 'Не удалось удалить клиента' };
  }
}

export async function adminDeleteClientFormAction(formData: FormData) {
  const id = String(formData.get('clientId') ?? '');
  if (!id) redirect('/admin?delErr=' + encodeURIComponent('Не указан клиент'));
  const confirm = formData.get('confirm_delete') === 'on';
  if (!confirm) {
    redirect(`/admin?client=${encodeURIComponent(id)}&delErr=${encodeURIComponent('Подтвердите удаление галочкой')}`);
  }
  const r = await adminDeleteClientAction(id);
  if (!r.ok) redirect(`/admin?delErr=${encodeURIComponent(r.message)}`);
  redirect('/admin?msg=' + encodeURIComponent('Клиент удалён'));
}

export async function adminCreateSubscriptionAction(
  clientId: string,
  data: { type: SubscriptionType; startDate: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const s = await getSession();
  if (!s || s.user.role !== 'admin') return { ok: false, message: 'Доступ запрещён' };
  try {
    await adminCreateSubscription(s.accessToken, clientId, data);
    revalidatePath('/admin');
    return { ok: true };
  } catch {
    return { ok: false, message: 'Не удалось создать абонемент' };
  }
}

export async function adminCreateSubscriptionFormAction(formData: FormData) {
  const clientId = String(formData.get('clientId') ?? '');
  const type = String(formData.get('type') ?? 'monthly') as SubscriptionType;
  const startRaw = String(formData.get('startDate') ?? '');
  const startDate = new Date(startRaw).toISOString();
  const r = await adminCreateSubscriptionAction(clientId, { type, startDate });
  if (!r.ok) {
    redirect(`/admin?client=${encodeURIComponent(clientId)}&subErr=${encodeURIComponent(r.message)}`);
  }
  redirect(`/admin?client=${encodeURIComponent(clientId)}&subOk=1`);
}

export async function adminRefreshAction() {
  revalidatePath('/admin');
  redirect('/admin');
}
