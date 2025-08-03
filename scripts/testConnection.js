const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // First test if we can connect and check tables
    const { data: tables, error } = await supabase
      .from('society')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Connection/permission error:', error);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Try inserting one society
    const testSociety = {
      name: 'Test Society',
      contact_email: 'test@university.edu',
      description: 'A test society'
    };
    
    const { data: societyData, error: societyError } = await supabase
      .from('society')
      .insert([testSociety])
      .select();
      
    if (societyError) {
      console.error('Society insert error:', societyError);
      return;
    }
    
    console.log('✅ Successfully inserted test society:', societyData);
    
    // Try inserting one event
    const testEvent = {
      name: 'Test Event',
      description: 'A test event',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
      location: 'Test Location',
      society_id: societyData[0].id,
      status: 'approved'
    };
    
    const { data: eventData, error: eventError } = await supabase
      .from('event')
      .insert([testEvent])
      .select();
      
    if (eventError) {
      console.error('Event insert error:', eventError);
      return;
    }
    
    console.log('✅ Successfully inserted test event:', eventData);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
