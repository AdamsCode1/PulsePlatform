import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For admin operations, we'll use the regular client but with proper admin authentication
// The admin will be authenticated normally, and RLS policies will handle admin permissions
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

// Regular client for normal operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
