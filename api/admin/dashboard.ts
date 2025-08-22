import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHandler } from '../../lib/utils.js';

// This is a secure, server-side only file.

let supabaseAdmin: SupabaseClient | undefined;
function initSupabaseAdmin(req?: VercelRequest): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url) {
    throw new Error('Server configuration error: missing SUPABASE_URL');
  }
  if (serviceKey) {
    if (!supabaseAdmin) supabaseAdmin = createClient(url, serviceKey);
    return supabaseAdmin;
  }
  const token = req?.headers.authorization?.split('Bearer ')[1];
  if (!anonKey || !token) {
    throw new Error('Server configuration error: missing SUPABASE_SERVICE_ROLE_KEY and no anon+token fallback available');
  }
  return createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
}

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

// Handler for fetching dashboard chart data
const handleGetChartData = async (req: VercelRequest, res: VercelResponse) => {
  try {
  await requireAdmin(req);
  const client = initSupabaseAdmin(req);

    const days = req.query.days ? parseInt(req.query.days as string) : 7;

    // Since the RPC function doesn't exist, let's create a simple fallback
    // Get event submissions grouped by date for the last N days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

  const { data, error } = await client
      .from('event')
      .select('created_at')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chart data:', error);
      throw new Error(error.message);
    }

    // Group by date and count
    const dateGroups = (data || []).reduce((acc: Record<string, number>, event) => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Fill in missing dates with 0 counts
    const result: { submission_date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        submission_date: dateStr,
        count: dateGroups[dateStr] || 0
      });
    }

    return res.status(200).json(result);

  } catch (error: any) {
    const status = error?.message?.includes('Authentication') ? 403 : 500;
    return res.status(status).json({ message: error.message || 'Failed to fetch chart data' });
  }
};

// Export the handler, mapping methods to functions
export default createHandler({
  GET: handleGetChartData,
});
