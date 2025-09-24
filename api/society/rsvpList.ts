import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { eventId } = req.query;
  if (!eventId) {
    return res.status(400).json({ message: 'Missing eventId parameter' });
  }
  const { data, error } = await supabase
    .from('rsvp')
    .select('created_at, occurrence_start_time, student:student_id(first_name, last_name, email)')
    .eq('event_id', eventId);
  if (error) {
    return res.status(500).json({ message: error.message });
  }
  res.status(200).json({ rsvps: data });
}
