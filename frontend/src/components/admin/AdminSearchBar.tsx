import Link from 'next/link';

/** Поиск через GET — полностью серверный сценарий, без JS. */
export default function AdminSearchBar({ q, clientId }: { q: string; clientId?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-zinc-200/80 p-4 flex flex-wrap gap-3 items-end">
      <form method="GET" className="flex flex-1 flex-wrap gap-2 items-center min-w-[200px]">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Поиск по имени или почте…"
          className="flex-1 min-w-[180px] border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
        />
        {clientId ? <input type="hidden" name="client" value={clientId} /> : null}
        <button type="submit" className="px-4 py-2.5 bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-zinc-900 transition">
          Найти
        </button>
      </form>
      {(q || clientId) && (
        <Link href="/admin" className="text-sm text-teal-700 hover:underline font-medium py-2">
          Сбросить фильтр
        </Link>
      )}
    </div>
  );
}
