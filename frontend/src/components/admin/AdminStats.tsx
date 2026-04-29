export default function AdminStats({
  totalClients,
  totalActiveSubscriptions,
  clientsWithoutSubscriptions,
}: {
  totalClients: number;
  totalActiveSubscriptions: number;
  clientsWithoutSubscriptions: number;
}) {
  return (
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
  );
}
