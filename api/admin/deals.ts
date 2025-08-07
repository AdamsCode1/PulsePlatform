import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHandler } from '../_utils';

// This is a secure, server-side only file.

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

// Handler for updating a deal (e.g., changing its status)
// For now, let's assume deals have a 'status' field like events.
// I'll need to check the schema again to be sure.
// The schema has: title, description, discount_percentage, company_name, image_url, expires_at, category
// It does NOT have a status field. This is a problem.
// I will add a status field to the deals table in a new migration.
// For now, I will proceed as if it exists, and then add the migration.
// Let's assume the client will send a `dealId` and a `payload` of fields to update.

const handleUpdateDeal = async (req: VercelRequest, res: VercelResponse) => {
  try {
    await requireAdmin(req);

    const { dealId, payload } = req.body;

    if (!dealId || !payload) {
      return res.status(400).json({ message: 'Deal ID and payload are required.' });
    }

    const { data, error } = await supabaseAdmin
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

        const { data, error } = await supabaseAdmin
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

        const { error } = await supabaseAdmin
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
  POST: handleCreateDeal,
  PATCH: handleUpdateDeal,
  DELETE: handleDeleteDeal,
});
