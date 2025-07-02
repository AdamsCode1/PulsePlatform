import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

const router = Router();

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
  attendee_count?: number; // Optional, can be calculated from RSVPs
  image_url?: string; // Optional, for event images
}

// Validation helpers
const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && val.trim().length > 0;
const isValidDate = (dateStr: string): boolean => {
  if (typeof dateStr !== 'string') return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

// Helper to parse and validate ISO 8601 UTC date string
const parseAndValidateUTCDate = (val: unknown): string | null => {
  if (typeof val !== 'string') return null;
  const date = new Date(val);
  if (isNaN(date.getTime())) return null;
  // Always return as ISO string (UTC, with Z)
  return date.toISOString();
};

// GET /events - get all events
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.from('event').select('*');
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /events] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve events.' });
  }
});

// GET /events/by-date?date=YYYY-MM-DD - get all events for a specific date
router.get('/by-date', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      res.status(400).json({ message: 'Missing or invalid date parameter.' });
      return;
    }
    // Find events where start_time is on the given date (UTC)
    const startOfDay = new Date(date + 'T00:00:00.000Z').toISOString();
    const endOfDay = new Date(date + 'T23:59:59.999Z').toISOString();
    console.log(`[by-date] Querying from ${startOfDay} to ${endOfDay}`);
    const { data, error } = await supabase
      .from('event')
      .select('*')
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay);
    console.log(`[by-date] Found ${data?.length ?? 0} events`);
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /events/by-date] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve events.' });
  }
});

