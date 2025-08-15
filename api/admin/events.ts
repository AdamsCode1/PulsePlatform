import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHandler } from '../../lib/utils';

// This is a secure, server-side only file.
// It uses environment variables that are not exposed to the client.

// Create a Supabase client with the service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Function to verify the user is an admin
const requireAdmin = async (req: VercelRequest) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    throw new Error('Authentication token not provided.');
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new Error('Authentication failed.');
  }

  if (user.app_metadata?.role !== 'admin') {
    throw new Error('You must be an admin to perform this action.');
  }

  return user;
};

// Handler for fetching events with admin privileges
const handleGetEvents = async (req: VercelRequest, res: VercelResponse) => {
  try {
    // First, ensure the user is an admin
    const adminUser = await requireAdmin(req);

    const { page = '1', limit = '10', status, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build the query
    let query = supabaseAdmin
      .from('event')
      .select(`
        *,
        society:society_id(name, contact_email),
        rsvp_count:rsvp(count)
      `, { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    query = query
      .range(offset, offset + limitNum - 1)
      .order('created_at', { ascending: false });

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ message: 'Failed to fetch events', error: error.message });
    }

    // Log the action
    await supabaseAdmin.from('admin_activity_log').insert({
      admin_id: adminUser.id,
      admin_email: adminUser.email,
      action: 'view_events',
      target_entity: 'event',
      details: { page: pageNum, limit: limitNum, status, search },
    });

    return res.status(200).json({
      events: events || [],
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });

  } catch (error) {
    console.error('Error in handleGetEvents:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Handler for updating an event (e.g., changing its status)
const handleUpdateEvent = async (req: VercelRequest, res: VercelResponse) => {
  try {
    // First, ensure the user is an admin
    const adminUser = await requireAdmin(req);

    const { eventId, status, rejection_reason } = req.body;

    if (!eventId || !status) {
      return res.status(400).json({ message: 'Event ID and status are required.' });
    }

    const validStatus = ['approved', 'rejected', 'pending'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

  const updateData: { status: string; rejection_reason?: string } = { status };
  
  // Include rejection_reason if provided and status is rejected
  if (status === 'rejected' && rejection_reason) {
    updateData.rejection_reason = rejection_reason;
  }

    let { error } = await supabaseAdmin
      .from('event')
      .update(updateData)
      .eq('id', eventId);

    if (error) {
      console.error('Error updating event:', error);
      throw new Error(error.message);
    }

    // Log the admin activity
    if (status === 'approved' || status === 'rejected') {
        const { error: logError } = await supabaseAdmin.rpc('log_admin_activity', {
            action: `event.${status}`,
            target_entity: 'event',
            target_id: eventId,
      details: {
        rejection_reason: status === 'rejected' ? rejection_reason : undefined,
      }
        });

        if (logError) {
            // If logging fails, we should probably note it but not fail the whole request
            console.error('Failed to log admin activity:', logError);
        }
    }

  return res.status(200).json({ id: eventId, status, ...(status === 'rejected' ? { rejection_reason } : {}) });

  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

const handleDeleteEvent = async (req: any, res: any) => {
  try {
    const adminUser = await requireAdmin(req);

    const { eventId } = req.query;

    if (!eventId) {
      console.error('DELETE /admin/events: Missing eventId in query parameters');
      return res.status(400).json({ message: 'Event ID is required' });
    }

    console.log(`DELETE /admin/events: Attempting to delete event ${eventId}`);

    // First check if the event exists
    const { data: eventCheck, error: checkError } = await supabaseAdmin
      .from('event')
      .select('id, title, society_id')
      .eq('id', eventId)
      .single();

    if (checkError) {
      console.error('DELETE /admin/events: Error checking event existence:', checkError);
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Event not found' });
      }
      return res.status(500).json({ message: 'Database error checking event' });
    }

    if (!eventCheck) {
      console.log(`DELETE /admin/events: Event ${eventId} not found`);
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log(`DELETE /admin/events: Found event "${eventCheck.title}" (ID: ${eventId}), proceeding with deletion`);

    // Delete the event
    const { error: deleteError } = await supabaseAdmin
      .from('event')
      .delete()
      .eq('id', eventId);

    if (deleteError) {
      console.error('DELETE /admin/events: Error deleting event:', deleteError);
      return res.status(500).json({ message: 'Failed to delete event' });
    }

    console.log(`DELETE /admin/events: Successfully deleted event ${eventId}`);

    // Log admin activity (optional - if this fails, we don't fail the whole request)
    try {
      if (adminUser) {
        await supabaseAdmin.rpc('log_admin_activity', {
          admin_id: adminUser.id,
          action: 'delete_event',
          details: `Deleted event: ${eventCheck.title} (ID: ${eventId})`
        });
      }
    } catch (logError) {
      // If logging fails, we should probably note it but not fail the whole request
      console.error('Failed to log admin activity:', logError);
    }

    return res.status(200).json({ message: 'Event deleted successfully', eventId });

  } catch (error: any) {
    console.error('DELETE /admin/events: Unexpected error:', error);
    return res.status(403).json({ message: error.message });
  }
};

// Export the handler, mapping methods to functions
export default createHandler({
  GET: handleGetEvents,
  PATCH: handleUpdateEvent,
  DELETE: handleDeleteEvent,
});
