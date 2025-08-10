import { createClient } from '@supabase/supabase-js';
import { addDays, format, setHours, setMinutes } from 'date-fns';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface EventData {
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  status: 'approved';
  society_id: string;
  category?: string;
  signup_link?: string;
}

// Sample events data - we'll add society_id and timing dynamically
const sampleEvents: Omit<EventData, 'society_id' | 'start_time' | 'end_time'>[] = [
  {
    name: 'Tech Innovation Workshop',
    description: 'Join us for an exciting workshop on the latest technology trends and innovation strategies. Learn about AI, blockchain, and emerging technologies that are shaping the future.',
    location: 'King\'s Building, Room KB-201',
    status: 'approved',
    category: 'Workshop'
  },
  {
    name: 'Annual Dance Performance',
    description: 'Experience the magic of our annual dance showcase featuring traditional and contemporary performances by talented student dancers.',
    location: 'McEwan Hall',
    status: 'approved',
    category: 'Performance'
  },
  {
    name: 'Career Fair 2024',
    description: 'Connect with top employers and explore exciting career opportunities. Network with professionals and learn about internships and graduate positions.',
    location: 'Pleasance Sports Centre',
    status: 'approved',
    category: 'Career'
  },
  {
    name: 'Photography Exhibition Opening',
    description: 'Discover stunning photography from student artists showcasing diverse perspectives and creative visions. Wine and light refreshments provided.',
    location: 'Talbot Rice Gallery',
    status: 'approved',
    category: 'Art'
  },
  {
    name: 'International Food Festival',
    description: 'Celebrate diversity through food! Taste authentic dishes from around the world prepared by international students and local chefs.',
    location: 'George Square Gardens',
    status: 'approved',
    category: 'Cultural'
  },
  {
    name: 'Charity Fun Run',
    description: 'Join our annual charity fun run to raise funds for local community projects. All fitness levels welcome. Registration includes t-shirt and refreshments.',
    location: 'The Meadows',
    status: 'approved',
    category: 'Sports',
    signup_link: 'https://example.com/charity-run-signup'
  },
  {
    name: 'Mental Health Awareness Talk',
    description: 'An important discussion about mental health resources and support systems available to students. Led by professional counselors and peer supporters.',
    location: 'David Hume Tower, Lecture Theatre A',
    status: 'approved',
    category: 'Health'
  },
  {
    name: 'Stand-up Comedy Night',
    description: 'Laugh out loud at our monthly comedy night featuring both student comedians and professional performers. Great entertainment for a fun evening out.',
    location: 'Teviot Row House, Debating Hall',
    status: 'approved',
    category: 'Entertainment'
  },
  {
    name: 'Environmental Action Workshop',
    description: 'Learn practical ways to make a positive environmental impact. Discover sustainable living tips and get involved in campus green initiatives.',
    location: 'Chrystal Macmillan Building, Room CM-114',
    status: 'approved',
    category: 'Environment'
  },
  {
    name: 'Book Club Discussion',
    description: 'Join our monthly book club for an engaging discussion of contemporary literature. This month we\'re exploring themes of identity and belonging.',
    location: 'Main Library, Group Study Room 3',
    status: 'approved',
    category: 'Academic'
  },
  {
    name: 'Music Concert: Classical Ensemble',
    description: 'Enjoy an evening of beautiful classical music performed by the university orchestra and chamber ensemble. Features works by Mozart, Beethoven, and contemporary composers.',
    location: 'Reid Concert Hall',
    status: 'approved',
    category: 'Music'
  },
  {
    name: 'Student Innovation Showcase',
    description: 'See amazing projects and innovations created by students across all disciplines. From engineering marvels to artistic creations and business ideas.',
    location: 'Informatics Forum, Main Atrium',
    status: 'approved',
    category: 'Academic'
  },
  {
    name: 'Cultural Heritage Walking Tour',
    description: 'Explore the rich history and cultural heritage of Edinburgh with expert guides. Discover hidden gems and learn fascinating stories about our city.',
    location: 'Meet at Old College Quad',
    status: 'approved',
    category: 'Cultural'
  },
  {
    name: 'Entrepreneurship Panel Discussion',
    description: 'Learn from successful entrepreneurs and business leaders about starting your own company, overcoming challenges, and building a successful venture.',
    location: 'Business School, Lecture Theatre 1',
    status: 'approved',
    category: 'Career'
  }
];

async function addSampleEvents() {
  try {
    console.log('🌱 Starting to seed sample events...');

    // First, get some society IDs from the database
    const { data: societies, error: societyError } = await supabaseAdmin
      .from('society')
      .select('id, name')
      .limit(5);

    if (societyError) {
      throw new Error(`Failed to fetch societies: ${societyError.message}`);
    }

    if (!societies || societies.length === 0) {
      throw new Error('No societies found. Please create some societies first.');
    }

    console.log(`📋 Found ${societies.length} societies to assign events to`);

    // Generate events for the next 2 weeks
    const startDate = new Date();
    const events: EventData[] = [];

    sampleEvents.forEach((eventTemplate, index) => {
      // Distribute events over the next 14 days
      const eventDate = addDays(startDate, Math.floor(index * 14 / sampleEvents.length));
      
      // Set random times between 10 AM and 8 PM
      const startHour = 10 + Math.floor(Math.random() * 10);
      const startMinute = Math.random() > 0.5 ? 0 : 30;
      const duration = 1 + Math.floor(Math.random() * 3); // 1-4 hours
      
      const startTime = setMinutes(setHours(eventDate, startHour), startMinute);
      const endTime = addDays(startTime, 0);
      endTime.setHours(startTime.getHours() + duration);

      // Assign to a random society
      const society = societies[index % societies.length];

      events.push({
        ...eventTemplate,
        society_id: society.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });
    });

    console.log(`📅 Generated ${events.length} events for the next 2 weeks`);

    // Insert events into the database
    const { data: insertedEvents, error: insertError } = await supabaseAdmin
      .from('event')
      .insert(events)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert events: ${insertError.message}`);
    }

    console.log(`✅ Successfully created ${insertedEvents?.length || 0} sample events!`);
    
    // Log the events by date
    console.log('\\n📆 Events created:');
    insertedEvents?.forEach((event) => {
      const eventDate = format(new Date(event.start_time), 'MMM dd, yyyy');
      const eventTime = format(new Date(event.start_time), 'h:mm a');
      console.log(`  ${eventDate} at ${eventTime}: ${event.name}`);
    });

  } catch (error) {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  }
}

// Run the seeding function immediately
addSampleEvents()
  .then(() => {
    console.log('\\n🎉 Sample events seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });

export { addSampleEvents };
