import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testAdminAuth() {
  try {
    // Try to sign in with admin credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@dupulse.co.uk',
      password: 'password' // Common test password
    });

    if (error) {
      console.error('Sign in error:', error);
      return;
    }

    if (data.session) {
      console.log('Admin token:', data.session.access_token);
      console.log('User role:', data.user?.app_metadata?.role);
      
      // Test the token with a simple API call
      const response = await fetch('http://localhost:4000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API test status:', response.status);
      if (response.ok) {
        console.log('Authentication successful!');
      } else {
        const result = await response.text();
        console.log('API error:', result);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminAuth();
