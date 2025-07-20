import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase, supabaseSchema } from '../lib/supabase';

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
  signup_link?: string; // Optional, for external signups
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
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /events] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve events.' });
  }
});

// GET /events/by-date?date=YYYY-MM-DD - get all events for a specific date, including society name
router.get('/by-date', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      res.status(400).json({ message: 'Missing or invalid date parameter.' });
      return;
    }
    const startOfDay = new Date(date + 'T00:00:00.000Z').toISOString();
    const endOfDay = new Date(date + 'T23:59:59.999Z').toISOString();
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    // Join event with society to get society name
    const { data, error } = await supabase
      .from(tableName)
      .select('*, society(name)')
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay);
    if (error) throw new Error(error.message);
    // Attach societyName to each event
    const eventsWithSociety = (data || []).map((event: any) => ({
      ...event,
      societyName: event.society?.name || '',
    }));
    res.status(200).json(eventsWithSociety);
  } catch (error: any) {
    console.error('[GET /events/by-date] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve events.' });
  }
});

// GET /events/:id - get one event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    const { data, error } = await supabase.from(tableName).select('*').eq('id', req.params.id).single();
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
    const { name, description, start_time, end_time, location, category, society_id, signup_link } = req.body;
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
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    // Duplicate check: same name, start_time, and society_id
    const { data: existingEvents, error: selectError } = await supabase.from(tableName).select('*').or(`name.eq.${name},start_time.eq.${parsedStart},society_id.eq.${society_id}`);
    if (selectError) throw new Error(selectError.message);
    if (existingEvents && existingEvents.some((e: any) => e.name === name && e.start_time === parsedStart && e.society_id === society_id)) {
      res.status(409).json({ message: 'Duplicate event for this society at this time.' });
      return;
    }
    const id = uuidv4();
    const created_at = new Date().toISOString();
    const { data: insertResult, error } = await supabase.from(tableName).insert([{ id, created_at, name, description, start_time: parsedStart, end_time: parsedEnd, location, category, society_id, signup_link }]);
    if (error) throw new Error(error.message);
    res.status(201).json({ id, created_at, name, description, start_time: parsedStart, end_time: parsedEnd, location, category, society_id, signup_link });
  } catch (error: any) {
    console.error('[POST /events] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not create event.' });
  }
});

// PATCH /events/:id - update an event
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, start_time, end_time, location, category, society_id, signup_link } = req.body;
    if (!id || !isNonEmptyString(id)) {
      res.status(400).json({ message: 'Invalid or missing event ID.' });
      return;
    }
    // Only include fields that are provided in the request
    const updates: any = {};
    if (name !== undefined) {
      if (!isNonEmptyString(name)) {
        res.status(400).json({ message: 'Invalid name. It must be a non-empty string.' });
        return;
      }
      updates.name = name;
    }
    if (description !== undefined) {
      if (!isNonEmptyString(description)) {
        res.status(400).json({ message: 'Invalid description. It must be a non-empty string.' });
        return;
      }
      updates.description = description;
    }
    if (start_time !== undefined) {
      const parsedStart = parseAndValidateUTCDate(start_time);
      if (!parsedStart) {
        res.status(400).json({ message: 'Invalid start_time format. Use ISO 8601 (UTC).' });
        return;
      }
      updates.start_time = parsedStart;
    }
    if (end_time !== undefined) {
      const parsedEnd = parseAndValidateUTCDate(end_time);
      if (!parsedEnd) {
        res.status(400).json({ message: 'Invalid end_time format. Use ISO 8601 (UTC).' });
        return;
      }
      updates.end_time = parsedEnd;
    }
    if (location !== undefined) {
      if (!isNonEmptyString(location)) {
        res.status(400).json({ message: 'Invalid location. It must be a non-empty string.' });
        return;
      }
      updates.location = location;
    }
    if (category !== undefined) {
      if (!isNonEmptyString(category)) {
        res.status(400).json({ message: 'Invalid category. It must be a non-empty string.' });
        return;
      }
      updates.category = category;
    }
    if (society_id !== undefined) {
      if (!isNonEmptyString(society_id)) {
        res.status(400).json({ message: 'Invalid society_id. It must be a non-empty string.' });
        return;
      }
      updates.society_id = society_id;
    }
    if (signup_link !== undefined) {
      if (typeof signup_link !== 'string') {
        res.status(400).json({ message: 'Invalid signup_link. It must be a string.' });
        return;
      }
      updates.signup_link = signup_link;
    }
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: 'No valid fields provided for update.' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    const { error } = await supabase.from(tableName).update(updates).eq('id', id);
    if (error) throw new Error(error.message);
    res.status(200).json({ id, ...updates });
  } catch (error: any) {
    console.error(`[PATCH /events/:id] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not update event.' });
  }
});

// DELETE /events/:id - delete an event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || !isNonEmptyString(id)) {
      res.status(400).json({ message: 'Invalid or missing event ID.' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw new Error(error.message);
    res.status(204).send('');
  } catch (error: any) {
    console.error(`[DELETE /events/:id] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not delete event.' });
  }
});

export default router;