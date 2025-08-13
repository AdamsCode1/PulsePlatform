import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

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

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && val.trim().length > 0;
const parseAndValidateUTCDate = (val: unknown): string | null => {
  if (typeof val !== 'string') return null;
  const date = new Date(val);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query, body } = req;
    const { date, id } = query;

    switch (method) {
      case 'GET':
        if (date) {
          // GET /api/events?date=YYYY-MM-DD - get events by date
          if (!isNonEmptyString(date)) {
            return res.status(400).json({ message: 'Valid date parameter is required.' });
          }

          const startOfDay = new Date(`${date}T00:00:00.000Z`).toISOString();
          const endOfDay = new Date(`${date}T23:59:59.999Z`).toISOString();

          const { data, error } = await supabase
            .from('event')
            .select(`
              *,
              society:society_id (
                id,
                name,
                contact_email
              )
            `)
            .eq('status', 'approved')
            .gte('start_time', startOfDay)
            .lte('start_time', endOfDay)
            .order('start_time', { ascending: true });

          if (error) throw new Error(error.message);
          return res.status(200).json(data);
        } else if (id) {
          // GET /api/events?id=uuid - get specific event
          if (!isNonEmptyString(id)) {
            return res.status(400).json({ message: 'Valid event ID is required.' });
          }

          const { data, error } = await supabase
            .from('event')
            .select(`
              *,
              society:society_id (
                id,
                name,
                contact_email
              )
            `)
            .eq('id', id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              return res.status(404).json({ message: 'Event not found.' });
            }
            throw new Error(error.message);
          }
          return res.status(200).json(data);
        } else {
          // GET /api/events - get all approved events
          const { data, error } = await supabase
            .from('event')
            .select(`
              *,
              society:society_id (
                id,
                name,
                contact_email
              )
            `)
            .eq('status', 'approved')
            .order('start_time', { ascending: true });

          if (error) throw new Error(error.message);
          return res.status(200).json(data);
        }

      case 'POST':
        // POST /api/events - create new event
        const { name, description, start_time, end_time, location, category, society_id, signup_link, image_url } = body;

        if (!isNonEmptyString(name) || !isNonEmptyString(location) || !isNonEmptyString(society_id)) {
          return res.status(400).json({ message: 'Name, location, and society_id are required.' });
        }

        const validStartTime = parseAndValidateUTCDate(start_time);
        const validEndTime = parseAndValidateUTCDate(end_time);

        if (!validStartTime || !validEndTime) {
          return res.status(400).json({ message: 'Valid start_time and end_time are required in ISO 8601 format.' });
        }

        if (new Date(validStartTime) >= new Date(validEndTime)) {
          return res.status(400).json({ message: 'start_time must be before end_time.' });
        }

        // Verify society exists
        const { data: societyData, error: societyError } = await supabase
          .from('society')
          .select('id')
          .eq('id', society_id)
          .single();

        if (societyError || !societyData) {
          return res.status(400).json({ message: 'Invalid society_id.' });
        }

        const newEvent = {
          name: name.trim(),
          description: description?.trim() || null,
          start_time: validStartTime,
          end_time: validEndTime,
          location: location.trim(),
          category: category?.trim() || null,
          society_id,
          signup_link: signup_link?.trim() || null,
          image_url: image_url?.trim() || null,
          status: 'pending' as const,
          attendee_count: 0
        };

        const { data, error } = await supabase
          .from('event')
          .insert([newEvent])
          .select()
          .single();

        if (error) throw new Error(error.message);
        return res.status(201).json(data);

      case 'PUT':
        // PUT /api/events?id=uuid - update event
        if (!isNonEmptyString(id)) {
          return res.status(400).json({ message: 'Valid event ID is required.' });
        }

        const updates: Partial<Event> = {};
        const { name: updateName, description: updateDesc, start_time: updateStart, end_time: updateEnd, 
                location: updateLocation, category: updateCategory, signup_link: updateSignup, 
                image_url: updateImage, status: updateStatus } = body;

        if (updateName !== undefined) {
          if (!isNonEmptyString(updateName)) {
            return res.status(400).json({ message: 'Name cannot be empty.' });
          }
          updates.name = updateName.trim();
        }

        if (updateDesc !== undefined) {
          updates.description = updateDesc?.trim() || null;
        }

        if (updateStart !== undefined) {
          const validStart = parseAndValidateUTCDate(updateStart);
          if (!validStart) {
            return res.status(400).json({ message: 'Invalid start_time format.' });
          }
          updates.start_time = validStart;
        }

        if (updateEnd !== undefined) {
          const validEnd = parseAndValidateUTCDate(updateEnd);
          if (!validEnd) {
            return res.status(400).json({ message: 'Invalid end_time format.' });
          }
          updates.end_time = validEnd;
        }

        if (updateLocation !== undefined) {
          if (!isNonEmptyString(updateLocation)) {
            return res.status(400).json({ message: 'Location cannot be empty.' });
          }
          updates.location = updateLocation.trim();
        }

        if (updateCategory !== undefined) {
          updates.category = updateCategory?.trim() || null;
        }

        if (updateSignup !== undefined) {
          updates.signup_link = updateSignup?.trim() || null;
        }

        if (updateImage !== undefined) {
          updates.image_url = updateImage?.trim() || null;
        }

        if (updateStatus !== undefined) {
          if (!['pending', 'approved', 'rejected'].includes(updateStatus)) {
            return res.status(400).json({ message: 'Invalid status value.' });
          }
          updates.status = updateStatus;
        }

        // Validate start_time < end_time if both are being updated
        if (updates.start_time && updates.end_time) {
          if (new Date(updates.start_time) >= new Date(updates.end_time)) {
            return res.status(400).json({ message: 'start_time must be before end_time.' });
          }
        }

        updates.updated_at = new Date().toISOString();

        const { data: updatedData, error: updateError } = await supabase
          .from('event')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          if (updateError.code === 'PGRST116') {
            return res.status(404).json({ message: 'Event not found.' });
          }
          throw new Error(updateError.message);
        }

        return res.status(200).json(updatedData);

      case 'DELETE':
        // DELETE /api/events?id=uuid - delete event
        if (!isNonEmptyString(id)) {
          return res.status(400).json({ message: 'Valid event ID is required.' });
        }

        const { error: deleteError } = await supabase
          .from('event')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Events API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
