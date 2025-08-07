import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHandler } from '../_utils';

// This is a secure, server-side only file.

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const requireAdmin = async (req: VercelRequest) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) throw new Error('Authentication token not provided.');

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) throw new Error('Authentication failed.');

  if (user.app_metadata?.role !== 'admin') {
    throw new Error('You must be an admin to perform this action.');
  }

  return user;
};

// Handler for fetching all users
const handleGetUsers = async (req: VercelRequest, res: VercelResponse) => {
  try {
    await requireAdmin(req);

    // Call the database function to get the unified user list
    const { data, error } = await supabaseAdmin.rpc('get_all_users');

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error(error.message);
    }

    return res.status(200).json(data);

  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

// Export the handler, mapping methods to functions
export default createHandler({
  GET: handleGetUsers,
});