// GET /events/:id - get one event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    console.log(`[GET /events/:id] Requested id: ${req.params.id}`);
    const { data, error } = await supabase.from('event').select('*').eq('id', req.params.id).single();
    if (error) {
      console.error(`[GET /events/:id] Supabase error:`, error.message);
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    if (!data) {
      console.warn(`[GET /events/:id] No event found for id: ${req.params.id}`);
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    console.log(`[GET /events/:id] Event found:`, data);
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[GET /events/:id] Exception:`, error.message);
    res.status(500).json({ message: error.message || 'Could not read event.' });
  }
});

// POST /events - add a new event
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, start_time, end_time, location, category, society_id } = req.body;
    if (!name || !start_time || !end_time || !location || !category || !society_id) {
      res.status(400).json({ message: 'Missing required fields.' });
      return;
    }
    if (!isNonEmptyString(name)) {
      res.status(400).json({ message: 'Invalid or missing name. It must be a non-empty string.' });
      return;
    }
    // Only check description if provided
    if (description !== undefined && !isNonEmptyString(description)) {
      res.status(400).json({ message: 'Invalid description. If provided, it must be a non-empty string.' });
      return;
    }
    // Validate start_time and end_time as ISO strings
    const parsedStart = parseAndValidateUTCDate(start_time);
    const parsedEnd = parseAndValidateUTCDate(end_time);
    if (!parsedStart || !parsedEnd) {
      res.status(400).json({ message: 'Invalid start_time or end_time format. Use ISO 8601 (UTC).' });
      return;
    }
    if (!isNonEmptyString(location)) {
      res.status(400).json({ message: 'Invalid or missing location. It must be a non-empty string.' });
      return;
    }
    if (!isNonEmptyString(category)) {
      res.status(400).json({ message: 'Invalid or missing category. It must be a non-empty string.' });
      return;
    }
    if (!isNonEmptyString(society_id)) {
      res.status(400).json({ message: 'Invalid or missing society_id. It must be a non-empty string.' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    // Duplicate check: same name, start_time, and society_id
    const { data: existingEvents, error: selectError } = await supabase.from('event').select('*').or(`name.eq.${name},start_time.eq.${parsedStart},society_id.eq.${society_id}`);
    if (selectError) throw new Error(selectError.message);
    if (existingEvents && existingEvents.some((e: any) => e.name === name && e.start_time === parsedStart && e.society_id === society_id)) {
      res.status(409).json({ message: 'Duplicate event for this society at this time.' });
      return;
    }
    const id = uuidv4();
    const created_at = new Date().toISOString();
    const { error } = await supabase.from('event').insert([{ id, created_at, name, description, start_time: parsedStart, end_time: parsedEnd, location, category, society_id }]);
    if (error) throw new Error(error.message);
    res.status(201).json({ id, created_at, name, description, start_time: parsedStart, end_time: parsedEnd, location, category, society_id });
  } catch (error: any) {
    console.error('[POST /events] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not add event.' });
  }
});

// PUT /events/:id - update an event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, start_time, end_time, location, category, society_id } = req.body;
    if (
      name === undefined &&
      description === undefined &&
      start_time === undefined &&
      end_time === undefined &&
      location === undefined &&
      category === undefined &&
      society_id === undefined
    ) {
      res.status(400).json({ message: 'At least one field must be provided.' });
      return;
    }
    if (name !== undefined && !isNonEmptyString(name)) {
      res.status(400).json({ message: 'Invalid or missing name. It must be a non-empty string.' });
      return;
    }
    if (description !== undefined && !isNonEmptyString(description)) {
      res.status(400).json({ message: 'Invalid or missing description. It must be a non-empty string.' });
      return;
    }
    let parsedStart: string | undefined;
    let parsedEnd: string | undefined;
    if (start_time !== undefined) {
      const parsed = parseAndValidateUTCDate(start_time);
      if (!parsed) {
        res.status(400).json({ message: 'Invalid start_time format. Use ISO 8601 (UTC).' });
        return;
      }
      parsedStart = parsed;
    }
    if (end_time !== undefined) {
      const parsed = parseAndValidateUTCDate(end_time);
      if (!parsed) {
        res.status(400).json({ message: 'Invalid end_time format. Use ISO 8601 (UTC).' });
        return;
      }
      parsedEnd = parsed;
    }
    if (location !== undefined && !isNonEmptyString(location)) {
      res.status(400).json({ message: 'Invalid or missing location. It must be a non-empty string.' });
      return;
    }
    if (category !== undefined && !isNonEmptyString(category)) {
      res.status(400).json({ message: 'Invalid or missing category. It must be a non-empty string.' });
      return;
    }
    if (society_id !== undefined && !isNonEmptyString(society_id)) {
      res.status(400).json({ message: 'Invalid or missing society_id. It must be a non-empty string.' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    // Build duplicate check filter only for provided fields
    let orFilters: string[] = [];
    if (name !== undefined) orFilters.push(`name.eq.${name}`);
    if (start_time !== undefined && parsedStart !== undefined) orFilters.push(`start_time.eq.${parsedStart}`);
    if (society_id !== undefined) orFilters.push(`society_id.eq.${society_id}`);
    let existingEvents: any[] = [];
    if (orFilters.length > 0) {
      const { data, error: selectError } = await supabase.from('event').select('*').or(orFilters.join(","));
      if (selectError) throw new Error(selectError.message);
      existingEvents = data || [];
    }
    if (
      name !== undefined &&
      start_time !== undefined &&
      society_id !== undefined &&
      existingEvents.some((e: any) => e.id !== req.params.id && e.name === name && e.start_time === parsedStart && e.society_id === society_id)
    ) {
      res.status(409).json({ message: 'Duplicate event for this society at this time.' });
      return;
    }
    const updates: Partial<Event> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (start_time !== undefined && parsedStart !== undefined) updates.start_time = parsedStart;
    if (end_time !== undefined && parsedEnd !== undefined) updates.end_time = parsedEnd;
    if (location !== undefined) updates.location = location;
    if (category !== undefined) updates.category = category;
    if (society_id !== undefined) updates.society_id = society_id;
    // Remove any undefined fields from updates
    Object.keys(updates).forEach(key => updates[key as keyof Event] === undefined && delete updates[key as keyof Event]);
    const { error } = await supabase.from('event').update(updates).eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.status(200).json({ id: req.params.id, ...updates });
  } catch (error: any) {
    console.error('[PUT /events/:id] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not update event.' });
  }
});

// DELETE /events/:id - delete an event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase.from('event').delete().eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.status(200).json({ message: 'Event deleted', id: req.params.id });
  } catch (error: any) {
    console.error('[DELETE /events/:id] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not delete event.' });
  }
});



export default router;