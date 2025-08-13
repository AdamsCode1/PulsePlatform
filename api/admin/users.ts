import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHandler } from '../../lib/utils';

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

    const { role = 'all', status = 'all', search = '', page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    const rpcParams = {
      role_filter: role as string,
      status_filter: status as string,
      search_term: search as string,
    };

    // Fetch the data with pagination
    const { data, error } = await supabaseAdmin.rpc('get_all_users', rpcParams).range(from, to);

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error(error.message);
    }

    // Fetch the total count without pagination
    const { count, error: countError } = await supabaseAdmin.rpc('get_all_users', rpcParams, { count: 'exact', head: true });

    if (countError) {
        console.error('Error fetching user count:', countError);
        throw new Error(countError.message);
    }

    return res.status(200).json({ data, count });

  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

// Export the handler, mapping methods to functions
export default createHandler({
  GET: handleGetUsers,
});
