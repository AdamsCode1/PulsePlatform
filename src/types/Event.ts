export interface Event {
  id: string;
  eventName: string;
  date: string;
  location: string;
  category?: string;
  description?: string;
  organiserID: string;
  societyName: string;
  time?: string;
  endTime?: string;
  attendeeCount?: number;
  imageUrl?: string;
  requiresOrganizerSignup?: boolean;
  organizerEmail?: string;
  signup_link?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rsvp_cutoff?: string | null; // Added RSVP cutoff property
  parentEventId?: string | null; // For recurring occurrences
  isRecurring?: boolean; // True if this is an occurrence of a recurring event
  recurrenceRule?: string | null; // RRULE string for display
}

export interface User {
  id: string;
  userName: string;
  userEmail: string;
}

export interface RSVP {
  id: string;
  user_id: string;
  event_id: string;
}
