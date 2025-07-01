export interface Event {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  category?: string;
  society_id: string;
  created_at?: string;
  attendeeCount?: number;
  imageUrl?: string;
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
