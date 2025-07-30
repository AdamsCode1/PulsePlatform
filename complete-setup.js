// Complete the setup for the confirmed user
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function completeSetup() {
  console.log('Completing setup for confirmed user...');
  
  try {
    // Login with working credentials
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: '02adamhassan@gmail.com',
      password: 'testpass',
    });
    
    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('User ID:', loginData.user.id);
    
    // Check if society record exists
    const { data: existingSociety, error: checkError } = await supabase
      .from('society')
      .select('*')
      .eq('user_id', loginData.user.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('Error checking society:', checkError.message);
    }
    
    if (existingSociety) {
      console.log('✅ Society record already exists:', existingSociety.name);
    } else {
      console.log('Creating society record...');
      
      // Create society record
      const { data: societyData, error: societyError } = await supabase
        .from('society')
        .insert([
          {
            user_id: loginData.user.id,
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
    }
    
    // Sign out
    await supabase.auth.signOut();
    
    console.log('\n🎉 SETUP COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log('🚀 Ready to test login at: http://localhost:8081/login#');
    console.log('');
    console.log('📝 Login Credentials:');
    console.log('   Email: 02adamhassan@gmail.com');
    console.log('   Password: testpass');
    console.log('   User Type: Society');
    console.log('');
    console.log('🔹 Steps to test:');
    console.log('   1. Go to http://localhost:8081/login#');
    console.log('   2. Click "Society"');
    console.log('   3. Enter the credentials above');
    console.log('   4. Click "Sign In"');
    console.log('═══════════════════════════════════════');
    
  } catch (err) {
    console.error('❌ Setup error:', err.message);
  }
}

completeSetup().then(() => {
  process.exit(0);
});
