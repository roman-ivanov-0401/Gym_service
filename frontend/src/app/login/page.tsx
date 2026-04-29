import LoginForm from '@/components/auth/LoginForm';

type Props = { searchParams: Promise<{ notice?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const notice = sp.notice ? decodeURIComponent(sp.notice) : null;
  return <LoginForm notice={notice} />;
}
