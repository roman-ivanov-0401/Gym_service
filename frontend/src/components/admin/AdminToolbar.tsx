import Link from 'next/link';
import { adminRefreshAction } from '@/actions/admin';

export default function AdminToolbar() {
  return (
    <div className="flex gap-3">
      <Link
        href="/admin/users/new"
        className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800 transition shadow-card"
      >
        + Новый пользователь
      </Link>
      <form action={adminRefreshAction}>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 transition shadow-card h-full"
        >
          Обновить
        </button>
      </form>
    </div>
  );
}
