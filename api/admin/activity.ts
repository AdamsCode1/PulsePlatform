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
  if (!token) throw new Error('Authentication token not provided.');

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) throw new Error('Authentication failed.');

  // Check admin table for UID
  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from('admin')
    .select('uid')
    .eq('uid', user.id)
    .maybeSingle();
  if (adminError || !adminRow) {
    throw new Error('You must be an admin to perform this action.');
  }
  return user;
};

// Handler for fetching recent admin activity (fallback without admin_activity_log table)
const handleGetActivity = async (req: VercelRequest, res: VercelResponse) => {
  try {
    await requireAdmin(req);

    // Since admin_activity_log table doesn't exist, let's create a simple fallback
    // using recent events and their status changes as activity
    const { data: recentEvents, error: eventsError } = await supabaseAdmin
      .from('event')
      .select('id, name, status, created_at, updated_at, society:society_id(name)')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (eventsError) {
      console.error('Error fetching recent events:', eventsError);
      throw new Error(eventsError.message);
    }

    // Format as activity log entries
    const formatted = (recentEvents || []).map((event: any, index) => ({
      id: `event-${event.id}-${index}`,
      created_at: event.updated_at || event.created_at,
      action: `event.${event.status}`,
      target_entity: 'event',
      target_id: event.id,
      details: {
        eventName: event.name,
        societyName: event.society?.name
      },
      user_email: 'Admin User', // Fallback since we don't track who made the change
    }));

    return res.status(200).json(formatted);
  } catch (error: any) {
    const status = error?.message?.includes('Authentication') ? 403 : 500;
    return res.status(status).json({ message: error.message || 'Failed to fetch admin activity' });
  }
};

// Export the handler, mapping methods to functions
export default createHandler({
  GET: handleGetActivity,
});
