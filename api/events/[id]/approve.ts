import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../../_utils';
import { supabase, supabaseSchema } from '../../_supabase';
import { requireAdmin } from '../../_requireAdmin';

// POST /api/events/[id]/approve
const handleApproveEvent = async (req: VercelRequest, res: VercelResponse) => {
  const isAdmin = await requireAdmin(req, res);
  if (!isAdmin) return;
  
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ message: 'Event ID is required' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'events' : `${supabaseSchema}.events`;
    
    const { data, error } = await supabase
      .from(tableName)
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[POST /api/events/[id]/approve] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not approve event.' });
  }
};

export default createHandler({
  POST: handleApproveEvent
});
