import { gymServiceUrl } from '@/lib/env';
import type { Client, ClientWithSubscriptions, Subscription, SubscriptionType } from '@/lib/types';

async function gymJson<T>(accessToken: string, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${gymServiceUrl()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getMyProfile(accessToken: string): Promise<{ ok: true; data: Client } | { ok: false; status: number }> {
  const res = await gymJson<Client>(accessToken, '/clients/me');
  if (res.status === 404) return { ok: false, status: 404 };
  if (!res.ok) return { ok: false, status: res.status };
  return { ok: true, data: (await res.json()) as Client };
}

export async function getMySubscriptions(accessToken: string): Promise<Subscription[]> {
  const res = await gymJson<Subscription[]>(accessToken, '/subscriptions/my');
  if (!res.ok) throw new Error('subscriptions');
  return (await res.json()) as Subscription[];
}

export async function adminGetAllClients(accessToken: string): Promise<ClientWithSubscriptions[]> {
  const res = await gymJson<ClientWithSubscriptions[]>(accessToken, '/admin/clients');
  if (!res.ok) throw new Error('admin clients');
  return (await res.json()) as ClientWithSubscriptions[];
}

export async function createProfile(
  accessToken: string,
  data: { name: string; email: string; phone?: string },
): Promise<Client> {
  const res = await gymJson(accessToken, '/clients/me', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('create profile');
  return (await res.json()) as Client;
}

export async function updateProfile(
  accessToken: string,
  data: { name: string; email: string; phone?: string },
): Promise<Client> {
  const res = await gymJson(accessToken, '/clients/me', { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('update profile');
  return (await res.json()) as Client;
}

export async function createSubscription(
  accessToken: string,
  data: { type: SubscriptionType; startDate: string },
): Promise<void> {
  const res = await gymJson(accessToken, '/subscriptions', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('create subscription');
}

export async function updateSubscription(
  accessToken: string,
  id: string,
  data: { type?: SubscriptionType; startDate?: string },
): Promise<void> {
  const res = await gymJson(accessToken, `/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('update subscription');
}

export async function deleteSubscription(accessToken: string, id: string): Promise<void> {
  const res = await gymJson(accessToken, `/subscriptions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('delete subscription');
}

export async function adminDeleteClient(accessToken: string, id: string): Promise<void> {
  const res = await gymJson(accessToken, `/admin/clients/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('delete client');
}

export async function adminCreateClient(
  accessToken: string,
  data: { userId: string; name: string; email: string; phone?: string },
): Promise<void> {
  const res = await gymJson(accessToken, '/admin/clients', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('create client');
}

export async function adminCreateSubscription(
  accessToken: string,
  clientId: string,
  data: { type: SubscriptionType; startDate: string },
): Promise<void> {
  const res = await gymJson(accessToken, `/admin/clients/${clientId}/subscriptions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('admin create subscription');
}
