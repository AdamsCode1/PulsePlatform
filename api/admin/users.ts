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

// Fallback function for getting users when RPC is not available
const getAllUsersFallback = async (roleFilter: string, statusFilter: string, searchTerm: string) => {
  const users: Array<{
    id: any;
    user_id: any;
    email: any;
    first_name: any;
    last_name: any;
    role: string;
    status: string;
    created_at: any;
  }> = [];

  // Get students
  if (roleFilter === 'all' || roleFilter === 'student') {
    let studentQuery = supabaseAdmin
      .from('student')
      .select('*, user_id');

    if (searchTerm) {
      studentQuery = studentQuery.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const { data: students, error: studentsError } = await studentQuery;
    
    if (!studentsError && students) {
      students.forEach(student => {
        users.push({
          id: student.id,
          user_id: student.user_id,
          email: student.email,
          first_name: student.first_name,
          last_name: student.last_name,
          role: 'student',
          status: 'active',
          created_at: student.created_at
        });
      });
    }
  }

  // Get societies
  if (roleFilter === 'all' || roleFilter === 'society') {
    let societyQuery = supabaseAdmin
      .from('society')
      .select('*, user_id');

    if (searchTerm) {
      societyQuery = societyQuery.or(`name.ilike.%${searchTerm}%,contact_email.ilike.%${searchTerm}%`);
    }

    const { data: societies, error: societiesError } = await societyQuery;
    
    if (!societiesError && societies) {
      societies.forEach(society => {
        users.push({
          id: society.id,
          user_id: society.user_id,
          email: society.contact_email,
          first_name: society.name,
          last_name: null,
          role: 'society',
          status: 'active',
          created_at: society.created_at
        });
      });
    }
  }

  // Get admins
  if (roleFilter === 'all' || roleFilter === 'admin') {
    let adminQuery = supabaseAdmin
      .from('admin')
      .select('*');

    if (searchTerm) {
      adminQuery = adminQuery.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
    }

    const { data: admins, error: adminsError } = await adminQuery;
    
    if (!adminsError && admins) {
      admins.forEach(admin => {
        users.push({
          id: admin.id,
          user_id: admin.user_id,
          email: admin.email,
          first_name: admin.first_name,
          last_name: admin.last_name,
          role: 'admin',
          status: 'active',
          created_at: admin.created_at
        });
      });
    }
  }

  // Sort by created_at desc
  users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return users;
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

    // Try the RPC function first
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_all_users', rpcParams).range(from, to);
    
    if (!rpcError && rpcData) {
      // Get count using RPC
      const { count, error: countError } = await supabaseAdmin.rpc('get_all_users', rpcParams, { count: 'exact', head: true });
      if (countError) {
        console.error('Error fetching user count:', countError);
        throw new Error(countError.message);
      }
      return res.status(200).json({ data: rpcData, count });
    }

    console.log('RPC function not available, using fallback approach');

    // Fallback: get all users and apply pagination manually
    const allUsers = await getAllUsersFallback(role as string, status as string, search as string);
    
    // Apply pagination
    const data = allUsers.slice(from, to + 1);
    const count = allUsers.length;

    return res.status(200).json({ data, count });

  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

// Export the handler, mapping methods to functions
export default createHandler({
  GET: handleGetUsers,
});
