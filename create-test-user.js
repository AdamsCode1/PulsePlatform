// Script to create a test user for login testing
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  console.log('Creating test user for login testing...');
  
  try {
    // Create test society user
    console.log('1. Creating test society user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'testsociety@durham.ac.uk',
      password: 'testpassword123',
    });
    
    if (authError) {
      console.error('Auth signup error:', authError.message);
      return;
    }
    
    if (authData.user) {
      console.log('✅ Test user created:', authData.user.email);
      
      // Create society record
      console.log('2. Creating society record...');
      const { data: societyData, error: societyError } = await supabase
        .from('society')
        .insert([
          {
            user_id: authData.user.id,
            contact_email: 'testsociety@durham.ac.uk',
            name: 'Test Society',
            description: 'A test society for login testing',
            website_url: 'https://test-society.example.com'
          }
        ])
        .select();
      
      if (societyError) {
        console.error('Society creation error:', societyError.message);
      } else {
        console.log('✅ Society record created:', societyData[0]);
      }
    }
    
    console.log('\n✅ Test user setup complete!');
    console.log('You can now test login with:');
    console.log('Email: testsociety@durham.ac.uk');
    console.log('Password: testpassword123');
    
  } catch (err) {
    console.error('Test user creation error:', err);
  }
}

createTestUser().then(() => {
  console.log('\nTest user creation completed.');
  process.exit(0);
});
