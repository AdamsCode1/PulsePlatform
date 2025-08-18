import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

if (!SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not set');
}
if (!SENDGRID_FROM_EMAIL) {
  throw new Error('SENDGRID_FROM_EMAIL is not set');
}

sgMail.setApiKey(SENDGRID_API_KEY);

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
  const msg = {
    to,
    from: SENDGRID_FROM_EMAIL,
    subject,
    text,
    html,
  };
  try {
    await sgMail.send(msg);
  } catch (err) {
    // TODO: route through your logger if available
    throw new Error(`SendGrid send failed: ${(err as Error)?.message ?? String(err)}`);
  }
}
