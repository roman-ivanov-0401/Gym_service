import { redirect } from 'next/navigation';
import { getSession } from '@/lib/server/session';

export default async function HomePage() {
  const s = await getSession();
  redirect(s ? '/dashboard' : '/login');
}
