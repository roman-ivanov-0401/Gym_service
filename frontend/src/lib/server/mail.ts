import nodemailer from 'nodemailer';

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Отправка письма администратору из API route (SMTP через env). */
export async function sendFeedbackEmailToAdmin(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ sent: boolean }> {
  const admin = process.env.ADMIN_EMAIL?.trim();
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const fromAddr = (process.env.SMTP_FROM || user || 'noreply@localhost').trim();

  if (!admin || !host || !user || !pass) {
    console.warn('[mail] Письмо не отправлено: задайте ADMIN_EMAIL, SMTP_HOST, SMTP_USER, SMTP_PASS');
    return { sent: false };
  }

  const rejectUnauthorized =
    process.env.SMTP_TLS_REJECT_UNAUTHORIZED === undefined ||
    process.env.SMTP_TLS_REJECT_UNAUTHORIZED === '1' ||
    process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true';

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    ...(rejectUnauthorized ? {} : { tls: { rejectUnauthorized: false } }),
  });

  await transporter.sendMail({
    from: `"GymApp" <${fromAddr}>`,
    to: admin,
    replyTo: `${params.name} <${params.email}>`,
    subject: `[GymApp] Обратная связь: ${params.subject}`,
    text: `От: ${params.name} <${params.email}>\n\n${params.message}`,
    html: `<p><b>От:</b> ${escapeHtml(params.name)} &lt;${escapeHtml(params.email)}&gt;</p><p><b>Тема:</b> ${escapeHtml(
      params.subject,
    )}</p><pre style="white-space:pre-wrap">${escapeHtml(params.message)}</pre>`,
  });

  return { sent: true };
}
