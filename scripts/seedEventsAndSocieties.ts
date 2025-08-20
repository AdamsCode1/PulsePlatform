// scripts/seedEventsAndSocieties.ts
// Run with: npx tsx scripts/seedEventsAndSocieties.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addHours, addMinutes } from 'date-fns';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);

// Sample societies
const societies = [
  {
    id: uuidv4(),
    name: 'Computer Science Society',
    contact_email: 'cs.society@university.edu',
    description: 'Connecting tech enthusiasts and future developers',
    website_url: 'https://cs-society.university.edu'
  },
  {
    id: uuidv4(),
    name: 'Drama Society',
    contact_email: 'drama@university.edu',
    description: 'Theatre, performance, and creative arts',
    website_url: 'https://drama.university.edu'
  },
  {
    id: uuidv4(),
    name: 'Environmental Club',
    contact_email: 'environment@university.edu',
    description: 'Promoting sustainability and environmental awareness',
    website_url: 'https://enviro.university.edu'
  },
  {
    id: uuidv4(),
    name: 'Business Society',
    contact_email: 'business@university.edu',
    description: 'Future entrepreneurs and business leaders',
    website_url: 'https://business.university.edu'
  },
  {
    id: uuidv4(),
    name: 'Photography Club',
    contact_email: 'photo@university.edu',
    description: 'Capturing moments and developing skills',
    website_url: 'https://photo.university.edu'
  }
];

function generateEvents() {
  const events: any[] = [];
  const baseDate = new Date(); // Today
  
  // Generate events for the next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const eventDate = addDays(baseDate, dayOffset);
    
    // 2-4 events per day
    const eventsPerDay = Math.floor(Math.random() * 3) + 2;
    
    for (let eventIndex = 0; eventIndex < eventsPerDay; eventIndex++) {
      const society = societies[Math.floor(Math.random() * societies.length)];
      const startHour = 9 + Math.floor(Math.random() * 12); // 9 AM to 9 PM
      const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 minutes
      
      const startTime = addMinutes(addHours(eventDate, startHour), startMinute);
      const duration = 1 + Math.floor(Math.random() * 3); // 1-3 hours
      const endTime = addHours(startTime, duration);
      
      const eventNames = [
        'Tech Talk: Future of AI',
        'Workshop: React Best Practices',
        'Networking Night',
        'Career Fair',
        'Study Group Session',
        'Guest Speaker Event',
        'Social Mixer',
        'Skills Workshop',
        'Panel Discussion',
        'Community Outreach',
        'Project Showcase',
        'Innovation Challenge'
      ];
      
      const locations = [
        'Main Auditorium',
        'Student Union Building',
        'Library Conference Room',
        'Computer Lab 201',
        'Outdoor Amphitheater',
        'Engineering Building',
        'Business School Atrium',
        'Campus Quad',
        'Student Center',
        'Lecture Hall A'
      ];
      
      const categories = ['academic', 'social', 'professional', 'recreational', 'cultural'];
      
      const eventName = eventNames[Math.floor(Math.random() * eventNames.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // 50% of events do not require external signup
      const requiresSignup = Math.random() < 0.5;
      events.push({
        id: uuidv4(),
        name: `${society.name}: ${eventName}`,
        description: `Join us for an exciting ${eventName.toLowerCase()} hosted by ${society.name}. This ${category} event will be a great opportunity to learn, network, and have fun!`,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        location: location,
        category: category,
        society_id: society.id,
        status: 'approved',
        attendee_count: Math.floor(Math.random() * 50) + 10,
        ...(requiresSignup ? { signup_link: `https://events.university.edu/${eventName.toLowerCase().replace(/[^a-z0-9]/g, '-')}` } : {})
      });
    }
  }
  
  return events;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Remove duplicate societies by contact_email
    for (const soc of societies) {
      await supabase.from('society').delete().eq('contact_email', soc.contact_email);
    }
    // Remove duplicate events by name and start_time
    const events = generateEvents();
    for (const ev of events) {
      await supabase.from('event').delete().eq('name', ev.name).eq('start_time', ev.start_time);
    }

    // Insert societies
    console.log('📚 Inserting societies...');
    const { error: societiesError } = await supabase
      .from('society')
      .insert(societies);
    if (societiesError) {
      console.error('Error inserting societies:', societiesError);
      return;
    }
    console.log(`✅ Inserted ${societies.length} societies`);

    // Insert events
    console.log('📅 Inserting events...');
    const { error: eventsError } = await supabase
      .from('event')
      .insert(events);
    if (eventsError) {
      console.error('Error inserting events:', eventsError);
      return;
    }
    console.log(`✅ Inserted ${events.length} events`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`Created ${societies.length} societies and ${events.length} events`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

seedDatabase().then(() => process.exit(0));
