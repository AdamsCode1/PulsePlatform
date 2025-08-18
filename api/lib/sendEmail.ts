import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM_EMAIL;
const smtpSecure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || smtpPort === 465;

if (!smtpHost || Number.isNaN(smtpPort) || !smtpUser || !smtpPass || !smtpFrom) {
  throw new Error('SMTP config incomplete: ensure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL are set.');
}

const transporter = nodemailer.createTransporter({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure, // true for 465 or when SMTP_SECURE=true
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const mailOptions = {
    from: smtpFrom,
    to,
    subject,
    text,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    throw new Error(`SMTP send failed: ${(err as Error)?.message ?? String(err)}`);
  }
}
