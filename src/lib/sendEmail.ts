// This uses SendGrid credentials from your environment
export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
  // @ts-ignore
  const sgMail = await import('@sendgrid/mail');
  sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);
  await sgMail.send({
    to,
    from: import.meta.env.VITE_SENDGRID_FROM_EMAIL,
    subject,
    text,
    html,
  });
}
