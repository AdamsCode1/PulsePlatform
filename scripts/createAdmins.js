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

console.log('🔧 Admin User Creation Tool');
console.log('============================');
console.log('URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Service Key:', supabaseServiceKey ? '✅ Found' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.log('');
  console.log('Required in .env.local:');
  console.log('- VITE_SUPABASE_URL=your_supabase_url');
  console.log('- SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('');
  console.log('You can find these in your Supabase project settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// List of admin users to create
const adminUsers = [
  {
    email: 'admin@dupulse.co.uk',
    password: 'Admin123!@#',
    name: 'Main Admin'
  },
  // Add more admin users here if needed
  // {
  //   email: 'admin2@dupulse.co.uk',
  //   password: 'SecurePassword123!',
  //   name: 'Secondary Admin'
  // }
];

async function createAdminUser(adminUser) {
  try {
    console.log(`Creating admin: ${adminUser.email}...`);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminUser.email,
      password: adminUser.password,
      email_confirm: true, // Skip email verification
      app_metadata: {
        role: 'admin',
        name: adminUser.name
      },
      user_metadata: {
        name: adminUser.name
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`⚠️  User ${adminUser.email} already exists. Updating role...`);
        
        // Try to update the existing user's role
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error('❌ Error listing users:', listError.message);
          return false;
        }
        
        const existingUser = users.users.find(u => u.email === adminUser.email);
        if (existingUser) {
          const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              app_metadata: {
                role: 'admin',
                name: adminUser.name
              }
            }
          );
          
          if (updateError) {
            console.error('❌ Error updating user role:', updateError.message);
            return false;
          }
          
          console.log(`✅ Updated ${adminUser.email} to admin role`);
          return true;
        }
      } else {
        console.error(`❌ Error creating ${adminUser.email}:`, error.message);
        return false;
      }
    } else {
      console.log(`✅ Admin user created successfully!`);
      console.log(`📧 Email: ${adminUser.email}`);
      console.log(`🔑 Password: ${adminUser.password}`);
      console.log(`🎯 User ID: ${data.user.id}`);
      console.log('');
      return true;
    }
  } catch (err) {
    console.error(`❌ Unexpected error creating ${adminUser.email}:`, err.message);
    return false;
  }
}

async function createAllAdmins() {
  console.log(`📝 Creating ${adminUsers.length} admin user(s)...\n`);
  
  let successCount = 0;
  
  for (const adminUser of adminUsers) {
    const success = await createAdminUser(adminUser);
    if (success) successCount++;
    console.log(''); // Add spacing between users
  }
  
  console.log('🎉 Admin Creation Summary');
  console.log('=========================');
  console.log(`✅ Successfully created/updated: ${successCount}/${adminUsers.length} admin(s)`);
  console.log('');
  console.log('🔗 Admin Login URLs:');
  console.log('- Development: http://localhost:8081/admin/login');
  console.log('- Production: https://dupulse.co.uk/admin/login');
  console.log('');
  console.log('📊 Admin Dashboard URLs:');
  console.log('- Development: http://localhost:8081/admin/dashboard');
  console.log('- Production: https://dupulse.co.uk/admin/dashboard');
}

// Run the script
createAllAdmins().catch(console.error);
