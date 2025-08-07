#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateUserToAdmin(email) {
  try {
    console.log(`🔍 Looking for user: ${email}...`);
    
    // First, get all users to find the one with the specified email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return false;
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      return false;
    }
    
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`🔄 Current role: ${user.app_metadata?.role || 'none'}`);
    
    // Update the user's app_metadata to include admin role
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          ...user.app_metadata,
          role: 'admin'
        }
      }
    );
    
    if (error) {
      console.error('❌ Error updating user:', error.message);
      return false;
    }
    
    console.log('✅ Successfully updated user to admin!');
    console.log(`📧 Email: ${data.user.email}`);
    console.log(`🎯 User ID: ${data.user.id}`);
    console.log(`👤 Role: ${data.user.app_metadata.role}`);
    
    return true;
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Admin Role Update Tool');
  console.log('==========================');
  
  const adminEmail = 'admin@dupulse.co.uk';
  const success = await updateUserToAdmin(adminEmail);
  
  if (success) {
    console.log('\n🎉 Admin role update successful!');
    console.log('\n🔗 You can now login at:');
    console.log('- Development: http://localhost:8081/admin/login');
    console.log('- Production: https://dupulse.co.uk/admin/login');
    console.log('\n📊 Admin Dashboard:');
    console.log('- Development: http://localhost:8081/admin/dashboard');
    console.log('- Production: https://dupulse.co.uk/admin/dashboard');
  } else {
    console.log('\n❌ Failed to update admin role');
  }
}

main().catch(console.error);
