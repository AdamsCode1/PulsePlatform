// Test login with different possible passwords for the confirmed user
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConfirmedUserLogin() {
  console.log('Testing login for confirmed user: 02adamhassan@gmail.com');
  console.log('User ID from dashboard: dfce5ca4-b368-4e59-ae2e-64bc6a4170ae');
  
  const possiblePasswords = [
    'testpass123',      // Your requested password
    'testpassword123',  // Original test password
    'testpass',         // Simple variant
  ];
  
  for (const password of possiblePasswords) {
    console.log(`\nTrying password: ${password}`);
    
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: '02adamhassan@gmail.com',
        password: password,
      });
      
      if (loginError) {
        console.log(`❌ Failed with "${password}": ${loginError.message}`);
      } else {
        console.log(`✅ SUCCESS with password: ${password}`);
        console.log(`✅ User ID: ${loginData.user.id}`);
        console.log(`✅ Email confirmed: ${loginData.user.email_confirmed_at ? 'Yes' : 'No'}`);
        
        // Sign out
        await supabase.auth.signOut();
        return password; // Return successful password
      }
    } catch (err) {
      console.log(`❌ Error with "${password}": ${err.message}`);
    }
  }
  
  console.log('\n❌ None of the passwords worked.');
  console.log('The confirmed user might have been created with a different password.');
  console.log('\n💡 Solution: Reset password in Supabase Dashboard:');
  console.log('1. Go to: https://supabase.com/dashboard/project/tbarboxknpkirrpqdiks/auth/users');
  console.log('2. Find user: 02adamhassan@gmail.com');
  console.log('3. Click "..." menu → "Send password reset email"');
  console.log('4. Or manually set a new password');
  
  return null;
}

testConfirmedUserLogin().then((successPassword) => {
  if (successPassword) {
    console.log(`\n🎉 Working password found: ${successPassword}`);
    console.log('You can now test login at: http://localhost:8081/login#');
  }
  process.exit(0);
});
