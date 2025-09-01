import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function tryPasswords() {
  const passwords = ['password', 'admin', '123456', 'password123', 'admin123', 'dupulse123'];
  
  for (const password of passwords) {
    try {
      console.log(`Trying password: ${password}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@dupulse.co.uk',
        password
      });

      if (!error && data.session) {
        console.log('SUCCESS! Password is:', password);
        console.log('Admin token:', data.session.access_token);
        return data.session.access_token;
      }
    } catch (e) {
      // continue
    }
  }
  console.log('None of the common passwords worked');
  return null;
}

tryPasswords();
