import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

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

// Helper to get API base URL (adjust as needed)
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/unified?resource=events';

// GET /events - get all events (now via API)
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, { method: 'GET' });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
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
    const response = await fetch(`${API_BASE_URL}&date=${encodeURIComponent(date)}`, { method: 'GET' });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /events/by-date] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve events.' });
  }
});

// GET /events/:id - get one event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${API_BASE_URL}&id=${encodeURIComponent(req.params.id)}`, { method: 'GET' });
    if (!response.ok) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[GET /events/:id] Exception:`, error.message);
    res.status(500).json({ message: error.message || 'Could not read event.' });
  }
});

// POST /events - add a new event
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    res.status(201).json(data);
  } catch (error: any) {
    console.error('[POST /events] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not create event.' });
  }
});

// PATCH /events/:id - update an event
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${API_BASE_URL}&id=${encodeURIComponent(req.params.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[PATCH /events/:id] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not update event.' });
  }
});

// DELETE /events/:id - delete an event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${API_BASE_URL}&id=${encodeURIComponent(req.params.id)}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    res.status(204).send('');
  } catch (error: any) {
    console.error(`[DELETE /events/:id] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not delete event.' });
  }
});

export default router;