import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/server/session';

const field =
  'w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-sm bg-zinc-50/50';

type Search = { sent?: string; mail?: string; error?: string };

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<Search> }) {
  const s = await getSession();
  if (!s) redirect('/login');

  const sp = await searchParams;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Обратная связь</h1>
        </div>
        <Link href="/dashboard" className="text-sm text-teal-700 hover:underline font-medium">
          ← Назад
        </Link>
      </div>

      {sp.sent === '1' && (
        <div className="mb-4 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          <p className="font-medium">Обращение принято.</p>
          {sp.mail === 'sent' && <p className="mt-1">Письмо отправлено администратору.</p>}
          {sp.mail === 'skipped' && (
            <p className="mt-1 text-teal-800">
              Письмо не отправлено: задайте переменные <code className="text-xs">ADMIN_EMAIL</code> и SMTP в окружении
              Next.js (см. <code className="text-xs">.env.example</code>).
            </p>
          )}
        </div>
      )}
      {sp.error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">{decodeURIComponent(sp.error)}</div>
      )}

      <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-card-lg ring-1 ring-zinc-100">
        <form action="/api/feedback" method="post" className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-600">
              Имя
            </label>
            <input id="name" name="name" type="text" required maxLength={200} defaultValue={s.user.name} className={field} />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-600">
              Email для ответа
            </label>
            <input id="email" name="email" type="email" required maxLength={320} defaultValue={s.user.email} className={field} />
          </div>
          <div>
            <label htmlFor="subject" className="mb-1 block text-sm font-medium text-zinc-600">
              Тема
            </label>
            <input id="subject" name="subject" type="text" required maxLength={300} className={field} placeholder="Кратко о чём речь" />
          </div>
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-zinc-600">
              Сообщение
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              maxLength={10000}
              className={field}
              placeholder="Опишите вопрос или предложение"
            />
          </div>
          <button type="submit" className="w-full rounded-lg bg-teal-700 py-2.5 font-semibold text-white transition hover:bg-teal-800">
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}
