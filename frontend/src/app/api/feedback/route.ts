import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_ACCESS } from '@/lib/cookies';
import { gymServiceUrl } from '@/lib/env';
import { sendFeedbackEmailToAdmin } from '@/lib/server/mail';
import { safeRedirectOrigin } from '@/lib/server/redirect-origin';

function feedbackUrl(req: NextRequest, query: Record<string, string>) {
  const u = new URL('/feedback', safeRedirectOrigin(req));
  for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v);
  return u;
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.redirect(feedbackUrl(req, { error: encodeURIComponent('Некорректные данные формы') }));
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const subject = String(formData.get('subject') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!name || !email || !subject || !message) {
    return NextResponse.redirect(feedbackUrl(req, { error: encodeURIComponent('Заполните все поля') }));
  }
  if (name.length > 200 || email.length > 320 || subject.length > 300 || message.length > 10000) {
    return NextResponse.redirect(feedbackUrl(req, { error: encodeURIComponent('Слишком длинное значение') }));
  }

  const jar = await cookies();
  const token = jar.get(COOKIE_ACCESS)?.value;

  const gymRes = await fetch(`${gymServiceUrl()}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name, email, subject, message }),
  });

  if (!gymRes.ok) {
    let errText = 'Не удалось сохранить обращение';
    try {
      const j = (await gymRes.json()) as { message?: string; error?: { message?: string } };
      errText = j.message ?? j.error?.message ?? errText;
    } catch {
      /* ignore */
    }
    return NextResponse.redirect(feedbackUrl(req, { error: encodeURIComponent(errText) }));
  }

  const mail = await sendFeedbackEmailToAdmin({ name, email, subject, message });
  return NextResponse.redirect(feedbackUrl(req, { sent: '1', mail: mail.sent ? 'sent' : 'skipped' }));
}
