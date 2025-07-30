// Create an auto-confirmed test user for development
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service key for admin operations

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env file');
  console.log('You need to add your service role key to .env file from Supabase Dashboard → Settings → API');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createConfirmedUser() {
  console.log('Creating auto-confirmed test user for Adam...');
  
  try {
    // Create user with admin client (bypasses email confirmation)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: '02adamhassan@gmail.com',
      password: 'testpass123',
      email_confirm: true // This bypasses email confirmation
    });
    
    if (userError) {
      console.error('❌ User creation error:', userError.message);
      return;
    }
    
    console.log('✅ Confirmed user created:', userData.user.email);
    
    // Create society record
    const { data: societyData, error: societyError } = await supabaseAdmin
      .from('society')
      .insert([
        {
          user_id: userData.user.id,
          contact_email: '02adamhassan@gmail.com',
          name: 'Test',
          description: 'Adam\'s test society for login testing',
          website_url: 'https://test-society.example.com'
        }
      ])
      .select();
    
    if (societyError) {
      console.error('❌ Society creation error:', societyError.message);
    } else {
      console.log('✅ Society record created:', societyData[0].name);
    }
    
    console.log('\n🎉 Test user setup complete!');
    console.log('Login credentials for Adam:');
    console.log('Email: 02adamhassan@gmail.com');
    console.log('Password: testpass123');
    console.log('Society Name: Test');
    console.log('User Type: Society');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createConfirmedUser().then(() => {
  process.exit(0);
});
