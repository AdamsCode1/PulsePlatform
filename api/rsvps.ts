import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from './_utils';
import { supabase, supabaseSchema } from './_supabase';
import { v4 as uuidv4 } from 'uuid';

// RSVP type matching Supabase schema
interface RSVP {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && val.trim().length > 0;

// Helper to get path segments
const getPathSegments = (req: VercelRequest): string[] => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  return url.pathname.split('/').filter(Boolean).slice(1); // Remove 'api' prefix
};

// GET /api/rsvps
const handleGetRSVPs = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'rsvp' : `${supabaseSchema}.rsvp`;
    
    let query = supabase.from(tableName).select('*');
    
    // Filter by user_id if provided
    if (req.query.user_id) {
      query = query.eq('user_id', req.query.user_id);
    }
    
    // Filter by event_id if provided
    if (req.query.event_id) {
      query = query.eq('event_id', req.query.event_id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /api/rsvps] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve RSVPs.' });
  }
};

// POST /api/rsvps
const handleCreateRSVP = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { user_id, event_id } = req.body;
    
    // Validation
    if (!isNonEmptyString(user_id)) {
      res.status(400).json({ message: 'User ID is required and must be a non-empty string.' });
      return;
    }
    if (!isNonEmptyString(event_id)) {
      res.status(400).json({ message: 'Event ID is required and must be a non-empty string.' });
      return;
    }
    
    // Check if RSVP already exists
    const tableName = supabaseSchema === 'public' ? 'rsvp' : `${supabaseSchema}.rsvp`;
    const { data: existingRSVP, error: checkError } = await supabase
      .from(tableName)
      .select('id')
      .eq('user_id', user_id)
      .eq('event_id', event_id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(checkError.message);
    }
    
    if (existingRSVP) {
      res.status(409).json({ message: 'RSVP already exists for this user and event.' });
      return;
    }
    
    const newRSVP: Omit<RSVP, 'created_at'> = {
      id: uuidv4(),
      user_id,
      event_id,
    };
    
    const { data, error } = await supabase
      .from(tableName)
      .insert([newRSVP])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    res.status(201).json(data);
  } catch (error: any) {
    console.error('[POST /api/rsvps] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not create RSVP.' });
  }
};

// Handle dynamic routes
const handleDynamicRoute = async (req: VercelRequest, res: VercelResponse) => {
  const pathSegments = getPathSegments(req);
  const rsvpId = pathSegments[1]; // rsvps/[id]
  
  if (!rsvpId) {
    res.status(400).json({ message: 'RSVP ID is required' });
    return;
  }
  
  switch (req.method) {
    case 'GET':
      return handleGetRSVPById(req, res, rsvpId);
    case 'DELETE':
      return handleDeleteRSVP(req, res, rsvpId);
    default:
      res.status(405).json({ message: `Method ${req.method} not allowed` });
      return;
  }
};

// GET /api/rsvps/[id]
const handleGetRSVPById = async (req: VercelRequest, res: VercelResponse, rsvpId: string) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'rsvp' : `${supabaseSchema}.rsvp`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', rsvpId)
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'RSVP not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[GET /api/rsvps/${rsvpId}] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve RSVP.' });
  }
};

// DELETE /api/rsvps/[id]
const handleDeleteRSVP = async (req: VercelRequest, res: VercelResponse, rsvpId: string) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'rsvp' : `${supabaseSchema}.rsvp`;
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', rsvpId);
    
    if (error) throw new Error(error.message);
    res.status(204).end();
  } catch (error: any) {
    console.error(`[DELETE /api/rsvps/${rsvpId}] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not delete RSVP.' });
  }
};

// Main handler for /api/rsvps base routes
export default createHandler({
  GET: async (req: VercelRequest, res: VercelResponse) => {
    // GET /api/rsvps
    return handleGetRSVPs(req, res);
  },
  POST: async (req: VercelRequest, res: VercelResponse) => {
    // POST /api/rsvps
    return handleCreateRSVP(req, res);
  }
});
