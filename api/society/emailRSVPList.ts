import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '../lib/sendEmail.js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { eventId, csv } = req.body;
  if (!eventId || !csv) {
    return res.status(400).json({ message: 'Missing eventId or csv' });
  }
  // Get event and society info
  const { data: eventDetails, error: eventError } = await supabase
    .from('event')
    .select('society_id, name')
    .eq('id', eventId)
    .single();
  if (eventError || !eventDetails) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const { data: societyDetails, error: societyError } = await supabase
    .from('society')
    .select('contact_email')
    .eq('id', eventDetails.society_id)
    .single();
  if (societyError || !societyDetails) {
    return res.status(404).json({ message: 'Society not found' });
  }
  // Send RSVP list email
  try {
    // Format CSV as HTML table for email
    const rows = csv.split('\n').map(row => row.split(','));
    const htmlTable = `
      <table style="border-collapse:collapse;width:100%;">
        <thead>
          <tr>
            ${rows[0].map(h => `<th style='border:1px solid #ccc;padding:8px;background:#f3f3f3;'>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.slice(1).map(row => `
            <tr>
              ${row.map(cell => `<td style='border:1px solid #ccc;padding:8px;'>${cell}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    await sendEmail({
      to: societyDetails.contact_email,
      subject: `RSVP List for Event "${eventDetails.name}"`,
      text: `Here is the RSVP list for your event "${eventDetails.name}":\n\n${csv}`,
      html: `<h2>RSVP List for "${eventDetails.name}"</h2>${htmlTable}`
    });
    return res.status(200).json({ message: 'Email sent!' });
  } catch (emailErr: any) {
    return res.status(500).json({ message: emailErr.message || 'Failed to send email' });
  }
}
