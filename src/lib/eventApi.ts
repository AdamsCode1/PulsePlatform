// Utility to fetch events from backend
import { Event } from '../types/Event';

export async function fetchEventsByDate(date: Date): Promise<Event[]> {
  const isoDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const res = await fetch(`/api/events/by-date?date=${isoDate}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEventById(id: string): Promise<Event | null> {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) return null;
  return res.json();
}
