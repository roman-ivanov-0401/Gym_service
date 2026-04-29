import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { useRegisterMutation } from '../store/authApi';
import {
  useAdminCreateClientMutation,
  useAdminCreateSubscriptionMutation,
  useAdminDeleteClientMutation,
  useGetAdminClientsQuery,
  type ClientWithSubscriptions,
  type SubscriptionType,
} from '../store/gymApi';
import { subscriptionLabelRu } from '../api/gym';

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'admin';
}

function extractRegisteredUserId(body: unknown): string | undefined {
  const r = body as { data?: { user?: { id: string } } };
  return r.data?.user?.id;
}

export default function AdminPage() {
  const { data: clients = [], isLoading, error, refetch } = useGetAdminClientsQuery();
  const [deleteClient] = useAdminDeleteClientMutation();
  const [registerMut] = useRegisterMutation();
  const [adminCreateClient] = useAdminCreateClientMutation();
  const [adminCreateSub] = useAdminCreateSubscriptionMutation();

  const [selectedClient, setSelectedClient] = useState<ClientWithSubscriptions | null>(null);
  const [search, setSearch] = useState('');

  const [subForm, setSubForm] = useState({ type: 'monthly' as SubscriptionType, startDate: '' });
  const [subSaving, setSubSaving] = useState(false);
  const [subError, setSubError] = useState('');
  const [subSuccess, setSubSuccess] = useState('');

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userForm, setUserForm] = useState<CreateUserForm>({ name: '', email: '', password: '', role: 'client' });
  const [userSaving, setUserSaving] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  const loadError = error ? 'Не удалось загрузить список клиентов' : '';

  useEffect(() => {
    setSelectedClient((prev) => {
      if (!prev) return null;
      return clients.find((c) => c.id === prev.id) ?? null;
    });
  }, [clients]);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalClients = clients.length;
  const totalActiveSubscriptions = useMemo(
    () =>
      clients.reduce(
        (acc, c) => acc + c.subscriptions.filter((s) => new Date() <= new Date(s.endDate)).length,
        0,
      ),
    [clients],
  );
  const clientsWithoutSubscriptions = useMemo(
    () => clients.filter((c) => c.subscriptions.length === 0).length,
    [clients],
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить клиента «${name}» и все его абонементы?`)) return;
    try {
      await deleteClient(id).unwrap();
      if (selectedClient?.id === id) setSelectedClient(null);
    } catch {
      alert('Не удалось удалить клиента');
    }
  };

  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setSubSaving(true);
    setSubError('');
    setSubSuccess('');
    try {
      await adminCreateSub({
        clientId: selectedClient.id,
        body: {
          type: subForm.type,
          startDate: new Date(subForm.startDate).toISOString(),
        },
      }).unwrap();
      setSubSuccess('Абонемент успешно создан');
      setSubForm({ type: 'monthly', startDate: '' });
    } catch (e: unknown) {
      const err = e as { data?: { error?: { message?: string }; message?: string } };
      const d = err?.data;
      setSubError(d?.error?.message ?? d?.message ?? 'Не удалось создать абонемент');
    } finally {
      setSubSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSaving(true);
    setUserError('');
    setUserSuccess('');
    try {
      const regBody = await registerMut(userForm).unwrap();
      const userId = extractRegisteredUserId(regBody);
      if (userId && userForm.role === 'client') {
        try {
          await adminCreateClient({ userId, name: userForm.name, email: userForm.email }).unwrap();
        } catch {
          /* профиль в зале не создался — пользователь уже зарегистрирован */
        }
      }
      void refetch();
      setUserSuccess(`Пользователь ${userForm.email} успешно зарегистрирован`);
      setUserForm({ name: '', email: '', password: '', role: 'client' });
      setTimeout(() => {
        setShowCreateUser(false);
        setUserSuccess('');
      }, 1500);
    } catch (e: unknown) {
      const err = e as { data?: { error?: { message?: string }; message?: string } };
      const d = err?.data;
      setUserError(d?.error?.message ?? d?.message ?? 'Не удалось создать пользователя');
    } finally {
      setUserSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Панель администратора</h1>
            <p className="text-zinc-500 text-sm mt-1">Управление клиентами и абонементами</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowCreateUser(true); setUserError(''); setUserSuccess(''); }}
              className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800 transition shadow-card"
            >
              + Новый пользователь
            </button>
            <button
              onClick={() => void refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 transition shadow-card"
            >
              Обновить
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-card border border-zinc-200/80">
            <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Всего клиентов</p>
            <p className="text-3xl font-bold text-zinc-900">{totalClients}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-card border border-zinc-200/80">
            <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Активных абонементов</p>
            <p className="text-3xl font-bold text-teal-700">{totalActiveSubscriptions}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-card border border-zinc-200/80">
            <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Без абонемента</p>
            <p className="text-3xl font-bold text-amber-700">{clientsWithoutSubscriptions}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-zinc-200/80 p-4">
          <input
            type="text"
            placeholder="Поиск по имени или почте…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
          />
        </div>

        {isLoading && <div className="text-center py-16 text-teal-700 animate-pulse text-lg font-medium">Загрузка…</div>}
        {loadError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm">{loadError}</div>}

        {!isLoading && !loadError && (
          <div className="flex gap-6">
            <div className="flex-1 bg-white rounded-xl shadow-card border border-zinc-200/80 overflow-hidden">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  {search ? 'Ничего не найдено' : 'Нет зарегистрированных клиентов'}
                </div>
              ) : (
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
                    {filtered.map((client) => {
                      const activeSubs = client.subscriptions.filter((s) => new Date() <= new Date(s.endDate)).length;
                      const isSelected = selectedClient?.id === client.id;
                      return (
                        <tr
                          key={client.id}
                          onClick={() => { setSelectedClient(isSelected ? null : client); setSubError(''); setSubSuccess(''); setSubForm({ type: 'monthly', startDate: '' }); }}
                          className={`cursor-pointer transition ${isSelected ? 'bg-teal-50/70' : 'hover:bg-zinc-50'}`}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-zinc-900">{client.name}</div>
                            <div className="text-xs text-zinc-500">{client.email}</div>
                          </td>
                          <td className="px-4 py-3 text-zinc-600">{client.phone ?? '—'}</td>
                          <td className="px-4 py-3 text-center">
                            {activeSubs > 0 ? (
                              <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-100 rounded-md text-xs font-medium">{activeSubs} активных</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-md text-xs border border-zinc-200">нет</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(client.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedClient(isSelected ? null : client); setSubError(''); setSubSuccess(''); setSubForm({ type: 'monthly', startDate: '' }); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${isSelected ? 'bg-teal-200 text-teal-900' : 'bg-teal-50 text-teal-800 border border-teal-100 hover:bg-teal-100'}`}
                              >
                                {isSelected ? 'Закрыть' : 'Управление'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(client.id, client.name); }}
                                className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                              >
                                Удалить
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {selectedClient && (
              <div className="w-80 bg-white rounded-xl shadow-card-lg border border-zinc-200/80 ring-1 ring-zinc-100 p-5 space-y-5 self-start">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-900">{selectedClient.name}</h3>
                  <button type="button" onClick={() => setSelectedClient(null)} className="text-zinc-400 hover:text-zinc-700 text-lg leading-none">×</button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200"><p className="text-xs text-zinc-500">Почта</p><p className="text-zinc-800 break-all">{selectedClient.email}</p></div>
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200"><p className="text-xs text-zinc-500">Телефон</p><p className="text-zinc-800">{selectedClient.phone ?? '—'}</p></div>
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200"><p className="text-xs text-zinc-500">Клиент с</p><p className="text-zinc-800">{new Date(selectedClient.createdAt).toLocaleDateString()}</p></div>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 uppercase font-medium mb-2">Абонементы ({selectedClient.subscriptions.length})</p>
                  {selectedClient.subscriptions.length === 0 ? (
                    <p className="text-sm text-zinc-500">Нет абонементов</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.subscriptions.map((sub) => {
                        const active = new Date() <= new Date(sub.endDate);
                        return (
                          <div key={sub.id} className="p-3 border border-zinc-200 rounded-lg text-xs space-y-1 bg-zinc-50/50">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-md font-medium border ${sub.type === 'monthly' ? 'bg-teal-50 text-teal-900 border-teal-100' : 'bg-zinc-100 text-zinc-800 border-zinc-200'}`}>
                                {subscriptionLabelRu(sub.type)}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md ${active ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>
                                {active ? 'Активен' : 'Истёк'}
                              </span>
                            </div>
                            <p className="text-zinc-600">{new Date(sub.startDate).toLocaleDateString()} — {new Date(sub.endDate).toLocaleDateString()}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-200 pt-4">
                  <p className="text-xs text-zinc-500 uppercase font-medium mb-3">Добавить абонемент</p>
                  <form onSubmit={handleCreateSub} className="space-y-3">
                    <select
                      value={subForm.type}
                      onChange={(e) => setSubForm({ ...subForm, type: e.target.value as SubscriptionType })}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
                    >
                      <option value="monthly">Ежемесячный (1 месяц)</option>
                      <option value="yearly">Годовой (1 год)</option>
                    </select>
                    <input
                      type="date" required
                      value={subForm.startDate}
                      onChange={(e) => setSubForm({ ...subForm, startDate: e.target.value })}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50"
                    />
                    {subError && <p className="text-red-600 text-xs">{subError}</p>}
                    {subSuccess && <p className="text-teal-800 text-xs font-medium">{subSuccess}</p>}
                    <button type="submit" disabled={subSaving} className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                      {subSaving ? 'Создание…' : 'Создать абонемент'}
                    </button>
                  </form>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(selectedClient.id, selectedClient.name)}
                  className="w-full py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  Удалить клиента
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateUser && (
        <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-card-lg ring-1 ring-zinc-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">Новый пользователь</h2>
              <button type="button" onClick={() => setShowCreateUser(false)} className="text-zinc-400 hover:text-zinc-700 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-600 mb-1 font-medium">ФИО</label>
                <input type="text" required placeholder="Иван Иванов" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50" />
              </div>
              <div>
                <label className="block text-xs text-zinc-600 mb-1 font-medium">Электронная почта</label>
                <input type="email" required placeholder="user@example.com" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50" />
              </div>
              <div>
                <label className="block text-xs text-zinc-600 mb-1 font-medium">Пароль</label>
                <input type="password" required minLength={8} placeholder="от 8 символов, заглавная и цифра" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50" />
              </div>
              <div>
                <label className="block text-xs text-zinc-600 mb-1 font-medium">Роль</label>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'client' | 'admin' })} className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-zinc-50/50">
                  <option value="client">Клиент</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              {userError && <p className="text-red-600 text-sm">{userError}</p>}
              {userSuccess && <p className="text-teal-800 text-sm font-medium">{userSuccess}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreateUser(false)} className="flex-1 py-2.5 border border-zinc-300 text-zinc-700 rounded-lg text-sm hover:bg-zinc-50 transition font-medium">Отмена</button>
                <button type="submit" disabled={userSaving} className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                  {userSaving ? 'Создание…' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
