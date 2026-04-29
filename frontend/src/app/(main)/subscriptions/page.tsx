import { redirect } from 'next/navigation';
import SubscriptionsBody, { type SubscriptionsSearch } from '@/components/subscriptions/SubscriptionsBody';
import { getMySubscriptions } from '@/lib/server/gym-fetch';
import { getSession } from '@/lib/server/session';

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<SubscriptionsSearch> }) {
  const s = await getSession();
  if (!s) redirect('/login');

  const sp = await searchParams;

  let subscriptions: Awaited<ReturnType<typeof getMySubscriptions>> = [];
  try {
    subscriptions = await getMySubscriptions(s.accessToken);
  } catch {
    subscriptions = [];
  }

  return <SubscriptionsBody subscriptions={subscriptions} isAdmin={s.user.role === 'admin'} sp={sp} />;
}
