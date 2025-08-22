import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHandler } from '../../lib/utils.js';

let supabaseAdmin: SupabaseClient | undefined;
function initSupabaseAdmin(req?: VercelRequest): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url) {
    throw new Error('Server configuration error: missing SUPABASE_URL');
  }
  if (serviceKey) {
    if (!supabaseAdmin) supabaseAdmin = createClient(url, serviceKey);
    return supabaseAdmin;
  }
  const token = req?.headers.authorization?.split('Bearer ')[1];
  if (!anonKey || !token) {
    throw new Error('Server configuration error: missing SUPABASE_SERVICE_ROLE_KEY and no anon+token fallback available');
  }
  return createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
}

const requireAdmin = async (req: VercelRequest) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) throw new Error('Authentication token not provided.');

  const client = initSupabaseAdmin(req);
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

const handleGetSettings = async (req: VercelRequest, res: VercelResponse) => {
  try {
  const client = initSupabaseAdmin(req);
  const { data, error } = await client
      .rpc('get_or_create_platform_settings');

    if (error) throw new Error(error.message);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

const handleUpdateSettings = async (req: VercelRequest, res: VercelResponse) => {
  try {
    await requireAdmin(req);
    const payload = req.body?.config;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ message: 'Invalid settings payload' });
    }

  const client = initSupabaseAdmin(req);
  const { data: existing, error: fetchError } = await client
      .from('platform_settings')
      .select('*')
      .eq('key', 'platform')
      .single();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError; // 116: not found

    let data, error;
    if (!existing) {
  ({ data, error } = await client
        .from('platform_settings')
        .insert({ key: 'platform', config: payload })
        .select()
        .single());
    } else {
  ({ data, error } = await client
        .from('platform_settings')
        .update({ config: payload })
        .eq('key', 'platform')
        .select()
        .single());
    }

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

export default createHandler({
  GET: handleGetSettings,
  PATCH: handleUpdateSettings,
});
