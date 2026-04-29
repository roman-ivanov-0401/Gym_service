import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { RemoteSessionProps } from '@gym/shared/remoteSession';
import { useStore } from 'host/stores';
import { ClientWithSubscriptions, SubscriptionType } from 'host/api/gym';

// ---- Stat Card ----
interface StatCardProps { label: string; value: number | string; color?: string; }
const StatCard = ({ label, value, color = 'text-zinc-900' }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-card p-6 border border-zinc-200/80">
    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

// ---- Create User Modal ----
interface CreateUserModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; password: string; role: 'client' | 'admin' }) => Promise<void>;
}
const CreateUserModal = ({ onClose, onSubmit }: CreateUserModalProps) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' as 'client' | 'admin' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (e: any) {
      const d = e.response?.data;
      setError(d?.error?.message ?? d?.message ?? 'Не удалось создать пользователя');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-card-lg ring-1 ring-zinc-200 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-900">Новый пользователь</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-600 mb-1 font-medium">ФИО</label>
            <input
              type="text" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
              placeholder="Иван Иванов"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 mb-1 font-medium">Электронная почта</label>
            <input
              type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 mb-1 font-medium">Пароль</label>
            <input
              type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
              placeholder="от 8 символов, заглавная и цифра"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-600 mb-1 font-medium">Роль</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value as 'client' | 'admin' })}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
            >
              <option value="client">Клиент</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? 'Создание…' : 'Создать'}
            </button>
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-zinc-300 text-zinc-700 rounded-lg text-sm hover:bg-zinc-50 transition font-medium"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---- Client Detail Panel ----
interface ClientDetailPanelProps {
  client: ClientWithSubscriptions;
  onClose: () => void;
  onAddSubscription: (clientId: string, data: { type: SubscriptionType; startDate: string }) => Promise<void>;
}
const ClientDetailPanel = ({ client, onClose, onAddSubscription }: ClientDetailPanelProps) => {
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState({ type: 'monthly' as SubscriptionType, startDate: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await onAddSubscription(client.id, {
        type: subForm.type,
        startDate: new Date(subForm.startDate).toISOString(),
      });
      setSubForm({ type: 'monthly', startDate: '' });
      setShowSubForm(false);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Не удалось создать абонемент');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-card-lg ring-1 ring-zinc-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{client.name}</h2>
            <p className="text-sm text-zinc-500">{client.email}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">&times;</button>
        </div>

        {/* Client info */}
        <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-4 mb-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-zinc-500 uppercase font-medium">Телефон</p>
              <p className="text-zinc-800 font-medium mt-0.5">{client.phone ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-medium">Клиент с</p>
              <p className="text-zinc-800 font-medium mt-0.5">{new Date(client.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Subscriptions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-zinc-800">Абонементы ({client.subscriptions.length})</h3>
            {!showSubForm && (
              <button
                onClick={() => setShowSubForm(true)}
                className="text-xs bg-teal-50 text-teal-800 border border-teal-100 px-3 py-1.5 rounded-lg font-semibold hover:bg-teal-100 transition"
              >
                + Добавить
              </button>
            )}
          </div>

          {showSubForm && (
            <form onSubmit={handleAddSub} className="bg-zinc-50 rounded-lg p-4 mb-4 space-y-3 border border-zinc-200">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Тип</label>
                <select
                  value={subForm.type}
                  onChange={e => setSubForm({ ...subForm, type: e.target.value as SubscriptionType })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
                >
                  <option value="monthly">Ежемесячный (1 месяц)</option>
                  <option value="yearly">Годовой (1 год)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Дата начала</label>
                <input
                  type="date" required value={subForm.startDate}
                  onChange={e => setSubForm({ ...subForm, startDate: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
                />
              </div>
              {error && <p className="text-red-600 text-xs">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-60"
                >
                  {saving ? 'Создание…' : 'Создать абонемент'}
                </button>
                <button
                  type="button" onClick={() => { setShowSubForm(false); setError(''); }}
                  className="px-4 py-2 rounded-lg border border-zinc-300 text-xs text-zinc-600 hover:bg-zinc-50 transition"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}

          {client.subscriptions.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 text-sm">Нет абонементов</div>
          ) : (
            <div className="space-y-2">
              {client.subscriptions.map(s => {
                const active = new Date() <= new Date(s.endDate);
                return (
                  <div key={s.id} className="flex items-center justify-between bg-zinc-50 rounded-lg px-4 py-3 border border-zinc-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                          s.type === 'monthly' ? 'bg-teal-50 text-teal-900 border border-teal-100' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                        }`}>{s.type === 'monthly' ? 'Ежемесячная' : 'Годовая'}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          active ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                        }`}>{active ? 'Активен' : 'Истёк'}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${active ? 'bg-teal-500' : 'bg-zinc-300'}`}></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg border border-zinc-300 text-sm text-zinc-600 hover:bg-zinc-50 transition"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

// ---- Main Admin App ----
const AdminApp = observer((_props: RemoteSessionProps) => {
  const { admin } = useStore();

  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithSubscriptions | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    admin.loadClients();
  }, []);

  const filteredClients = admin.clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await admin.deleteClient(id);
      setDeleteConfirm(null);
      if (selectedClient?.id === id) setSelectedClient(null);
    } catch {}
    finally { setDeleteLoading(false); }
  };

  const handleCreateUser = async (data: { name: string; email: string; password: string; role: 'client' | 'admin' }) => {
    await admin.createUser(data);
  };

  const handleAddSubscription = async (clientId: string, data: { type: SubscriptionType; startDate: string }) => {
    await admin.createSubscriptionForClient(clientId, data);
    // refresh selected client from updated store
    const updated = admin.getClientById(clientId);
    if (updated) setSelectedClient(updated);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Панель администратора</h1>
          <p className="text-zinc-500 text-sm mt-1">Управление клиентами и абонементами</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition shadow-card"
        >
          + Новый пользователь
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Всего клиентов" value={admin.totalClients} />
        <StatCard label="Активных абонементов" value={admin.totalActiveSubscriptions} color="text-teal-700" />
        <StatCard label="Без абонемента" value={admin.clientsWithoutSubscriptions} color="text-amber-700" />
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск по имени или почте…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-sm bg-zinc-50/50"
        />
      </div>

      {/* Error */}
      {admin.error && (
        <div className="bg-red-50 border border-red-200 text-red-500 rounded-xl px-4 py-3 mb-4 text-sm">
          {admin.error}
          <button onClick={() => admin.loadClients(true)} className="ml-3 underline">Повторить</button>
        </div>
      )}

      {/* Client Table */}
      {admin.loading ? (
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-card p-12 text-center">
          <p className="text-teal-700 animate-pulse text-lg font-medium">Загрузка…</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-card p-12 text-center">
          <p className="text-zinc-500">
            {search ? 'Ничего не найдено' : 'Нет зарегистрированных клиентов'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase px-6 py-3">Клиент</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase px-6 py-3 hidden md:table-cell">Телефон</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase px-6 py-3">Абонементы</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase px-6 py-3 hidden sm:table-cell">Клиент с</th>
                <th className="text-right text-xs font-semibold text-zinc-500 uppercase px-6 py-3">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredClients.map(client => {
                const activeCount = client.subscriptions.filter(s => new Date() <= new Date(s.endDate)).length;
                return (
                  <tr key={client.id} className="hover:bg-zinc-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{client.name}</p>
                        <p className="text-xs text-zinc-500">{client.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-zinc-600">{client.phone ?? '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-700">{client.subscriptions.length}</span>
                        {activeCount > 0 && (
                          <span className="text-xs bg-teal-50 text-teal-800 border border-teal-100 font-semibold px-2 py-0.5 rounded-md">
                            {activeCount} активных
                          </span>
                        )}
                        {client.subscriptions.length === 0 && (
                          <span className="text-xs bg-zinc-100 text-zinc-500 border border-zinc-200 font-semibold px-2 py-0.5 rounded-md">нет</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <p className="text-sm text-zinc-500">{new Date(client.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="text-xs text-teal-800 border border-teal-200 bg-teal-50/80 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition font-medium"
                        >
                          Управление
                        </button>
                        {deleteConfirm === client.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(client.id)}
                              disabled={deleteLoading}
                              className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition disabled:opacity-60"
                            >
                              {deleteLoading ? '...' : 'Подтвердить'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs border border-zinc-300 text-zinc-600 px-2 py-1.5 rounded-lg hover:bg-zinc-50 transition"
                            >
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(client.id)}
                            className="text-xs text-red-700 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {selectedClient && (
        <ClientDetailPanel
          client={admin.getClientById(selectedClient.id) ?? selectedClient}
          onClose={() => setSelectedClient(null)}
          onAddSubscription={handleAddSubscription}
        />
      )}
    </div>
  );
});

export default AdminApp;
