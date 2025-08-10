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

// Handler for fetching recent admin activity
const handleGetActivity = async (req: VercelRequest, res: VercelResponse) => {
  try {
    await requireAdmin(req);

    const { data, error } = await supabaseAdmin
      .from('admin_activity_log')
      .select(`
        id,
        created_at,
        action,
        target_entity,
        target_id,
        details,
        user:users (
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching admin activity:', error);
      throw new Error(error.message);
    }

    // The user column might be null if the user was deleted, so we need to handle that
    // Also, the join returns an object, so we want to flatten it
    const formattedData = data.map(log => ({
        ...log,
        user_email: log.user ? log.user.email : 'Unknown User'
    }));


    return res.status(200).json(formattedData);

  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

// Export the handler, mapping methods to functions
export default createHandler({
  GET: handleGetActivity,
});
