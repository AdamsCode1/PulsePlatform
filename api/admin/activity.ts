import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHandler } from '../../lib/utils.js';

// This is a secure, server-side only file.
// It uses environment variables that are not exposed to the client.

// Create a Supabase client with the service role key to bypass RLS
let supabaseAdmin: SupabaseClient | undefined;
function initSupabaseAdmin(req?: VercelRequest): SupabaseClient {
  // Prefer a cached admin client when service role is configured
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url) {
    throw new Error('Server configuration error: missing SUPABASE_URL');
  }

  if (serviceKey) {
    if (!supabaseAdmin) {
      supabaseAdmin = createClient(url, serviceKey);
    }
    return supabaseAdmin;
  }

  // Fallback: use anon key with the caller's Bearer token so RLS applies
  const token = req?.headers.authorization?.split('Bearer ')[1];
  if (!anonKey || !token) {
    throw new Error('Server configuration error: missing SUPABASE_SERVICE_ROLE_KEY and no anon+token fallback available');
  }
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

// Function to verify the user is an admin
const requireAdmin = async (req: VercelRequest) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) throw new Error('Authentication token not provided.');

  const client = initSupabaseAdmin(req);
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) throw new Error('Authentication failed.');

  // Check admin table for UID
  const { data: adminRow, error: adminError } = await client
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
  const client = initSupabaseAdmin(req);

    // Since admin_activity_log table doesn't exist, let's create a simple fallback
    // using recent events and their status changes as activity
  const { data: recentEvents, error: eventsError } = await client
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
