// Quick test script to debug login functionality
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('Testing login functionality...');
  
  try {
    // Test 1: Check if we can connect to database
    console.log('1. Testing database connection...');
    const { data: societies, error: societyError } = await supabase
      .from('society')
      .select('*')
      .limit(5);
    
    if (societyError) {
      console.error('Database connection error:', societyError);
      return;
    }
    
    console.log(`✅ Database connected. Found ${societies.length} societies.`);
    if (societies.length > 0) {
      console.log('Sample society:', societies[0]);
    }
    
    // Test 2: Try to login with a test account (if one exists)
    console.log('\n2. Testing login with sample credentials...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123',
    });
    
    if (authError) {
      console.log('Expected login error (no test user):', authError.message);
    } else {
      console.log('✅ Login successful:', authData.user?.email);
      
      // Sign out after test
      await supabase.auth.signOut();
    }
    
    // Test 3: Check auth state
    console.log('\n3. Checking auth configuration...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'Active' : 'None');
    
  } catch (err) {
    console.error('Test error:', err);
  }
}

testLogin().then(() => {
  console.log('\nTest completed.');
  process.exit(0);
});
