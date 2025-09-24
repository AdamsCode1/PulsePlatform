// src/lib/apiEvents.ts
// Modular API utility for all event operations using /api/unified endpoints

const API_BASE = '/api/unified?resource=events';

export async function fetchAllEvents(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}${query ? `&${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEventById(id: string) {
  const res = await fetch(`${API_BASE}&id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Event not found');
  return res.json();
}

export async function createEvent(event: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error('Failed to create event');
  return res.json();
}

export async function updateEvent(id: string, updates: any) {
  const res = await fetch(`${API_BASE}&id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update event');
  return res.json();
}

export async function deleteEvent(id: string) {
  const res = await fetch(`${API_BASE}&id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete event');
  return true;
}
