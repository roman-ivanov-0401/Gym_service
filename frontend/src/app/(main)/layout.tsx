import { redirect } from 'next/navigation';
import { ClientLayoutStripe } from '@/components/ClientLayoutStripe';
import Navbar from '@/components/Navbar';
import { getSession } from '@/lib/server/session';

/** Layout с навигацией: серверная проверка сессии + Navbar (ссылки) + небольшой client-индикатор. */
export default async function MainGroupLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect('/login');

  return (
    <div className="min-h-screen bg-zinc-100">
      <Navbar user={s.user} />
      <ClientLayoutStripe />
      {children}
    </div>
  );
}
