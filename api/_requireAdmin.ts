import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// List of admin emails from environment variable (comma-separated)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function requireAdmin(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  try {
    const authHeader = req.headers['authorization'] as string;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid Authorization header:', authHeader);
      res.status(401).json({ message: 'Missing or invalid Authorization header' });
      return false;
    }
    const token = authHeader.replace('Bearer ', '');
    // Validate JWT and get user info
    const { data, error } = await supabase.auth.getUser(token);
    console.log('ADMIN_EMAILS:', ADMIN_EMAILS);
    if (error) {
      console.log('Supabase Auth error:', error);
    }
    if (!data?.user) {
      console.log('No user found in token');
      res.status(401).json({ message: 'Invalid or expired token' });
      return false;
    }
    const userEmail = data.user.email;
    console.log('User email:', userEmail);
    
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      console.log('User is not an admin:', userEmail, 'Admin emails:', ADMIN_EMAILS);
      res.status(403).json({ message: 'Admin access required' });
      return false;
    }
    
    // Store user info in request for downstream use
    (req as any).user = data.user;
    return true;
  } catch (error: any) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return false;
  }
}
