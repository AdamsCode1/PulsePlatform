import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars: string[] = []
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')
  const message = `Missing Supabase environment variables: ${missingVars.join(', ')}`
  console.error(message)
  throw new Error(message)
}

// Ensure a single Supabase client instance across HMR reloads to avoid
// multiple GoTrueClient warnings and token/storage races.
declare global {
  // eslint-disable-next-line no-var
  var __SUPABASE_CLIENT__: SupabaseClient | undefined
}

const client = globalThis.__SUPABASE_CLIENT__ ?? createClient(supabaseUrl, supabaseAnonKey)
if (import.meta.env.DEV) {
  globalThis.__SUPABASE_CLIENT__ = client
}

export const supabase = client
