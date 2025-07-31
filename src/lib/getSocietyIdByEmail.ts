import { supabase } from '@/lib/supabaseClient';
import { API_BASE_URL } from '@/lib/apiConfig';

export async function getSocietyIdByEmail(email: string): Promise<string | null> {
  try {
    // Use direct Supabase query instead of API for now to avoid 500 errors
    console.log('getSocietyIdByEmail called with email:', email);
    
    const { data, error } = await supabase
      .from('society')
      .select('id, contact_email')
      .eq('contact_email', email)
      .single();

    console.log('Direct Supabase query result:', { data, error });

    if (error) {
      console.error('Supabase error in getSocietyIdByEmail:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error getting society ID by email:', error);
    return null;
  }
}
