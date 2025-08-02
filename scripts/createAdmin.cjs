const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for auth operations

console.log('Creating admin user...');
console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.log('You need SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@dupulse.co.uk',
      password: 'admin123!', // Change this to a secure password
      email_confirm: true, // Skip email verification
      user_metadata: {
        role: 'admin'
      }
    });

    if (error) {
      console.error('❌ Error creating admin user:', error);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@dupulse.co.uk');
    console.log('🔑 Password: admin123!');
    console.log('🎯 User ID:', data.user.id);
    console.log('');
    console.log('🔗 You can now login at: http://localhost:8081/admin');
    console.log('📊 Then access admin panel at: http://localhost:8081/admin/approvals');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

createAdminUser();
