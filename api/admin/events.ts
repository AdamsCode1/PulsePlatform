import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHandler } from '../_utils';

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

  const updateData: { status: string } = { status };
  // NEVER include rejection_reason since the column doesn't exist in the database

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

// Export the handler, mapping methods to functions
export default createHandler({
  PATCH: handleUpdateEvent,
});
