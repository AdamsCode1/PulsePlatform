import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const isNonEmptyString = (val: unknown): val is string => {
  return typeof val === 'string' && val.trim().length > 0;
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query, body } = req;
    const { id } = query;

    switch (method) {
      case 'GET':
        if (id) {
          // GET /api/societies?id=uuid - get specific society
          if (!isNonEmptyString(id)) {
            return res.status(400).json({ message: 'Valid society ID is required.' });
          }

          const { data, error } = await supabase
            .from('society')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              return res.status(404).json({ message: 'Society not found.' });
            }
            throw new Error(error.message);
          }
          return res.status(200).json(data);
        } else {
          // GET /api/societies - get all societies
          const { data, error } = await supabase
            .from('society')
            .select('*')
            .order('name', { ascending: true });

          if (error) throw new Error(error.message);
          return res.status(200).json(data);
        }

      case 'POST':
        // POST /api/societies - create new society
        const { name, contact_email, description, website_url, user_id } = body;

        if (!isNonEmptyString(name)) {
          return res.status(400).json({ message: 'Society name is required.' });
        }

        if (!isNonEmptyString(contact_email) || !isValidEmail(contact_email)) {
          return res.status(400).json({ message: 'Valid contact email is required.' });
        }

        const newSociety = {
          name: name.trim(),
          contact_email: contact_email.trim().toLowerCase(),
          description: description?.trim() || null,
          website_url: website_url?.trim() || null,
          user_id: user_id || null
        };

        const { data, error } = await supabase
          .from('society')
          .insert([newSociety])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ message: 'Society with this contact email already exists.' });
          }
          throw new Error(error.message);
        }
        return res.status(201).json(data);

      case 'PUT':
        // PUT /api/societies?id=uuid - update society
        if (!isNonEmptyString(id)) {
          return res.status(400).json({ message: 'Valid society ID is required.' });
        }

        const updates: any = {};
        const { name: updateName, contact_email: updateEmail, description: updateDesc, website_url: updateWebsite } = body;

        if (updateName !== undefined) {
          if (!isNonEmptyString(updateName)) {
            return res.status(400).json({ message: 'Society name cannot be empty.' });
          }
          updates.name = updateName.trim();
        }

        if (updateEmail !== undefined) {
          if (!isNonEmptyString(updateEmail) || !isValidEmail(updateEmail)) {
            return res.status(400).json({ message: 'Valid contact email is required.' });
          }
          updates.contact_email = updateEmail.trim().toLowerCase();
        }

        if (updateDesc !== undefined) {
          updates.description = updateDesc?.trim() || null;
        }

        if (updateWebsite !== undefined) {
          updates.website_url = updateWebsite?.trim() || null;
        }

        const { data: updatedData, error: updateError } = await supabase
          .from('society')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          if (updateError.code === 'PGRST116') {
            return res.status(404).json({ message: 'Society not found.' });
          }
          if (updateError.code === '23505') {
            return res.status(409).json({ message: 'Society with this contact email already exists.' });
          }
          throw new Error(updateError.message);
        }

        return res.status(200).json(updatedData);

      case 'DELETE':
        // DELETE /api/societies?id=uuid - delete society
        if (!isNonEmptyString(id)) {
          return res.status(400).json({ message: 'Valid society ID is required.' });
        }

        const { error: deleteError } = await supabase
          .from('society')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Societies API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
