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

const isNonEmptyString = (val: unknown): val is string => {
  return typeof val === 'string' && val.trim().length > 0;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query, body } = req;
    const { id, event_id, student_id } = query;

    switch (method) {
      case 'GET':
        if (event_id) {
          // GET /api/rsvps?event_id=uuid - get all RSVPs for an event
          if (!isNonEmptyString(event_id)) {
            return res.status(400).json({ message: 'Valid event ID is required.' });
          }

          const { data, error } = await supabase
            .from('rsvp')
            .select(`
              *,
              student:student_id (
                id,
                email,
                first_name,
                last_name
              ),
              event:event_id (
                id,
                name,
                start_time,
                location
              )
            `)
            .eq('event_id', event_id)
            .order('created_at', { ascending: false });

          if (error) throw new Error(error.message);
          return res.status(200).json(data);
        } else if (student_id) {
          // GET /api/rsvps?student_id=uuid - get all RSVPs for a student
          if (!isNonEmptyString(student_id)) {
            return res.status(400).json({ message: 'Valid student ID is required.' });
          }

          const { data, error } = await supabase
            .from('rsvp')
            .select(`
              *,
              student:student_id (
                id,
                email,
                first_name,
                last_name
              ),
              event:event_id (
                id,
                name,
                start_time,
                location,
                society:society_id (
                  id,
                  name
                )
              )
            `)
            .eq('student_id', student_id)
            .order('created_at', { ascending: false });

          if (error) throw new Error(error.message);
          return res.status(200).json(data);
        } else if (id) {
          // GET /api/rsvps?id=uuid - get specific RSVP
          if (!isNonEmptyString(id)) {
            return res.status(400).json({ message: 'Valid RSVP ID is required.' });
          }

          const { data, error } = await supabase
            .from('rsvp')
            .select(`
              *,
              student:student_id (
                id,
                email,
                first_name,
                last_name
              ),
              event:event_id (
                id,
                name,
                start_time,
                location
              )
            `)
            .eq('id', id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              return res.status(404).json({ message: 'RSVP not found.' });
            }
            throw new Error(error.message);
          }
          return res.status(200).json(data);
        } else {
          // GET /api/rsvps - get all RSVPs
          const { data, error } = await supabase
            .from('rsvp')
            .select(`
              *,
              student:student_id (
                id,
                email,
                first_name,
                last_name
              ),
              event:event_id (
                id,
                name,
                start_time,
                location
              )
            `)
            .order('created_at', { ascending: false });

          if (error) throw new Error(error.message);
          return res.status(200).json(data);
        }

      case 'POST':
        // POST /api/rsvps - create new RSVP
        const { event_id: newEventId, student_id: newStudentId, status = 'attending' } = body;

        if (!isNonEmptyString(newEventId)) {
          return res.status(400).json({ message: 'Event ID is required.' });
        }

        if (!isNonEmptyString(newStudentId)) {
          return res.status(400).json({ message: 'Student ID is required.' });
        }

        if (!['attending', 'not_attending', 'maybe'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status. Must be attending, not_attending, or maybe.' });
        }

        // Verify event exists
        const { data: eventData, error: eventError } = await supabase
          .from('event')
          .select('id')
          .eq('id', newEventId)
          .single();

        if (eventError || !eventData) {
          return res.status(400).json({ message: 'Invalid event ID.' });
        }

        // Verify student exists
        const { data: studentData, error: studentError } = await supabase
          .from('student')
          .select('id')
          .eq('id', newStudentId)
          .single();

        if (studentError || !studentData) {
          return res.status(400).json({ message: 'Invalid student ID.' });
        }

        const newRSVP = {
          event_id: newEventId,
          student_id: newStudentId,
          status
        };

        const { data, error } = await supabase
          .from('rsvp')
          .insert([newRSVP])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ message: 'RSVP already exists for this event and student.' });
          }
          throw new Error(error.message);
        }
        return res.status(201).json(data);

      case 'PUT':
        // PUT /api/rsvps?id=uuid - update RSVP
        if (!isNonEmptyString(id)) {
          return res.status(400).json({ message: 'Valid RSVP ID is required.' });
        }

        const { status: updateStatus } = body;

        if (!updateStatus || !['attending', 'not_attending', 'maybe'].includes(updateStatus)) {
          return res.status(400).json({ message: 'Valid status is required. Must be attending, not_attending, or maybe.' });
        }

        const { data: updatedData, error: updateError } = await supabase
          .from('rsvp')
          .update({ status: updateStatus })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          if (updateError.code === 'PGRST116') {
            return res.status(404).json({ message: 'RSVP not found.' });
          }
          throw new Error(updateError.message);
        }

        return res.status(200).json(updatedData);

      case 'DELETE':
        // DELETE /api/rsvps?id=uuid - delete RSVP
        if (!isNonEmptyString(id)) {
          return res.status(400).json({ message: 'Valid RSVP ID is required.' });
        }

        const { error: deleteError } = await supabase
          .from('rsvp')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('RSVPs API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
