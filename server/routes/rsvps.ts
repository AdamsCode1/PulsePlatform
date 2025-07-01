import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

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

// GET /rsvps - get all rsvps or filter by event_id
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { event_id } = req.query;
    let query = supabase.from('rsvp').select('*');
    if (event_id && typeof event_id === 'string') {
      query = query.eq('event_id', event_id);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not fetch rsvps.' });
  }
});

// GET /rsvps/:id - get one rsvp by rsvp id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.from('rsvp').select('*').eq('id', req.params.id).single();
    if (error) {
      res.status(404).json({ message: 'RSVP not found' });
      return;
    }
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not read rsvp.' });
  }
});

// POST /rsvps - add a new rsvp
router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, event_id, created_at } = req.body;
    if (!user_id || !event_id) {
      res.status(400).json({ message: 'Missing required fields.' });
      return;
    }
    if (!isNonEmptyString(user_id)) {
      res.status(400).json({ message: 'Invalid or missing user_id. It must be a non-empty string.' });
      return;
    }
    if (!isNonEmptyString(event_id)) {
      res.status(400).json({ message: 'Invalid or missing event_id. It must be a non-empty string.' });
      return;
    }
    let createdAt = created_at ? parseAndValidateUTCDate(created_at) : new Date().toISOString();
    if (!createdAt) {
      res.status(400).json({ message: 'Invalid created_at date format. Use ISO 8601 (UTC).' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    // Duplicate check: prevent same user/event pair
    const { data: existing, error: selectError } = await supabase.from('rsvp').select('*').eq('user_id', user_id).eq('event_id', event_id);
    if (selectError) throw new Error(selectError.message);
    if (existing && existing.length > 0) {
      res.status(409).json({ message: 'Duplicate RSVP. This user has already RSVP’d to this event.' });
      return;
    }
    const id = uuidv4();
    const { error } = await supabase.from('rsvp').insert([{ id, user_id, event_id, created_at: createdAt }]);
    if (error) throw new Error(error.message);
    res.status(201).json({ id, user_id, event_id, created_at: createdAt });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not add rsvp.' });
  }
});

// DELETE /rsvps/:id - delete an rsvp by rsvp id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase.from('rsvp').delete().eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.status(200).json({ message: 'RSVP deleted', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not delete rsvp.' });
  }
});

export default router;
