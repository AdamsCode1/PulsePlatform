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

// Helper functions
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isNonEmptyString = (val: unknown): val is string => {
  return typeof val === 'string' && val.trim().length > 0;
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
          // GET /api/users?id=uuid - get specific user
          if (!isNonEmptyString(id)) {
            return res.status(400).json({ message: 'Valid user ID is required.' });
          }

          const { data, error } = await supabase
            .from('student')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              return res.status(404).json({ message: 'User not found.' });
            }
            throw new Error(error.message);
          }
          return res.status(200).json(data);
        } else {
          // GET /api/users - get all users (students for now)
          const { data, error } = await supabase
            .from('student')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw new Error(error.message);
          return res.status(200).json(data);
        }

      case 'POST':
        // POST /api/users - create new user (student)
        const { email, first_name, last_name, user_id } = body;

        console.log('[API/students] Incoming registration body:', body);

        if (!isNonEmptyString(email) || !isValidEmail(email)) {
          return res.status(400).json({ message: 'Valid email is required.' });
        }

        if (!isNonEmptyString(first_name)) {
          return res.status(400).json({ message: 'First name is required.' });
        }

        const newUser = {
          email: email.trim().toLowerCase(),
          first_name: first_name.trim(),
          last_name: last_name?.trim() || null,
          user_id: user_id || null
        };

        console.log('[API/students] Attempting to insert:', newUser);

        const { data, error } = await supabase
          .from('student')
          .insert([newUser])
          .select()
          .single();

        if (error) {
          console.error('[API/students] Supabase insert error:', error);
          if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ message: 'User with this email already exists.' });
          }
          return res.status(500).json({ message: error.message || 'Unknown error', details: error });
        }
        return res.status(201).json(data);

      case 'PUT':
        // PUT /api/users?id=uuid - update user
        if (!isNonEmptyString(id)) {
          return res.status(400).json({ message: 'Valid user ID is required.' });
        }

        const updates: any = {};
        const { email: updateEmail, first_name: updateFirstName, last_name: updateLastName } = body;

        if (updateEmail !== undefined) {
          if (!isNonEmptyString(updateEmail) || !isValidEmail(updateEmail)) {
            return res.status(400).json({ message: 'Valid email is required.' });
          }
          updates.email = updateEmail.trim().toLowerCase();
        }

        if (updateFirstName !== undefined) {
          if (!isNonEmptyString(updateFirstName)) {
            return res.status(400).json({ message: 'First name cannot be empty.' });
          }
          updates.first_name = updateFirstName.trim();
        }

        if (updateLastName !== undefined) {
          updates.last_name = updateLastName?.trim() || null;
        }

        const { data: updatedData, error: updateError } = await supabase
          .from('student')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          if (updateError.code === 'PGRST116') {
            return res.status(404).json({ message: 'User not found.' });
          }
          if (updateError.code === '23505') {
            return res.status(409).json({ message: 'User with this email already exists.' });
          }
          throw new Error(updateError.message);
        }

        return res.status(200).json(updatedData);

      case 'DELETE':
        // DELETE /api/users?id=uuid - delete user
        if (!isNonEmptyString(id)) {
          return res.status(400).json({ message: 'Valid user ID is required.' });
        }

        const { error: deleteError } = await supabase
          .from('student')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Users API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
