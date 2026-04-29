import { redirect } from 'next/navigation';
import { getSession } from '@/lib/server/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect('/login');
  if (s.user.role !== 'admin') redirect('/dashboard');
  return children;
}
