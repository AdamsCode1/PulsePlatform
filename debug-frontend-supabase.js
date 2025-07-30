// Debug frontend environment variables and Supabase client
import { supabase } from './src/lib/supabaseClient.js';

console.log('=== Frontend Supabase Debug ===');
console.log('VITE_SUPABASE_URL:', import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY length:', (import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)?.length);

async function debugSupabase() {
  try {
    console.log('\n=== Testing Supabase Client ===');
    
    // Test 1: Basic query
    console.log('1. Testing basic query...');
    const { data, error } = await supabase
      .from('society')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Query error:', error.message);
    } else {
      console.log('✅ Query successful');
    }
    
    // Test 2: Auth getUser (this is likely failing)
    console.log('\n2. Testing auth.getUser()...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ getUser error:', userError.message);
      console.error('Error details:', userError);
    } else {
      console.log('✅ getUser successful, user:', user?.email || 'none');
    }
    
    // Test 3: Session
    console.log('\n3. Testing session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ getSession error:', sessionError.message);
    } else {
      console.log('✅ Session:', session ? 'exists' : 'none');
    }
    
  } catch (err) {
    console.error('❌ Debug error:', err);
  }
}

debugSupabase();
