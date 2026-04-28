import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../stores/RootStore';
import { SubscriptionType, Subscription, subscriptionLabelRu } from '../api/gym';
import { getApiErrorMessage } from '../utils/apiError';

const BADGE: Record<SubscriptionType, string> = {
  monthly: 'bg-teal-50 text-teal-900 border border-teal-100',
  yearly: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
};

const field =
  'w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-sm bg-zinc-50/50';

const SubscriptionsPage = observer(() => {
  const { user } = useAuth();
  const { client } = useStore();
  const isAdmin = user?.role === 'admin';

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'monthly' as SubscriptionType, startDate: '' });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client.loadSubscriptions();
  }, []);

  const resetForm = () => {
    setForm({ type: 'monthly', startDate: '' });
    setEditId(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (s: Subscription) => {
    setForm({ type: s.type, startDate: s.startDate.slice(0, 10) });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { type: form.type, startDate: new Date(form.startDate).toISOString() };
      if (editId) {
        await client.editSubscription(editId, payload);
      } else {
        await client.addSubscription(payload);
      }
      resetForm();
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Ошибка'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот абонемент?')) return;
    await client.removeSubscription(id);
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Абонементы</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {isAdmin ? 'Просмотр как администратор' : 'Управление вашими абонементами'}
            </p>
          </div>
          {!showForm && !isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="shrink-0 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-5 py-2 rounded-lg transition shadow-card"
            >
              + Новый
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-950">
            Вы вошли как администратор. Оформить абонемент могут только клиенты.
          </div>
        )}

        {showForm && !isAdmin && (
          <div className="bg-white rounded-xl shadow-card-lg p-6 border border-zinc-200/80 ring-1 ring-zinc-100 mb-6">
            <h2 className="text-lg font-semibold text-zinc-800 mb-4">
              {editId ? 'Редактировать абонемент' : 'Новый абонемент'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Тип</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SubscriptionType })} className={field}>
                  <option value="monthly">Ежемесячный (1 месяц)</option>
                  <option value="yearly">Годовой (1 год)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Дата начала</label>
                <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={field} />
                <p className="text-xs text-zinc-500 mt-1">Дата окончания рассчитывается автоматически</p>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Сохранение…' : editId ? 'Обновить' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-lg border border-zinc-300 text-sm text-zinc-600 hover:bg-zinc-50 transition font-medium"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {client.subscriptionsLoading ? (
          <p className="text-teal-700 animate-pulse font-medium">Загрузка…</p>
        ) : client.subscriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card p-10 text-center border border-zinc-200/80">
            <p className="text-zinc-500">
              Абонементов пока нет.
              {!isAdmin && ' Оформите первый!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {client.subscriptions.map((s) => {
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
                            active ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
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
                        <button
                          onClick={() => handleEdit(s)}
                          className="text-xs text-teal-800 border border-teal-200 bg-teal-50/80 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition font-medium"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-xs text-red-700 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium"
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

export default SubscriptionsPage;
