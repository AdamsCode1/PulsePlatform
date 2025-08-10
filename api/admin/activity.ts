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

// Handler for fetching recent admin activity (no join; resolve emails via Admin API)
const handleGetActivity = async (req: VercelRequest, res: VercelResponse) => {
  try {
    await requireAdmin(req);

    const { data: logs, error: logsError } = await supabaseAdmin
      .from('admin_activity_log')
      .select('id,created_at,action,target_entity,target_id,details,user_id')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('Error fetching admin activity:', logsError);
      throw new Error(logsError.message);
    }

    const userIds = Array.from(
      new Set((logs || []).map((l: any) => l.user_id).filter(Boolean))
    ) as string[];

    const emailsById = new Map<string, string>();
    if (userIds.length > 0) {
      await Promise.all(
        userIds.map(async (id) => {
          try {
            const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
            if (!error && data?.user) {
              emailsById.set(id, (data.user.email as string) || 'Unknown User');
            }
          } catch (e) {
            // Best-effort; ignore individual failures
            console.warn('Lookup user email failed for id', id, e);
          }
        })
      );
    }

    const formatted = (logs || []).map((log: any) => ({
      id: log.id,
      created_at: log.created_at,
      action: log.action,
      target_entity: log.target_entity,
      target_id: log.target_id,
      details: log.details,
      user_email: (log.user_id && emailsById.get(log.user_id)) || 'Unknown User',
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
