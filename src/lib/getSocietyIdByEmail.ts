import { supabase } from '@/lib/supabaseClient';
import apiConfig from '@/lib/apiConfig';

export async function getSocietyIdByEmail(email: string): Promise<string | null> {
  try {
    // First, get the current user's session for API authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.log('No valid session for getSocietyIdByEmail');
      return null;
    }

    // Use API endpoint instead of direct Supabase query to respect RLS
    const response = await fetch(`${apiConfig.baseUrl}/societies`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch societies:', response.status, response.statusText);
      return null;
    }

    const societies = await response.json();
    const society = societies.find((s: any) => s.contact_email === email);
    return society?.id || null;
  } catch (error) {
    console.error('Error getting society ID by email:', error);
    return null;
  }
}
