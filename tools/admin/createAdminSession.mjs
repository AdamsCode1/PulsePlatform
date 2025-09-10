import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminSession() {
  try {
    // Get the admin user
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error listing users:', usersError);
      return;
    }
    
    const adminUser = users.users.find(user => user.email === 'admin@dupulse.co.uk');
    
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Found admin user:', adminUser.id);
    
    // Reset the admin password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      adminUser.id,
      { password: 'testpassword123' }
    );
    
    if (error) {
      console.error('Error updating password:', error);
      return;
    }
    
    console.log('Password updated successfully. Now try to sign in...');
    
    // Now try to sign in with the new password
    const supabaseClient = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: 'admin@dupulse.co.uk',
      password: 'testpassword123'
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError);
      return;
    }
    
    if (signInData.session) {
      console.log('SUCCESS! Admin token:', signInData.session.access_token);
      return signInData.session.access_token;
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminSession();
