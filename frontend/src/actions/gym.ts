'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/server/session';
import {
  createProfile,
  createSubscription,
  deleteSubscription,
  getMyProfile,
  updateProfile,
  updateSubscription,
} from '@/lib/server/gym-fetch';
import type { SubscriptionType } from '@/lib/types';

export async function saveProfileFields(data: {
  name: string;
  email: string;
  phone?: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const s = await getSession();
  if (!s) return { ok: false, message: 'Нет сессии' };
  try {
    const existing = await getMyProfile(s.accessToken);
    if (existing.ok) {
      await updateProfile(s.accessToken, data);
    } else if (existing.status === 404) {
      await createProfile(s.accessToken, data);
    } else {
      return { ok: false, message: 'Не удалось сохранить' };
    }
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch {
    return { ok: false, message: 'Не удалось сохранить' };
  }
}

/** Нативная форма профиля: прогрессивное улучшение без JS. */
export async function saveProfileFormAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phoneRaw = String(formData.get('phone') ?? '').trim();
  const r = await saveProfileFields({ name, email, phone: phoneRaw || undefined });
  if (!r.ok) redirect(`/profile?error=${encodeURIComponent(r.message)}`);
  redirect('/profile?saved=1');
}

export async function createSubscriptionAction(data: {
  type: SubscriptionType;
  startDate: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const s = await getSession();
  if (!s) return { ok: false, message: 'Нет сессии' };
  try {
    await createSubscription(s.accessToken, data);
    revalidatePath('/subscriptions');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch {
    return { ok: false, message: 'Не удалось создать абонемент' };
  }
}

export async function createSubscriptionFormAction(formData: FormData) {
  const type = String(formData.get('type') ?? 'monthly') as SubscriptionType;
  const startRaw = String(formData.get('startDate') ?? '');
  const startDate = new Date(startRaw).toISOString();
  const r = await createSubscriptionAction({ type, startDate });
  if (!r.ok) redirect(`/subscriptions?new=1&error=${encodeURIComponent(r.message)}`);
  redirect('/subscriptions?created=1');
}

export async function updateSubscriptionAction(
  id: string,
  data: { type?: SubscriptionType; startDate?: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const s = await getSession();
  if (!s) return { ok: false, message: 'Нет сессии' };
  try {
    await updateSubscription(s.accessToken, id, data);
    revalidatePath('/subscriptions');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch {
    return { ok: false, message: 'Не удалось обновить' };
  }
}

export async function updateSubscriptionFormAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const type = String(formData.get('type') ?? 'monthly') as SubscriptionType;
  const startRaw = String(formData.get('startDate') ?? '');
  const startDate = new Date(startRaw).toISOString();
  const r = await updateSubscriptionAction(id, { type, startDate });
  if (!r.ok) redirect(`/subscriptions?edit=${encodeURIComponent(id)}&error=${encodeURIComponent(r.message)}`);
  redirect('/subscriptions?updated=1');
}

export async function deleteSubscriptionAction(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const s = await getSession();
  if (!s) return { ok: false, message: 'Нет сессии' };
  try {
    await deleteSubscription(s.accessToken, id);
    revalidatePath('/subscriptions');
    revalidatePath('/dashboard');
    return { ok: true };
  } catch {
    return { ok: false, message: 'Не удалось удалить' };
  }
}

export async function deleteSubscriptionFormAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const r = await deleteSubscriptionAction(id);
  if (!r.ok) redirect(`/subscriptions?error=${encodeURIComponent(r.message)}`);
  redirect('/subscriptions?deleted=1');
}
