// scripts/seedDatabase.ts
// Run with: npx tsx scripts/seedDatabase.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const firstNames = [
  'Alex', 'Jamie', 'Taylor', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Avery', 'Parker', 'Quinn',
  'Drew', 'Skyler', 'Reese', 'Rowan', 'Sawyer', 'Emerson', 'Finley', 'Harper', 'Jules', 'Kai'
];
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Lopez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson'
];

function randomUser(i: number) {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return {
    id: uuidv4(),
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@student.university.edu`,
    created_at: new Date().toISOString(),
  };
}

async function seedUsers() {
  const users = Array.from({ length: 50 }).map((_, i) => randomUser(i));
  const { error } = await supabase.from('user').insert(users);
  if (error) {
    console.error('Error inserting users:', error);
    return;
  }
  console.log(`Inserted ${users.length} users.`);
}

seedUsers().then(() => process.exit(0));
