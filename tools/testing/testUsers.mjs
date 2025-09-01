import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseClient = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function getAdminToken() {
  try {
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: 'admin@dupulse.co.uk',
      password: 'testpassword123'
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError);
      return;
    }
    
    if (signInData.session) {
      console.log('Admin token:', signInData.session.access_token);
      
      // Test the users endpoint
      const response = await fetch('http://localhost:4000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${signInData.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Users endpoint status:', response.status);
      const result = await response.text();
      console.log('Users response:', result);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

getAdminToken();
