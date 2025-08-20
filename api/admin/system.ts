import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHandler } from '../../lib/utils.js';

let supabaseAdmin: SupabaseClient | undefined;
function initSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Server configuration error: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}

const requireAdmin = async (req: VercelRequest) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) throw new Error('Authentication token not provided.');

  const client = initSupabaseAdmin();
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) throw new Error('Authentication failed.');
  
  // Check admin table for UID
  const { data: adminRow, error: adminError } = await client
    .from('admin')
    .select('uid')
    .eq('uid', user.id)
    .maybeSingle();
  if (adminError || !adminRow) {
    throw new Error('You must be an admin to perform this action.');
  }
  return user;
};

const handleHealth = async (_req: VercelRequest, res: VercelResponse) => {
  try {
  const client = initSupabaseAdmin();
  const { error } = await client.from('event').select('id').limit(1);
    if (error) throw error;
    return res.status(200).json({ api: 'healthy', db: 'healthy', ts: new Date().toISOString() });
  } catch (error: any) {
    return res.status(500).json({ api: 'degraded', db: 'degraded', message: error.message });
  }
};

const handleCache = async (req: VercelRequest, res: VercelResponse) => {
  try {
    await requireAdmin(req);
    // Placeholder: in-memory no-op; wire to cache provider if configured
    return res.status(200).json({ message: 'Cache cleared' });
  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

const handleExport = async (req: VercelRequest, res: VercelResponse) => {
  try {
    await requireAdmin(req);
  const client = initSupabaseAdmin();
  const { data: events } = await client.from('event').select('*').limit(1000);
  const { data: deals } = await client.from('deals').select('*').limit(1000);
    const payload = { exported_at: new Date().toISOString(), events, deals };
    return res.status(200).json(payload);
  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

export default createHandler({
  GET: handleHealth,
  POST: handleCache,
  PATCH: handleExport,
});
