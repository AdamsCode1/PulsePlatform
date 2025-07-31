import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from './_utils';
import { supabase, supabaseSchema } from './_supabase';
import { v4 as uuidv4 } from 'uuid';

// Event type matching Supabase schema + additional fields
interface Event {
  id: string;
  created_at: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location: string;
  category?: string;
  society_id: string;
  signup_link?: string;
  status: 'pending' | 'approved' | 'rejected';
  updated_at?: string;
  attendee_count?: number;
  image_url?: string;
}

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && val.trim().length > 0;
const parseAndValidateUTCDate = (val: unknown): string | null => {
  if (typeof val !== 'string') return null;
  const date = new Date(val);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};

// GET /api/events
const handleGetEvents = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'events' : `${supabaseSchema}.events`;
    let query = supabase.from(tableName).select('*');
    
    // Handle query parameters
    if (req.query.status) {
      if (req.query.status !== 'all') {
        query = query.eq('status', req.query.status);
      }
    } else {
      query = query.eq('status', 'approved');
    }
    
    if (req.query.society_id) {
      query = query.eq('society_id', req.query.society_id);
    }
    
    const { data, error } = await query.order('start_time', { ascending: true });
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /api/events] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve events.' });
  }
};

// POST /api/events
const handleCreateEvent = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { name, description, start_time, end_time, location, category, society_id, signup_link, image_url } = req.body;
    
    // Validation
    if (!isNonEmptyString(name)) {
      res.status(400).json({ message: 'Name is required and must be a non-empty string.' });
      return;
    }
    if (!isNonEmptyString(location)) {
      res.status(400).json({ message: 'Location is required and must be a non-empty string.' });
      return;
    }
    if (!isNonEmptyString(society_id)) {
      res.status(400).json({ message: 'Society ID is required and must be a non-empty string.' });
      return;
    }
    
    const parsedStartTime = parseAndValidateUTCDate(start_time);
    const parsedEndTime = parseAndValidateUTCDate(end_time);
    
    if (!parsedStartTime) {
      res.status(400).json({ message: 'start_time is required and must be a valid ISO 8601 date string.' });
      return;
    }
    if (!parsedEndTime) {
      res.status(400).json({ message: 'end_time is required and must be a valid ISO 8601 date string.' });
      return;
    }
    
    if (new Date(parsedStartTime) >= new Date(parsedEndTime)) {
      res.status(400).json({ message: 'start_time must be before end_time.' });
      return;
    }
    
    const newEvent: Omit<Event, 'created_at' | 'updated_at'> = {
      id: uuidv4(),
      name,
      description: description || null,
      start_time: parsedStartTime,
      end_time: parsedEndTime,
      location,
      category: category || null,
      society_id,
      signup_link: signup_link || null,
      status: 'pending',
      attendee_count: 0,
      image_url: image_url || null,
    };
    
    const tableName = supabaseSchema === 'public' ? 'events' : `${supabaseSchema}.events`;
    const { data, error } = await supabase.from(tableName).insert([newEvent]).select().single();
    
    if (error) throw new Error(error.message);
    res.status(201).json(data);
  } catch (error: any) {
    console.error('[POST /api/events] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not create event.' });
  }
};

// Main handler for /api/events base routes
export default createHandler({
  GET: async (req: VercelRequest, res: VercelResponse) => {
    // GET /api/events
    return handleGetEvents(req, res);
  },
  POST: async (req: VercelRequest, res: VercelResponse) => {
    // POST /api/events
    return handleCreateEvent(req, res);
  }
});
