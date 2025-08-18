import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHandler } from '../../lib/utils';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const requireAdmin = async (req: VercelRequest) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) throw new Error('Authentication token not provided.');

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) throw new Error('Authentication failed.');
  if (user.app_metadata?.role !== 'admin') {
    throw new Error('You must be an admin to perform this action.');
  }
  return user;
};

const handleGetSettings = async (_req: VercelRequest, res: VercelResponse) => {
  try {
    const { data, error } = await supabaseAdmin
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

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('platform_settings')
      .select('*')
      .eq('key', 'platform')
      .single();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError; // 116: not found

    let data, error;
    if (!existing) {
      ({ data, error } = await supabaseAdmin
        .from('platform_settings')
        .insert({ key: 'platform', config: payload })
        .select()
        .single());
    } else {
      ({ data, error } = await supabaseAdmin
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
