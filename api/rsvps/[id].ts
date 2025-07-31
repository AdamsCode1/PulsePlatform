import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../_utils';
import { supabase, supabaseSchema } from '../_supabase';

// GET /api/rsvps/[id]
const handleGetRSVPById = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ message: 'RSVP ID is required' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'rsvp' : `${supabaseSchema}.rsvp`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'RSVP not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[GET /api/rsvps/[id]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve RSVP.' });
  }
};

// DELETE /api/rsvps/[id]
const handleDeleteRSVP = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ message: 'RSVP ID is required' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'rsvp' : `${supabaseSchema}.rsvp`;
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    res.status(204).end();
  } catch (error: any) {
    console.error(`[DELETE /api/rsvps/[id]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not delete RSVP.' });
  }
};

export default createHandler({
  GET: handleGetRSVPById,
  DELETE: handleDeleteRSVP
});
