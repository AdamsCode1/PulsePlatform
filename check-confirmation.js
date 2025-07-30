// Check user confirmation status and provide guidance
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConfirmationStatus() {
  console.log('Checking email confirmation status for Adam...');
  console.log('Expected User ID: dfce5ca4-b368-4e59-ae2e-64bc6a4170ae (confirmed in dashboard)');
  
  try {
    // Try to login to check if user is confirmed
    console.log('\n1. Testing login to check confirmation status...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: '02adamhassan@gmail.com',
      password: 'testpass123',
    });
    
    if (loginError) {
      if (loginError.message.includes('Email not confirmed')) {
        console.log('❌ Email not confirmed yet');
        console.log('\n📧 MANUAL CONFIRMATION STEPS:');
        console.log('1. Open your browser and go to:');
        console.log('   https://supabase.com/dashboard/project/tbarboxknpkirrpqdiks/auth/users');
        console.log('\n2. Look for user with email: 02adamhassan@gmail.com');
        console.log('   (User ID: dfce5ca4-b368-4e59-ae2e-64bc6a4170ae)');
        console.log('\n3. Click the three dots (...) menu next to the user');
        console.log('\n4. Select "Confirm user" from the dropdown');
        console.log('\n5. The user will be immediately confirmed');
        console.log('\n6. Run this script again to verify confirmation');
        console.log('\n🔄 OR try running: node check-confirmation.js');
      } else if (loginError.message.includes('Invalid login credentials')) {
        console.log('❌ User might not exist or wrong credentials');
        console.log('Error details:', loginError.message);
        console.log('The confirmed user from dashboard has ID: dfce5ca4-b368-4e59-ae2e-64bc6a4170ae');
        console.log('Try a different password or check if this user needs password reset');
      } else {
        console.log('❌ Login error:', loginError.message);
      }
    } else {
      console.log('✅ User is confirmed and can login!');
      console.log('✅ Login successful for:', loginData.user.email);
      console.log('✅ User ID matches:', loginData.user.id);
      
      // Check if society record exists
      console.log('\n2. Checking society record...');
      const { data: society, error: societyError } = await supabase
        .from('society')
        .select('*')
        .eq('user_id', loginData.user.id)
        .single();
      
      if (societyError) {
        console.log('❌ Society record not found, creating it now...');
        
        // Create society record
        const { data: newSociety, error: createError } = await supabase
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
        
        if (createError) {
          console.log('❌ Error creating society:', createError.message);
        } else {
          console.log('✅ Society record created:', newSociety[0].name);
        }
      } else {
        console.log('✅ Society record exists:', society.name);
      }
      
      // Sign out after checking
      await supabase.auth.signOut();
      
      console.log('\n🎉 SETUP COMPLETE!');
      console.log('You can now test login at: http://localhost:8081/login#');
      console.log('Login credentials:');
      console.log('Email: 02adamhassan@gmail.com');
      console.log('Password: testpass123');
      console.log('User Type: Society');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkConfirmationStatus().then(() => {
  process.exit(0);
});
