import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../_utils';
import { supabase, supabaseSchema } from '../_supabase';

// Event type matching Supabase schema
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

// GET /api/events/by-date
const handleGetEventsByDate = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'events' : `${supabaseSchema}.events`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('status', 'approved')
      .order('start_time', { ascending: true });
    
    if (error) throw new Error(error.message);
    
    // Group events by date
    const eventsByDate: { [date: string]: Event[] } = {};
    data.forEach((event: Event) => {
      const date = new Date(event.start_time).toISOString().split('T')[0];
      if (!eventsByDate[date]) {
        eventsByDate[date] = [];
      }
      eventsByDate[date].push(event);
    });
    
    res.status(200).json(eventsByDate);
  } catch (error: any) {
    console.error('[GET /api/events/by-date] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve events by date.' });
  }
};

export default createHandler({
  GET: handleGetEventsByDate
});
