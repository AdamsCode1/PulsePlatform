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
