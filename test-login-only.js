// Simple login test script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoginOnly() {
  console.log('Testing login with existing user...');
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'testsociety@durham.ac.uk',
      password: 'testpassword123',
    });
    
    if (authError) {
      console.log('❌ Login failed:', authError.message);
    } else {
      console.log('✅ Login successful!');
      console.log('User ID:', authData.user?.id);
      console.log('Email:', authData.user?.email);
      
      // Check if society record exists
      const { data: society, error: societyError } = await supabase
        .from('society')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
      
      if (societyError) {
        console.log('Society record not found:', societyError.message);
      } else {
        console.log('✅ Society record found:', society.name);
      }
      
      // Sign out
      await supabase.auth.signOut();
      console.log('✅ Signed out successfully');
    }
    
  } catch (err) {
    console.error('Test error:', err);
  }
}

testLoginOnly().then(() => {
  process.exit(0);
});
