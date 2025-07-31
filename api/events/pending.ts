import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../_utils';
import { supabase, supabaseSchema } from '../_supabase';
import { requireAdmin } from '../_requireAdmin';

// GET /api/events/pending
const handleGetPendingEvents = async (req: VercelRequest, res: VercelResponse) => {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;
  
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'events' : `${supabaseSchema}.events`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /api/events/pending] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve pending events.' });
  }
};

export default createHandler({
  GET: handleGetPendingEvents
});
