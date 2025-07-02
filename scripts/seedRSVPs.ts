import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedRSVPs() {
  // Fetch all users and events
  const { data: users, error: userError } = await supabase.from('user').select('id');
  const { data: events, error: eventError } = await supabase.from('event').select('id');
  if (userError || eventError || !users || !events) {
    console.error('Error fetching users or events:', userError || eventError);
    return;
  }

  // Each user RSVPs to 1-3 random events
  const rsvps = users.flatMap(user => {
    const numEvents = 1 + Math.floor(Math.random() * 3);
    const shuffled = [...events].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numEvents).map(event => ({
      id: uuidv4(),
      user_id: user.id,
      event_id: event.id,
      created_at: new Date().toISOString(),
    }));
  });

  // Insert RSVPs in batches (Supabase limit is 1000 rows per insert)
  for (let i = 0; i < rsvps.length; i += 500) {
    const batch = rsvps.slice(i, i + 500);
    const { error } = await supabase.from('rsvp').insert(batch);
    if (error) {
      console.error('Error inserting RSVPs:', error);
      return;
    }
    console.log(`Inserted ${batch.length} RSVPs.`);
  }
  console.log(`Inserted a total of ${rsvps.length} RSVPs.`);
}

seedRSVPs().then(() => process.exit(0));
