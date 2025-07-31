import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../../_utils';
import { supabase, supabaseSchema } from '../../_supabase';

// GET /api/events/society/[societyId]
const handleGetSocietyEvents = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { societyId } = req.query;
    
    if (!societyId || typeof societyId !== 'string') {
      res.status(400).json({ message: 'Society ID is required' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'events' : `${supabaseSchema}.events`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('society_id', societyId)
      .order('start_time', { ascending: true });
    
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[GET /api/events/society/[societyId]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve society events.' });
  }
};

export default createHandler({
  GET: handleGetSocietyEvents
});
