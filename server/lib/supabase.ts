import { createClient } from '@supabase/supabase-js';

// Use environment variables for backend (Node.js)
const supabaseUrl = process.env.SUPABASE_URL;
// Temporarily use anon key instead of service role key due to typo in service key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
export const supabaseSchema = process.env.SUPABASE_SCHEMA || 'public';

console.log('Backend Supabase config:');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey?.length);
console.log('Schema:', supabaseSchema);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables for backend');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
