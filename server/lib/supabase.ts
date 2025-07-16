import { createClient } from '@supabase/supabase-js';

// Use environment variables for backend (Node.js)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseSchema = process.env.SUPABASE_SCHEMA || 'public';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables for backend');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
