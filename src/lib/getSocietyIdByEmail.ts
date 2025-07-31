import { supabase } from '@/lib/supabaseClient';

export async function getSocietyIdByEmail(email: string): Promise<string | null> {
  try {
    console.log('getSocietyIdByEmail called with email:', email);
    
    // Use direct Supabase call instead of API
    const { data: societies, error } = await supabase
      .from('society')
      .select('*')
      .eq('contact_email', email);

    if (error) {
      console.error('Failed to fetch society by email:', error);
      return null;
    }

    if (!societies || societies.length === 0) {
      console.log('No society found with email:', email);
      return null;
    }

    const society = societies[0]; // Get the first matching society
    console.log('Found society:', society);
    return society?.id || null;
  } catch (error) {
    console.error('Error getting society ID by email:', error);
    return null;
  }
}
