import Link from 'next/link';
import {
  createSubscriptionFormAction,
  deleteSubscriptionFormAction,
  updateSubscriptionFormAction,
} from '@/actions/gym';
import type { Subscription, SubscriptionType } from '@/lib/types';
import { subscriptionLabelRu } from '@/lib/types';

const BADGE: Record<SubscriptionType, string> = {
  monthly: 'bg-teal-50 text-teal-900 border border-teal-100',
  yearly: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
};

const field =
  'w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-sm bg-zinc-50/50';

export type SubscriptionsSearch = {
  new?: string;
  edit?: string;
  error?: string;
  created?: string;
  updated?: string;
  deleted?: string;
};

export default function SubscriptionsBody({
  subscriptions,
  isAdmin,
  sp,
}: {
  subscriptions: Subscription[];
  isAdmin: boolean;
  sp: SubscriptionsSearch;
}) {
  const showNew = sp.new === '1' && !isAdmin;
  const editId = sp.edit;
  const editSub = editId ? subscriptions.find((s) => s.id === editId) : undefined;
  const showEdit = Boolean(editSub) && !isAdmin;
  const editNotFound = Boolean(editId) && !editSub && !isAdmin;

  const baseList = '/subscriptions';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Абонементы</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isAdmin ? 'Просмотр как администратор' : 'Управление вашими абонементами'}
          </p>
        </div>
        {!isAdmin && !showNew && !showEdit && (
          <Link
            href={`${baseList}?new=1`}
            className="shrink-0 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-5 py-2 rounded-lg transition shadow-card"
          >
            + Новый
          </Link>
        )}
      </div>

      {sp.created === '1' && (
        <p className="mb-4 text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">Абонемент создан.</p>
      )}
      {sp.updated === '1' && (
        <p className="mb-4 text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">Абонемент обновлён.</p>
      )}
      {sp.deleted === '1' && (
        <p className="mb-4 text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">Абонемент удалён.</p>
      )}
      {sp.error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {decodeURIComponent(sp.error)}
        </p>
      )}
      {editNotFound && (
        <p className="mb-4 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Абонемент не найден.{' '}
          <Link href={baseList} className="underline font-medium">
            К списку
          </Link>
        </p>
      )}

      {isAdmin && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-950">
          Вы вошли как администратор. Оформить абонемент могут только клиенты.
        </div>
      )}

      {showNew && (
        <div className="bg-white rounded-xl shadow-card-lg p-6 border border-zinc-200/80 ring-1 ring-zinc-100 mb-6">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4">Новый абонемент</h2>
          <form action={createSubscriptionFormAction} className="space-y-4">
            <div>
              <label htmlFor="type-new" className="block text-sm font-medium text-zinc-600 mb-1">
                Тип
              </label>
              <select id="type-new" name="type" defaultValue="monthly" className={field}>
                <option value="monthly">Ежемесячный (1 месяц)</option>
                <option value="yearly">Годовой (1 год)</option>
              </select>
            </div>
            <div>
              <label htmlFor="start-new" className="block text-sm font-medium text-zinc-600 mb-1">
                Дата начала
              </label>
              <input id="start-new" name="startDate" type="date" required className={field} />
              <p className="text-xs text-zinc-500 mt-1">Дата окончания рассчитывается автоматически</p>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg transition">
                Создать
              </button>
              <Link
                href={baseList}
                className="px-5 py-2.5 rounded-lg border border-zinc-300 text-sm text-zinc-600 hover:bg-zinc-50 transition font-medium inline-flex items-center justify-center"
              >
                Отмена
              </Link>
            </div>
          </form>
        </div>
      )}

      {showEdit && editSub && (
        <div className="bg-white rounded-xl shadow-card-lg p-6 border border-zinc-200/80 ring-1 ring-zinc-100 mb-6">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4">Редактировать абонемент</h2>
          <form action={updateSubscriptionFormAction} className="space-y-4">
            <input type="hidden" name="id" value={editSub.id} />
            <div>
              <label htmlFor="type-edit" className="block text-sm font-medium text-zinc-600 mb-1">
                Тип
              </label>
              <select id="type-edit" name="type" defaultValue={editSub.type} className={field}>
                <option value="monthly">Ежемесячный (1 месяц)</option>
                <option value="yearly">Годовой (1 год)</option>
              </select>
            </div>
            <div>
              <label htmlFor="start-edit" className="block text-sm font-medium text-zinc-600 mb-1">
                Дата начала
              </label>
              <input
                id="start-edit"
                name="startDate"
                type="date"
                required
                defaultValue={editSub.startDate.slice(0, 10)}
                className={field}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg transition">
                Обновить
              </button>
              <Link
                href={baseList}
                className="px-5 py-2.5 rounded-lg border border-zinc-300 text-sm text-zinc-600 hover:bg-zinc-50 transition font-medium inline-flex items-center justify-center"
              >
                Отмена
              </Link>
            </div>
          </form>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-10 text-center border border-zinc-200/80">
          <p className="text-zinc-500">
            Абонементов пока нет.
            {!isAdmin && ' Оформите первый!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((s) => {
            const active = new Date() <= new Date(s.endDate);
            return (
              <div key={s.id} className="bg-white rounded-xl shadow-card p-4 border border-zinc-200/80">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-md ${BADGE[s.type]}`}>
                        {subscriptionLabelRu(s.type)}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                          active
                            ? 'bg-teal-50 text-teal-800 border border-teal-100'
                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                        }`}
                      >
                        {active ? 'Активен' : 'Истёк'}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">
                      {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {!isAdmin && (
                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={`${baseList}?edit=${encodeURIComponent(s.id)}`}
                        className="text-xs text-teal-800 border border-teal-200 bg-teal-50/80 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition font-medium inline-flex items-center"
                      >
                        Изменить
                      </Link>
                      <form action={deleteSubscriptionFormAction} className="inline">
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-700 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium"
                        >
                          Удалить
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
