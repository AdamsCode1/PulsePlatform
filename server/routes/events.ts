import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase, supabaseSchema } from '../lib/supabase';
import { requireAdmin } from '../lib/requireAdmin';

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

// GET /events - get all events (only approved)
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    const { data, error } = await supabase.from(tableName).select('*').eq('status', 'approved');
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not retrieve events.' });
  }
});

// GET /events/by-date?date=YYYY-MM-DD - get all events for a specific date, including society name (only approved)
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
    const { data, error } = await supabase
      .from(tableName)
      .select('*, society(name)')
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .eq('status', 'approved');
    if (error) throw new Error(error.message);
    const eventsWithSociety = (data || []).map((event: any) => ({
      ...event,
      societyName: event.society?.name || '',
    }));
    res.status(200).json(eventsWithSociety);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not retrieve events.' });
  }
});

// ADMIN: Get all pending events
router.get('/pending', requireAdmin, async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    const { data, error } = await supabase.from(tableName).select('*').eq('status', 'pending');
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not retrieve pending events.' });
  }
});

// GET /events/:id - get one event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    const { data, error } = await supabase.from(tableName).select('*').eq('id', req.params.id).single();
    if (error || !data) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not read event.' });
  }
});

// POST /events - add a new event (status: pending by default)
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
    if (description !== undefined && !isNonEmptyString(description)) {
      res.status(400).json({ message: 'Invalid description. If provided, it must be a non-empty string.' });
      return;
    }
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
    const { data: existingEvents, error: selectError } = await supabase.from(tableName).select('*').or(`name.eq.${name},start_time.eq.${parsedStart},society_id.eq.${society_id}`);
    if (selectError) throw new Error(selectError.message);
    if (existingEvents && existingEvents.some((e: any) => e.name === name && e.start_time === parsedStart && e.society_id === society_id)) {
      res.status(409).json({ message: 'Duplicate event for this society at this time.' });
      return;
    }
    const id = uuidv4();
    const created_at = new Date().toISOString();
    const status = 'pending';
    const { data: insertResult, error } = await supabase.from(tableName).insert([{ id, created_at, name, description, start_time: parsedStart, end_time: parsedEnd, location, category, society_id, signup_link, status }]);
    if (error) throw new Error(error.message);
    res.status(201).json({ id, created_at, name, description, start_time: parsedStart, end_time: parsedEnd, location, category, society_id, signup_link, status });
  } catch (error: any) {
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
    res.status(500).json({ message: error.message || 'Could not delete event.' });
  }
});

