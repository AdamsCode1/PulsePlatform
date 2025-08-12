import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const { contact_email, user_id, description, website_url } = req.body;
    if (!contact_email || !user_id) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    // Check if partner already exists
    const { data: existing, error: existingError } = await supabase
      .from('partners')
      .select('id')
      .eq('contact_email', contact_email)
      .single();
    if (existing && !existingError) {
      return res.status(409).json({ message: 'Partner with this email already exists.' });
    }
    // Insert partner info
    const { data, error } = await supabase
      .from('partners')
      .insert([
        {
          contact_email,
          user_id,
          description: description || null,
          website_url: website_url || null
        }
      ])
      .select()
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return res.status(201).json({ id: data.id, contact_email: data.contact_email });
  } catch (error: any) {
    console.error('Partner registration error:', error);
    return res.status(500).json({ message: 'Registration failed.' });
  }
}
