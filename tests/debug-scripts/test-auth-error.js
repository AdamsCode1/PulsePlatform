// Simple test for the exact error in EventSubmissionPage
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing the exact same calls as EventSubmissionPage...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey?.length);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEventSubmissionAuth() {
  try {
    console.log('\n=== Simulating EventSubmissionPage Auth Check ===');
    
    // This is the exact call from EventSubmissionPage that might be failing
    console.log('1. Testing supabase.auth.getUser()...');
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ AUTH ERROR (this is likely your issue):');
      console.error('Message:', error.message);
      console.error('Code:', error.status);
      console.error('Full error:', error);
      
      if (error.message.includes('Invalid API key') || error.message.includes('invalid_api_key')) {
        console.log('\n🔍 DIAGNOSIS: Invalid API Key Error');
        console.log('This usually means:');
        console.log('1. Environment variables not loaded in browser');
        console.log('2. Anon key is incorrect or expired');
        console.log('3. Supabase project URL mismatch');
        console.log('4. CORS issues');
      }
    } else {
      console.log('✅ getUser() successful');
      console.log('User:', user ? user.email : 'No user logged in');
    }
    
    // Test basic query to see if basic Supabase works
    console.log('\n2. Testing basic database query...');
    const { data, error: queryError } = await supabase
      .from('society')
      .select('id')
      .limit(1);
    
    if (queryError) {
      console.error('❌ Database query error:', queryError.message);
    } else {
      console.log('✅ Database query works');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testEventSubmissionAuth().then(() => {
  console.log('\n=== Test Complete ===');
  process.exit(0);
});
