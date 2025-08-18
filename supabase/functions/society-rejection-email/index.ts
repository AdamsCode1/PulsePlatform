// supabase/functions/society-rejection-email/index.ts
// Edge Function to send event rejection emails via SendGrid
// Deno runtime

/// <reference types="https://deno.land/types/index.d.ts" />
import { serve } from "std/server";

// Supabase Edge Functions use Deno.env.get for environment variables, but you must set them in the Supabase dashboard.
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") ?? "noreply@yourdomain.com";

serve(async (req) => {
  if (!SENDGRID_API_KEY) {
    return new Response("SendGrid API key not configured", { status: 500 });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { organiserEmail, eventName, rejectionReason } = body;
  if (!organiserEmail || !eventName || !rejectionReason) {
    return new Response("Missing required fields", { status: 400 });
  }

  const emailData = {
    personalizations: [
      {
        to: [{ email: organiserEmail }],
        subject: `Your event "${eventName}" was rejected`
      }
    ],
    from: { email: FROM_EMAIL },
    content: [
      {
        type: "text/plain",
        value: `Hello,\n\nYour event "${eventName}" was rejected by the admin.\n\nReason: ${rejectionReason}\n\nIf you have questions, please contact support.`
      }
    ]
  };

  const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(emailData)
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    return new Response(`Failed to send email: ${errorText}`, { status: 500 });
  }

  return new Response("Email sent successfully", { status: 200 });
});