// ADMIN: Approve an event
router.post('/:id/approve', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || !isNonEmptyString(id)) {
      res.status(400).json({ message: 'Invalid or missing event ID.' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    const { error } = await supabase.from(tableName).update({ status: 'approved' }).eq('id', id);
    if (error) throw new Error(error.message);
    res.status(200).json({ id, status: 'approved' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not approve event.' });
  }
});

// ADMIN: Reject an event (mark as rejected)
router.post('/:id/reject', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || !isNonEmptyString(id)) {
      res.status(400).json({ message: 'Invalid or missing event ID.' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    // Get rejection reason from body
    const reason = req.body?.reason || '';
    // Fetch event to get society_id
    const eventRes = await supabase.from(tableName).select('name,society_id').eq('id', id).single();
    if (eventRes.error || !eventRes.data) throw new Error('Event not found');
    const eventName = eventRes.data.name;
    const societyId = eventRes.data.society_id;
    // Fetch society to get contact_email
    const societyTable = supabaseSchema === 'public' ? 'society' : `${supabaseSchema}.society`;
    const societyRes = await supabase.from(societyTable).select('contact_email').eq('id', societyId).single();
    if (societyRes.error || !societyRes.data) throw new Error('Society not found');
    const contactEmail = societyRes.data.contact_email;
    // Update event status
    const { error } = await supabase.from(tableName).update({ status: 'rejected' }).eq('id', id);
    if (error) throw new Error(error.message);
    // Send rejection email using SMTP
    try {
      const { sendEmail } = require('../../api/lib/sendEmail');
      await sendEmail({
        to: contactEmail,
        subject: `Event "${eventName}" Rejected`,
        text: `Your event titled "${eventName}" has been rejected.\n\nReason: ${reason || 'No reason provided.'}`,
      });
    } catch (emailErr) {
      // Log but don't fail the request if email fails
      console.error('Failed to send rejection email:', emailErr);
    }
    res.status(200).json({ id, status: 'rejected' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not reject event.' });
  }
});

// ============================================================================
// SOCIETY-SPECIFIC ENDPOINTS (for society event management)
// ============================================================================

// GET /events/society/:societyId - get all events for a specific society
router.get('/society/:societyId', async (req: Request, res: Response) => {
  try {
    const { societyId } = req.params;
    const { status, upcoming } = req.query;
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    
    let query = supabase.from(tableName).select('*').eq('society_id', societyId);
    
    // Filter by status if provided
    if (status && typeof status === 'string' && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Filter by upcoming/previous if provided
    if (upcoming === 'true') {
      query = query.gte('start_time', new Date().toISOString());
    } else if (upcoming === 'false') {
      query = query.lt('end_time', new Date().toISOString());
    }
    
    // Order by start_time
    const isUpcoming = upcoming !== 'false';
    query = query.order('start_time', { ascending: isUpcoming });
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not retrieve society events.' });
  }
});

// PUT /events/society/:eventId - update an event (society only, with status reset)
router.put('/society/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { name, description, start_time, end_time, location, category, society_id } = req.body;
    
    if (!eventId || !isNonEmptyString(eventId)) {
      res.status(400).json({ message: 'Invalid or missing event ID.' });
      return;
    }
    
    // Validate required fields
    if (!isNonEmptyString(name)) {
      res.status(400).json({ message: 'Event name is required.' });
      return;
    }
    
    const parsedStart = parseAndValidateUTCDate(start_time);
    if (!parsedStart) {
      res.status(400).json({ message: 'Invalid start_time format. Use ISO 8601 (UTC).' });
      return;
    }
    
    const parsedEnd = parseAndValidateUTCDate(end_time);
    if (!parsedEnd) {
      res.status(400).json({ message: 'Invalid end_time format. Use ISO 8601 (UTC).' });
      return;
    }
    
    if (!isNonEmptyString(location)) {
      res.status(400).json({ message: 'Location is required.' });
      return;
    }
    
    if (!isNonEmptyString(society_id)) {
      res.status(400).json({ message: 'Society ID is required.' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    
    // Check if society owns this event
    const { data: existing, error: fetchError } = await supabase
      .from(tableName)
      .select('society_id, status')
      .eq('id', eventId)
      .single();
      
    if (fetchError) throw new Error('Event not found.');
    if (existing.society_id !== society_id) {
      res.status(403).json({ message: 'Not authorized to edit this event.' });
      return;
    }
    
    const updates = {
      name,
      description,
      start_time: parsedStart,
      end_time: parsedEnd,
      location,
      category,
      updated_at: new Date().toISOString()
      // Note: status reset is handled by database trigger
    };
    
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not update event.' });
  }
});

// DELETE /events/society/:eventId - delete an event (society only)
router.delete('/society/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { society_id } = req.query;
    
    if (!eventId || !isNonEmptyString(eventId)) {
      res.status(400).json({ message: 'Invalid or missing event ID.' });
      return;
    }
    
    if (!society_id || !isNonEmptyString(society_id as string)) {
      res.status(400).json({ message: 'Society ID is required.' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'event' : `${supabaseSchema}.event`;
    
    // Check if society owns this event
    const { data: existing, error: fetchError } = await supabase
      .from(tableName)
      .select('society_id')
      .eq('id', eventId)
      .single();
      
    if (fetchError) throw new Error('Event not found.');
    if (existing.society_id !== society_id) {
      res.status(403).json({ message: 'Not authorized to delete this event.' });
      return;
    }
    
    // Hard delete the event
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', eventId);
      
    if (error) throw new Error(error.message);
    
    res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not delete event.' });
  }
});

export default router;