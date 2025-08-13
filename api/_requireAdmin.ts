import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for admin verification
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function requireAdmin(req: VercelRequest, res: VercelResponse): Promise<{ user: any } | null> {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      res.status(401).json({ message: 'Authentication token not provided.' });
      return null;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ message: 'Authentication failed.' });
      return null;
    }

    if (user.app_metadata?.role !== 'admin') {
      res.status(403).json({ message: 'You must be an admin to perform this action.' });
      return null;
    }

    return { user };
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return null;
  }
}

// Helper function for middleware pattern in Vercel functions
export function withAdminAuth(handler: (req: VercelRequest, res: VercelResponse, user: any) => Promise<void>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const authResult = await requireAdmin(req, res);
    if (!authResult) return; // Response already sent by requireAdmin
    
    return handler(req, res, authResult.user);
  };
}
