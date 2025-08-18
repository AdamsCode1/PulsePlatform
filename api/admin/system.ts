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

const handleHealth = async (_req: VercelRequest, res: VercelResponse) => {
  try {
    const { error } = await supabaseAdmin.from('event').select('id').limit(1);
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
    const { data: events } = await supabaseAdmin.from('event').select('*').limit(1000);
    const { data: deals } = await supabaseAdmin.from('deals').select('*').limit(1000);
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
