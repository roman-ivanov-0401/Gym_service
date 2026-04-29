import Link from 'next/link';
import type { ClientWithSubscriptions } from '@/lib/types';

export default function AdminClientsTable({
  clients,
  selectedId,
  emptyMessage,
}: {
  clients: ClientWithSubscriptions[];
  selectedId?: string;
  emptyMessage?: string;
}) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500 flex-1 bg-white rounded-xl shadow-card border border-zinc-200/80">
        {emptyMessage ?? 'Нет зарегистрированных клиентов'}
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-xl shadow-card border border-zinc-200/80 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-zinc-600 uppercase text-xs border-b border-zinc-200">
          <tr>
            <th className="px-4 py-3 text-left">Клиент</th>
            <th className="px-4 py-3 text-left">Телефон</th>
            <th className="px-4 py-3 text-center">Абонементы</th>
            <th className="px-4 py-3 text-left">Клиент с</th>
            <th className="px-4 py-3 text-center">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {clients.map((client) => {
            const activeSubs = client.subscriptions.filter((s) => new Date() <= new Date(s.endDate)).length;
            const isSelected = selectedId === client.id;
            return (
              <tr key={client.id} className={`transition ${isSelected ? 'bg-teal-50/70' : 'hover:bg-zinc-50'}`}>
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900">{client.name}</div>
                  <div className="text-xs text-zinc-500">{client.email}</div>
                </td>
                <td className="px-4 py-3 text-zinc-600">{client.phone ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  {activeSubs > 0 ? (
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-100 rounded-md text-xs font-medium">
                      {activeSubs} активных
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-md text-xs border border-zinc-200">нет</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(client.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Link
                      href={`/admin?client=${encodeURIComponent(client.id)}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isSelected ? 'bg-teal-200 text-teal-900' : 'bg-teal-50 text-teal-800 border border-teal-100 hover:bg-teal-100'
                      }`}
                    >
                      {isSelected ? 'Открыто' : 'Управление'}
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
