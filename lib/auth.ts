import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// CORS headers
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    const { email, password, type } = req.body;

    if (!email || !password || !type) {
      return res.status(400).json({ message: 'Missing email, password, or type.' });
    }

    // Determine which table to query based on type
    const table = type === 'society' ? 'society' : 'student';
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Password check (assuming password_hash field exists)
    if (!data.password_hash || !bcrypt.compareSync(password, data.password_hash)) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Issue JWT
    const token = jwt.sign({ id: data.id, type }, JWT_SECRET, { expiresIn: '7d' });
    
    return res.json({ 
      token, 
      user: { 
        id: data.id, 
        email: data.email, 
        name: data.name || `${data.first_name} ${data.last_name}`.trim(), 
        type 
      } 
    });
  } catch (error: any) {
    console.error('Auth API Error:', error);
    return res.status(500).json({ message: 'Login failed.' });
  }
}
