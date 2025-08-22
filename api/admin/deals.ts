import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHandler } from '../../lib/utils.js';

// This is a secure, server-side only file.

// Create a Supabase client with the service role key to bypass RLS
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

// Handler for fetching all deals (admin-only)
const handleGetDeals = async (req: VercelRequest, res: VercelResponse) => {
  try {
    await requireAdmin(req);

  const client = initSupabaseAdmin(req);
  const { data: deals, error } = await client
      .from('deals')
      .select(`
        *,
        partner:partner_id(name, contact_email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals:', error);
      throw new Error(error.message);
    }

    return res.status(200).json({ deals });

  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

// Handler for updating a deal (e.g., changing its status)
const handleUpdateDeal = async (req: VercelRequest, res: VercelResponse) => {
  try {
    await requireAdmin(req);

    const { dealId, payload } = req.body;

    if (!dealId || !payload) {
      return res.status(400).json({ message: 'Deal ID and payload are required.' });
    }

  const client = initSupabaseAdmin(req);
  const { data, error } = await client
      .from('deals')
      .update(payload)
      .eq('id', dealId)
      .select()
      .single();

    if (error) {
      console.error('Error updating deal:', error);
      throw new Error(error.message);
    }

    return res.status(200).json(data);

  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

// I will also need handlers for creating and deleting deals.
const handleCreateDeal = async (req: VercelRequest, res: VercelResponse) => {
    try {
        await requireAdmin(req);
        const dealData = req.body;

  const client = initSupabaseAdmin(req);
  const { data, error } = await client
            .from('deals')
            .insert(dealData)
            .select()
            .single();

        if (error) {
            console.error('Error creating deal:', error);
            throw new Error(error.message);
        }

        return res.status(201).json(data);
    } catch (error: any) {
        return res.status(403).json({ message: error.message });
    }
};

const handleDeleteDeal = async (req: VercelRequest, res: VercelResponse) => {
    try {
        await requireAdmin(req);
        const { dealId } = req.body;

        if (!dealId) {
            return res.status(400).json({ message: 'Deal ID is required.' });
        }

  const client = initSupabaseAdmin(req);
  const { error } = await client
            .from('deals')
            .delete()
            .eq('id', dealId);

        if (error) {
            console.error('Error deleting deal:', error);
            throw new Error(error.message);
        }

        return res.status(200).json({ message: 'Deal deleted successfully.' });
    } catch (error: any) {
        return res.status(403).json({ message: error.message });
    }
};


// Export the handler, mapping methods to functions
export default createHandler({
  GET: handleGetDeals,
  POST: handleCreateDeal,
  PUT: handleUpdateDeal,
  DELETE: handleDeleteDeal,
});
