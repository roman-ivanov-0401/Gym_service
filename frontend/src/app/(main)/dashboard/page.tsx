import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMyProfile, getMySubscriptions } from '@/lib/server/gym-fetch';
import { getSession } from '@/lib/server/session';
import { subscriptionLabelRu } from '@/lib/types';

const card = 'bg-white rounded-xl shadow-card p-6 border border-zinc-200/80';

export default async function DashboardPage() {
  const s = await getSession();
  if (!s) redirect('/login');

  const profileRes = await getMyProfile(s.accessToken);
  let subscriptions: Awaited<ReturnType<typeof getMySubscriptions>> = [];
  try {
    subscriptions = await getMySubscriptions(s.accessToken);
  } catch {
    subscriptions = [];
  }

  const profile = profileRes.ok ? profileRes.data : null;
  const now = new Date();
  const activeSubscriptions = subscriptions.filter((sub) => now <= new Date(sub.endDate));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Привет, {s.user.name}!</h1>
          <p className="text-zinc-500 text-sm mt-1">Сводка по абонементам и профилю</p>
        </div>
        {s.user.role === 'admin' && (
          <Link
            href="/admin"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white text-sm font-semibold rounded-lg transition shadow-card"
          >
            Панель администратора
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={card}>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Статус</p>
          <p className="text-xl font-bold text-zinc-900 mt-1">{profile ? 'Активный клиент' : 'Профиль не создан'}</p>
        </div>
        <div className={card}>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Всего абонементов</p>
          <p className="text-xl font-bold text-zinc-900 mt-1">{subscriptions.length}</p>
        </div>
        <div className={card}>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Активные абонементы</p>
          <p className="text-xl font-bold text-teal-700 mt-1">{activeSubscriptions.length}</p>
        </div>
      </div>

      {activeSubscriptions.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-800">Активные абонементы</h2>
            <Link href="/subscriptions" className="text-sm text-teal-700 hover:text-teal-900 font-medium hover:underline">
              Все абонементы
            </Link>
          </div>
          <div className="space-y-3">
            {activeSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-xl shadow-card p-4 border border-zinc-200/80 flex items-center justify-between"
              >
                <div>
                  <span className="inline-block bg-teal-50 text-teal-800 text-xs font-semibold px-3 py-1 rounded-md border border-teal-100">
                    {subscriptionLabelRu(sub.type)}
                  </span>
                  <p className="text-sm text-zinc-500 mt-1.5">
                    {new Date(sub.startDate).toLocaleDateString()} — {new Date(sub.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-500/30" title="Активен" />
              </div>
            ))}
          </div>
        </div>
      )}

      {profile && (
        <div className={`mt-8 ${card}`}>
          <h2 className="text-lg font-semibold text-zinc-800 mb-4">Мой профиль</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Имя</p>
              <p className="font-medium text-zinc-900 mt-0.5">{profile.name}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Почта</p>
              <p className="font-medium text-zinc-900 mt-0.5">{profile.email}</p>
            </div>
            {profile.phone && (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Телефон</p>
                <p className="font-medium text-zinc-900 mt-0.5">{profile.phone}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Клиент с</p>
              <p className="font-medium text-zinc-900 mt-0.5">{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
