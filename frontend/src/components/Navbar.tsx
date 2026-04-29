import Link from 'next/link';
import { logoutAction } from '@/actions/auth';
import type { User } from '@/lib/types';

export default function Navbar({ user }: { user: User }) {
  const linkClass = 'text-sm text-zinc-600 hover:text-teal-800 font-medium transition-colors';
  const linkAdmin = 'text-sm text-zinc-600 hover:text-slate-900 font-medium transition-colors';

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-zinc-200 px-6 py-3.5 flex items-center justify-between shadow-card">
      <Link
        href={user.role === 'admin' ? '/admin' : '/dashboard'}
        className="text-xl font-bold text-zinc-900 tracking-tight"
      >
        Gym<span className="text-teal-700">App</span>
      </Link>
      <div className="flex items-center gap-5">
        <Link href="/feedback" className={linkClass}>
          Обратная связь
        </Link>
        {user.role === 'admin' ? (
          <Link href="/admin" className={linkAdmin}>
            Панель администратора
          </Link>
        ) : (
          <>
            <Link href="/dashboard" className={linkClass}>
              Главная
            </Link>
            <Link href="/profile" className={linkClass}>
              Профиль
            </Link>
            <Link href="/subscriptions" className={linkClass}>
              Абонементы
            </Link>
          </>
        )}
        <span className="text-sm text-zinc-500 hidden sm:inline">Привет, {user.name}</span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm bg-zinc-800 hover:bg-zinc-900 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            Выйти
          </button>
        </form>
      </div>
    </nav>
  );
}
