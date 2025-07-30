// Quick test script to debug society registration
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRegistration() {
  console.log('Testing society registration...');
  
  try {
    // Test 1: Check auth signup
    console.log('1. Testing auth signup...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'testuser@gmail.com',
      password: 'testpassword123',
      options: {
        data: { 
          first_name: 'Test',
          full_name: 'Test Society',
          user_type: 'society'
        }
      }
    });
    
    if (authError) {
      console.error('Auth signup error:', authError);
      return;
    }
    
    console.log('Auth signup successful:', authData.user?.id);
    
    // Test 2: Check society table structure
    console.log('2. Testing society table access...');
    const { data: tableData, error: tableError } = await supabase
      .from('society')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error('Society table error:', tableError);
      return;
    }
    
    console.log('Society table accessible:', tableData);
    
    // Test 3: Try to insert society record
    if (authData.user) {
      console.log('3. Testing society record insertion...');
      const { data: insertData, error: insertError } = await supabase
        .from('society')
        .insert([
          {
            name: 'Test Society',
            contact_email: 'testuser@gmail.com',
            user_id: authData.user.id
          }
        ])
        .select();
        
      if (insertError) {
        console.error('Society insert error:', insertError);
        return;
      }
      
      console.log('Society record created:', insertData);
    }
    
    console.log('All tests passed!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testRegistration();
