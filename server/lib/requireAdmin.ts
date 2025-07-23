import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// List of admin emails from environment variable (comma-separated)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid Authorization header:', authHeader);
      return res.status(401).json({ message: 'Missing or invalid Authorization header' });
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
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    const userEmail = data.user.email;
    console.log('User email:', userEmail);
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      console.log('User is not admin:', userEmail);
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    // Attach user info to request if needed
    (req as any).user = data.user;
    next();
  } catch (err) {
    console.log('Internal server error in requireAdmin:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
