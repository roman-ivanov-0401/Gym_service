import Link from 'next/link';
import { adminCreateSubscriptionFormAction, adminDeleteClientFormAction } from '@/actions/admin';
import type { ClientWithSubscriptions } from '@/lib/types';
import { subscriptionLabelRu } from '@/lib/types';

export default function AdminClientDetail({
  client,
  subErr,
  subOk,
  delErr,
}: {
  client: ClientWithSubscriptions;
  subErr?: string | null;
  subOk?: boolean;
  delErr?: string | null;
}) {
  return (
    <div className="w-80 bg-white rounded-xl shadow-card-lg border border-zinc-200/80 ring-1 ring-zinc-100 p-5 space-y-5 self-start">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-zinc-900">{client.name}</h3>
        <Link href="/admin" className="text-zinc-400 hover:text-zinc-700 text-lg leading-none shrink-0" title="Закрыть">
          ×
        </Link>
      </div>

      {subOk && <p className="text-xs text-teal-800 font-medium">Абонемент добавлен</p>}
      {subErr && <p className="text-xs text-red-600">{subErr}</p>}
      {delErr && <p className="text-xs text-red-600">{delErr}</p>}

      <div className="space-y-2 text-sm">
        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
          <p className="text-xs text-zinc-500">Почта</p>
          <p className="text-zinc-800 break-all">{client.email}</p>
        </div>
        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
          <p className="text-xs text-zinc-500">Телефон</p>
          <p className="text-zinc-800">{client.phone ?? '—'}</p>
        </div>
        <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
          <p className="text-xs text-zinc-500">Клиент с</p>
          <p className="text-zinc-800">{new Date(client.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-zinc-500 uppercase font-medium mb-2">Абонементы ({client.subscriptions.length})</p>
        {client.subscriptions.length === 0 ? (
          <p className="text-sm text-zinc-500">Нет абонементов</p>
        ) : (
          <div className="space-y-2">
            {client.subscriptions.map((sub) => {
              const active = new Date() <= new Date(sub.endDate);
              return (
                <div key={sub.id} className="p-3 border border-zinc-200 rounded-lg text-xs space-y-1 bg-zinc-50/50">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-md font-medium border ${
                        sub.type === 'monthly' ? 'bg-teal-50 text-teal-900 border-teal-100' : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                      }`}
                    >
                      {subscriptionLabelRu(sub.type)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md shrink-0 ${
                        active ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                      }`}
                    >
                      {active ? 'Активен' : 'Истёк'}
                    </span>
                  </div>
                  <p className="text-zinc-600">
                    {new Date(sub.startDate).toLocaleDateString()} — {new Date(sub.endDate).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 pt-4">
        <p className="text-xs text-zinc-500 uppercase font-medium mb-3">Добавить абонемент</p>
        <form action={adminCreateSubscriptionFormAction} className="space-y-3">
          <input type="hidden" name="clientId" value={client.id} />
          <select
            name="type"
            defaultValue="monthly"
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
          >
            <option value="monthly">Ежемесячный (1 месяц)</option>
            <option value="yearly">Годовой (1 год)</option>
          </select>
          <input
            name="startDate"
            type="date"
            required
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
          />
          <button type="submit" className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition">
            Создать абонемент
          </button>
        </form>
      </div>

      <form action={adminDeleteClientFormAction} className="space-y-3 border-t border-zinc-200 pt-4">
        <input type="hidden" name="clientId" value={client.id} />
        <label className="flex items-start gap-2 text-xs text-zinc-700 cursor-pointer">
          <input type="checkbox" name="confirm_delete" required className="mt-0.5 rounded border-zinc-300" />
          <span>Подтверждаю удаление клиента «{client.name}» и всех абонементов</span>
        </label>
        <button type="submit" className="w-full py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition">
          Удалить клиента
        </button>
      </form>
    </div>
  );
}
