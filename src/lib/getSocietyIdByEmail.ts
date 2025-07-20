import { supabase } from '@/lib/supabaseClient';

export async function getSocietyIdByEmail(email: string): Promise<string | null> {
  // Query the society table for the matching contact_email
  const { data, error } = await supabase
    .from('society')
    .select('id')
    .eq('contact_email', email)
    .single();
  if (error || !data) return null;
  return data.id;
}
