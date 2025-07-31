import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../_utils';
import { supabase, supabaseSchema } from '../_supabase';
import { requireAdmin } from '../_requireAdmin';
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

// GET /api/events/[id]
const handleGetEventById = async (req: VercelRequest, res: VercelResponse) => {
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
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[GET /api/events/[id]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve event.' });
  }
};

// PATCH /api/events/[id]
const handleUpdateEvent = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ message: 'Event ID is required' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const updates: Partial<Event> = {};
    const { name, description, start_time, end_time, location, category, signup_link, status, attendee_count, image_url } = req.body;
    
    // Validate and add updates
    if (name !== undefined) {
      if (!isNonEmptyString(name)) {
        res.status(400).json({ message: 'Name must be a non-empty string.' });
        return;
      }
      updates.name = name;
    }
    
    if (description !== undefined) {
      updates.description = description;
    }
    
    if (start_time !== undefined) {
      const parsedStartTime = parseAndValidateUTCDate(start_time);
      if (!parsedStartTime) {
        res.status(400).json({ message: 'start_time must be a valid ISO 8601 date string.' });
        return;
      }
      updates.start_time = parsedStartTime;
    }
    
    if (end_time !== undefined) {
      const parsedEndTime = parseAndValidateUTCDate(end_time);
      if (!parsedEndTime) {
        res.status(400).json({ message: 'end_time must be a valid ISO 8601 date string.' });
        return;
      }
      updates.end_time = parsedEndTime;
    }
    
    if (location !== undefined) {
      if (!isNonEmptyString(location)) {
        res.status(400).json({ message: 'Location must be a non-empty string.' });
        return;
      }
      updates.location = location;
    }
    
    if (category !== undefined) {
      updates.category = category;
    }
    
    if (signup_link !== undefined) {
      updates.signup_link = signup_link;
    }
    
    if (status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        res.status(400).json({ message: 'Status must be one of: pending, approved, rejected.' });
        return;
      }
      updates.status = status;
    }
    
    if (attendee_count !== undefined) {
      if (typeof attendee_count !== 'number' || attendee_count < 0) {
        res.status(400).json({ message: 'Attendee count must be a non-negative number.' });
        return;
      }
      updates.attendee_count = attendee_count;
    }
    
    if (image_url !== undefined) {
      updates.image_url = image_url;
    }
    
    // Validate start_time vs end_time if both are being updated
    if (updates.start_time && updates.end_time) {
      if (new Date(updates.start_time) >= new Date(updates.end_time)) {
        res.status(400).json({ message: 'start_time must be before end_time.' });
        return;
      }
    }
    
    updates.updated_at = new Date().toISOString();
    
    const tableName = supabaseSchema === 'public' ? 'events' : `${supabaseSchema}.events`;
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
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
    console.error(`[PATCH /api/events/[id]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not update event.' });
  }
};

// DELETE /api/events/[id]
const handleDeleteEvent = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ message: 'Event ID is required' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'events' : `${supabaseSchema}.events`;
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    res.status(204).end();
  } catch (error: any) {
    console.error(`[DELETE /api/events/[id]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not delete event.' });
  }
};

export default createHandler({
  GET: handleGetEventById,
  PATCH: handleUpdateEvent,
  DELETE: handleDeleteEvent
});
