import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminCreateUserFormAction } from '@/actions/admin';
import { getSession } from '@/lib/server/session';

export default async function AdminNewUserPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const s = await getSession();
  if (!s) redirect('/login');
  if (s.user.role !== 'admin') redirect('/dashboard');

  const sp = await searchParams;
  const err = sp.error ? decodeURIComponent(sp.error) : null;

  const field =
    'w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50';

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Новый пользователь</h1>
        <Link href="/admin" className="text-sm text-teal-700 hover:underline font-medium">
          ← Назад
        </Link>
      </div>

      {err && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</p>}

      <div className="bg-white rounded-xl shadow-card-lg border border-zinc-200/80 p-6 ring-1 ring-zinc-100">
        <form action={adminCreateUserFormAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs text-zinc-600 mb-1 font-medium">
              ФИО
            </label>
            <input id="name" name="name" type="text" required placeholder="Иван Иванов" className={field} />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs text-zinc-600 mb-1 font-medium">
              Электронная почта
            </label>
            <input id="email" name="email" type="email" required placeholder="user@example.com" className={field} />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs text-zinc-600 mb-1 font-medium">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="от 8 символов, заглавная и цифра"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-xs text-zinc-600 mb-1 font-medium">
              Роль
            </label>
            <select id="role" name="role" defaultValue="client" className={field}>
              <option value="client">Клиент</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Link
              href="/admin"
              className="flex-1 py-2.5 border border-zinc-300 text-zinc-700 rounded-lg text-sm hover:bg-zinc-50 transition font-medium text-center"
            >
              Отмена
            </Link>
            <button type="submit" className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition">
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
