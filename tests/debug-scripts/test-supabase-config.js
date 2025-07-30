// Test Supabase configuration and authentication
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase configuration...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey?.length);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConfig() {
  try {
    // Test 1: Basic connection
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase
      .from('society')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection error:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection working');
    
    // Test 2: Auth state
    console.log('\n2. Testing auth state...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session ? 'Active' : 'None');
    
    // Test 3: getUser call (this might be causing the API key error)
    console.log('\n3. Testing getUser() call...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ getUser error:', userError.message);
    } else {
      console.log('✅ getUser working, user:', user ? user.email : 'none');
    }
    
    console.log('\n✅ Supabase configuration appears to be working correctly');
    console.log('The issue is likely authentication-related or port mismatch');
    
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
}

testSupabaseConfig().then(() => {
  process.exit(0);
});
