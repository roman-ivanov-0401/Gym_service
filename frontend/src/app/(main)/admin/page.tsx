import Link from 'next/link';
import AdminClientDetail from '@/components/admin/AdminClientDetail';
import AdminClientsTable from '@/components/admin/AdminClientsTable';
import AdminSearchBar from '@/components/admin/AdminSearchBar';
import AdminStats from '@/components/admin/AdminStats';
import AdminToolbar from '@/components/admin/AdminToolbar';
import { adminGetAllClients } from '@/lib/server/gym-fetch';
import { getSession } from '@/lib/server/session';

type AdminSearch = {
  client?: string;
  q?: string;
  msg?: string;
  delErr?: string;
  subErr?: string;
  subOk?: string;
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<AdminSearch> }) {
  const s = await getSession();
  if (!s) return null;

  const sp = await searchParams;

  let clients: Awaited<ReturnType<typeof adminGetAllClients>> = [];
  let loadError = '';
  try {
    clients = await adminGetAllClients(s.accessToken);
  } catch {
    loadError = 'Не удалось загрузить список клиентов';
  }

  const q = (sp.q ?? '').toLowerCase().trim();
  const filtered =
    q === ''
      ? clients
      : clients.filter(
          (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
        );

  const selected = sp.client ? clients.find((c) => c.id === sp.client) : undefined;

  const totalActiveSubscriptions = clients.reduce(
    (acc, c) => acc + c.subscriptions.filter((sub) => new Date() <= new Date(sub.endDate)).length,
    0,
  );
  const clientsWithoutSubscriptions = clients.filter((c) => c.subscriptions.length === 0).length;

  const msg = sp.msg ? decodeURIComponent(sp.msg) : null;
  const delErr = sp.delErr ? decodeURIComponent(sp.delErr) : null;
  const subErr = sp.subErr ? decodeURIComponent(sp.subErr) : null;
  const subOk = sp.subOk === '1';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Панель администратора</h1>
          <p className="text-zinc-500 text-sm mt-1">Управление клиентами и абонементами (RSC + серверные формы)</p>
        </div>
        <AdminToolbar />
      </div>

      {msg && (
        <p className="text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">{msg}</p>
      )}

      <AdminStats
        totalClients={clients.length}
        totalActiveSubscriptions={totalActiveSubscriptions}
        clientsWithoutSubscriptions={clientsWithoutSubscriptions}
      />

      <AdminSearchBar q={sp.q ?? ''} clientId={sp.client} />

      {loadError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm">{loadError}</div>}

      {!loadError && (
        <div className="flex gap-6 flex-col lg:flex-row">
          <AdminClientsTable
            clients={filtered}
            selectedId={sp.client}
            emptyMessage={q ? 'Ничего не найдено' : undefined}
          />
          {selected && (
            <AdminClientDetail client={selected} subErr={subErr} subOk={subOk} delErr={delErr} />
          )}
          {sp.client && !selected && (
            <div className="w-80 self-start p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-950">
              Клиент не найден.{' '}
              <Link href="/admin" className="underline font-medium">
                Сбросить выбор
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
