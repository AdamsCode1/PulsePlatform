// Alternative: Create user with regular signup and provide manual confirmation steps
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdamTestUser() {
  console.log('Creating test user for Adam (requires manual email confirmation)...');
  
  try {
    // Create user with regular signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: '02adamhassan@gmail.com',
      password: 'testpass123',
    });
    
    if (authError) {
      console.error('❌ Signup error:', authError.message);
      return;
    }
    
    console.log('✅ User signup initiated:', authData.user?.email);
    console.log('User ID:', authData.user?.id);
    
    if (authData.user) {
      // Try to create society record
      console.log('Creating society record...');
      const { data: societyData, error: societyError } = await supabase
        .from('society')
        .insert([
          {
            user_id: authData.user.id,
            contact_email: '02adamhassan@gmail.com',
            name: 'Test',
            description: 'Adam\'s test society for login testing',
            website_url: 'https://test-society.example.com'
          }
        ])
        .select();
      
      if (societyError) {
        console.error('❌ Society creation error:', societyError.message);
        console.log('Note: Society record can be created after email confirmation');
      } else {
        console.log('✅ Society record created:', societyData[0].name);
      }
    }
    
    console.log('\n📧 NEXT STEPS:');
    console.log('1. Check your email (02adamhassan@gmail.com) for confirmation link');
    console.log('2. Click the confirmation link in the email');
    console.log('3. OR manually confirm in Supabase Dashboard:');
    console.log('   - Go to https://supabase.com/dashboard/project/tbarboxknpkirrpqdiks/auth/users');
    console.log('   - Find user: 02adamhassan@gmail.com');
    console.log('   - Click "..." menu and select "Send confirmation email" or "Confirm user"');
    console.log('\n🔑 Login credentials after confirmation:');
    console.log('Email: 02adamhassan@gmail.com');
    console.log('Password: testpass123');
    console.log('Society Name: Test');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createAdamTestUser().then(() => {
  process.exit(0);
});
