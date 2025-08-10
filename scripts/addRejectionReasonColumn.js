import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addRejectionReasonColumn() {
  try {
    console.log('Attempting to add rejection_reason column...');
    
    // Try to select from the event table to test connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from('event')
      .select('id, status')
      .limit(1);
    
    if (testError) {
      console.error('Database connection failed:', testError);
      return;
    }
    
    console.log('Database connection successful');
    console.log('Test data:', testData);
    
    // Check if rejection_reason column already exists by trying to select it
    const { data: columnTest, error: columnError } = await supabaseAdmin
      .from('event')
      .select('rejection_reason')
      .limit(1);
    
    if (!columnError) {
      console.log('rejection_reason column already exists!');
      return;
    }
    
    if (columnError && !columnError.message.includes('rejection_reason')) {
      console.error('Unexpected error checking column:', columnError);
      return;
    }
    
    console.log('rejection_reason column does not exist, need to add it manually in Supabase dashboard');
    console.log('SQL to run: ALTER TABLE public.event ADD COLUMN rejection_reason TEXT;');
    
  } catch (err) {
    console.error('Script error:', err);
  }
}

addRejectionReasonColumn();
