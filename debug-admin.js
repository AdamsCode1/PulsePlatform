// Debug script to test admin authentication
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testAdminAuth() {
  const adminUID = 'f3082732-e62f-4a02-9f6a-ae16d62936d0';
  
  console.log('Testing admin authentication for UID:', adminUID);
  
  try {
    // Test direct admin table query
    const { data: adminData, error } = await supabase
      .from('admin')
      .select('uid')
      .eq('uid', adminUID)
      .single();
    
    console.log('Admin query result:');
    console.log('Data:', adminData);
    console.log('Error:', error);
    
    // Test with maybeSingle()
    const { data: adminData2, error: error2 } = await supabase
      .from('admin')
      .select('uid')
      .eq('uid', adminUID)
      .maybeSingle();
    
    console.log('Admin query with maybeSingle():');
    console.log('Data:', adminData2);
    console.log('Error:', error2);
    
    // Test student table (should be null)
    const { data: studentData, error: studentError } = await supabase
      .from('student')
      .select('id')
      .eq('user_id', adminUID)
      .single();
    
    console.log('Student table query (should fail):');
    console.log('Data:', studentData);
    console.log('Error:', studentError);
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testAdminAuth();
