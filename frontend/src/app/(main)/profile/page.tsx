import Link from 'next/link';
import { redirect } from 'next/navigation';
import { saveProfileFormAction } from '@/actions/gym';
import { getMyProfile } from '@/lib/server/gym-fetch';
import { getSession } from '@/lib/server/session';
import type { Client } from '@/lib/types';

const inputClass =
  'w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-sm bg-zinc-50/50';

type Search = { saved?: string; error?: string };

function ProfileFormShell({ initial, formKey }: { initial: Client | null; formKey: string }) {
  const hasProfile = initial !== null;
  return (
    <form key={formKey} action={saveProfileFormAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-600 mb-1">
          Имя
        </label>
        <input id="name" name="name" type="text" required defaultValue={initial?.name ?? ''} className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-600 mb-1">
          Электронная почта
        </label>
        <input id="email" name="email" type="email" required defaultValue={initial?.email ?? ''} className={inputClass} />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-zinc-600 mb-1">
          Телефон
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initial?.phone ?? ''}
          className={inputClass}
          placeholder="+7 (999) 000-00-00"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg transition"
      >
        {hasProfile ? 'Сохранить изменения' : 'Создать профиль'}
      </button>
    </form>
  );
}

export default async function ProfilePage({ searchParams }: { searchParams: Promise<Search> }) {
  const s = await getSession();
  if (!s) redirect('/login');

  const sp = await searchParams;
  const res = await getMyProfile(s.accessToken);
  const initial = res.ok ? res.data : res.status === 404 ? null : null;

  if (!res.ok && res.status !== 404) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-red-600">Не удалось загрузить профиль</p>
      </div>
    );
  }

  const formKey = initial ? `${initial.id}-${initial.email}` : 'new';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Мой профиль</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {initial ? 'Обновите свои данные' : 'Создайте профиль спортзала'}
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-teal-700 hover:underline font-medium">
          ← На главную
        </Link>
      </div>

      {sp.saved === '1' && (
        <p className="mb-4 text-sm text-center text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
          Профиль успешно сохранён
        </p>
      )}
      {sp.error && (
        <p className="mb-4 text-sm text-center text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {decodeURIComponent(sp.error)}
        </p>
      )}

      <div className="bg-white rounded-xl shadow-card-lg p-6 border border-zinc-200/80 ring-1 ring-zinc-100">
        {initial && (
          <div className="mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Клиент с</p>
            <p className="text-sm font-semibold text-zinc-900 mt-0.5">
              {new Date(initial.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
        <ProfileFormShell initial={initial} formKey={formKey} />
      </div>
    </div>
  );
}
