import { supabase } from '@/lib/supabaseClient';
import { API_BASE_URL } from '@/lib/apiConfig';

export async function getSocietyIdByEmail(email: string): Promise<string | null> {
  try {
    // Get session for API authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.log('No valid session for getSocietyIdByEmail');
      return null;
    }

    console.log('getSocietyIdByEmail called with email:', email);
    
    // Use unified API endpoint for consistent architecture
    const response = await fetch(`${API_BASE_URL}/unified?resource=societies`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch societies:', response.status, response.statusText, errorText);
      return null;
    }

    const societies = await response.json();
    const society = societies.find((s: any) => s.contact_email === email);
    
    console.log('Found society:', society);
    return society?.id || null;
  } catch (error) {
    console.error('Error getting society ID by email:', error);
    return null;
  }
}
