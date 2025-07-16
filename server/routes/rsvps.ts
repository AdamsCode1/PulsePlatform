import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase, supabaseSchema } from '../lib/supabase';

const router = Router();

// RSVP type matching Supabase schema
interface RSVP {
  id: string; // unique rsvp id
  user_id: string;
  event_id: string;
  created_at: string;
}

// Check if a value is a non-empty string
const isNonEmptyString = (val: unknown): val is string => {
  return typeof val === 'string' && val.trim().length > 0;
};

// Helper to parse and validate ISO 8601 UTC date string
const parseAndValidateUTCDate = (val: unknown): string | undefined => {
  if (typeof val !== 'string') return undefined;
  const date = new Date(val);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

// GET /rsvps - get all rsvps
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'rsvp' : `${supabaseSchema}.rsvp`;
    let query = supabase.from(tableName).select('*');
    if (req.query.user_id) {
      query = query.eq('user_id', req.query.user_id);
    }
    if (req.query.event_id) {
      query = query.eq('event_id', req.query.event_id);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /rsvps] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve RSVPs.' });
  }
});

// GET /rsvps/:id - get one rsvp
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'rsvp' : `${supabaseSchema}.rsvp`;
    const { data, error } = await supabase.from(tableName).select('*').eq('id', req.params.id).single();
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /rsvps/:id] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve RSVP.' });
  }
});

// POST /rsvps - add a new rsvp
router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, event_id } = req.body;
    if (!user_id || !event_id) {
      res.status(400).json({ message: 'Missing required fields.' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'rsvp' : `${supabaseSchema}.rsvp`;
    // Check for duplicate RSVP
    const { data: existing, error: selectError } = await supabase.from(tableName).select('*').eq('user_id', user_id).eq('event_id', event_id);
    if (selectError) throw new Error(selectError.message);
    if (existing && existing.length > 0) {
      res.status(409).json({ message: 'Duplicate RSVP for this user and event.' });
      return;
    }
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const { error } = await supabase.from(tableName).insert([{ id, user_id, event_id, created_at: createdAt }]);
    if (error) throw new Error(error.message);
    res.status(201).json({ id, user_id, event_id, created_at: createdAt });
  } catch (error: any) {
    console.error('[POST /rsvps] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not add RSVP.' });
  }
});

// DELETE /rsvps/:id - delete an rsvp
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'rsvp' : `${supabaseSchema}.rsvp`;
    const { error } = await supabase.from(tableName).delete().eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.status(200).json({ message: 'RSVP deleted', id: req.params.id });
  } catch (error: any) {
    console.error('[DELETE /rsvps/:id] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not delete RSVP.' });
  }
});

export default router;
