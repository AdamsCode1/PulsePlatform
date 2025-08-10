import { createClient } from '@supabase/supabase-js';

// Use environment variables for backend (Node.js)
const supabaseUrlRaw = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKeyRaw = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
export const supabaseSchema = process.env.SUPABASE_SCHEMA || 'public';

const supabaseUrl = supabaseUrlRaw.trim();
const supabaseKey = supabaseKeyRaw.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables for backend');
}

// Validate URL early to provide clearer error
try {
  // eslint-disable-next-line no-new
  new URL(supabaseUrl);
} catch {
  throw new Error(`Invalid SUPABASE_URL provided: ${supabaseUrl}`);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
