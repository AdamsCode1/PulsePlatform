import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  try {
    console.log('Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabaseAdmin
      .from('auth.users')
      .select('*')
      .limit(5);
    
    if (authError) {
      console.log('auth.users error:', authError);
    } else {
      console.log('auth.users count:', authUsers?.length || 0);
    }

    console.log('\nChecking student table...');
    const { data: students, error: studentError } = await supabaseAdmin
      .from('student')
      .select('*')
      .limit(5);
    
    if (studentError) {
      console.log('student table error:', studentError);
    } else {
      console.log('student table count:', students?.length || 0);
      if (students && students.length > 0) {
        console.log('Sample student:', students[0]);
      }
    }

    console.log('\nChecking society table...');
    const { data: societies, error: societyError } = await supabaseAdmin
      .from('society')
      .select('*')
      .limit(5);
    
    if (societyError) {
      console.log('society table error:', societyError);
    } else {
      console.log('society table count:', societies?.length || 0);
      if (societies && societies.length > 0) {
        console.log('Sample society:', societies[0]);
      }
    }

    console.log('\nTrying get_all_users RPC...');
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_all_users');
    
    if (rpcError) {
      console.log('get_all_users RPC error:', rpcError);
    } else {
      console.log('get_all_users RPC result count:', rpcData?.length || 0);
      if (rpcData && rpcData.length > 0) {
        console.log('Sample RPC result:', rpcData[0]);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();
