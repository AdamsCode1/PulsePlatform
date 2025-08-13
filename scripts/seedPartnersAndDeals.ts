import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const samplePartners = [
  {
    name: 'Student Discount Co.',
    contact_email: 'partner1@studentdiscounts.com',
    description: 'We provide amazing discounts for students across various categories.',
    website: 'https://studentdiscounts.com',
    status: 'active'
  },
  {
    name: 'TechDeals Plus',
    contact_email: 'partner2@techdeals.com',
    description: 'Technology discounts and special offers for students.',
    website: 'https://techdeals.com',
    status: 'active'
  },
  {
    name: 'Campus Eats',
    contact_email: 'partner3@campuseats.com',
    description: 'Food delivery with student-friendly pricing.',
    website: 'https://campuseats.com',
    status: 'active'
  }
];

const sampleDeals = [
  {
    title: '20% Off All Software',
    description: 'Get 20% discount on all software licenses including Adobe Creative Suite, Microsoft Office, and development tools.',
    company_name: 'TechDeals Plus',
    category: 'technology',
    deal_type: 'code',
    discount_percentage: 20,
    promo_code: 'STUDENT20',
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    terms_conditions: 'Valid for new customers only. Cannot be combined with other offers.',
    status: 'approved'
  },
  {
    title: 'Free Delivery on Food Orders',
    description: 'Get free delivery on all food orders over £15. Perfect for late-night study sessions!',
    company_name: 'Campus Eats',
    category: 'food_drink',
    deal_type: 'code',
    promo_code: 'FREEDEL',
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    terms_conditions: 'Minimum order value £15. Valid within campus delivery zones only.',
    status: 'approved'
  },
  {
    title: '50% Off Gym Membership',
    description: 'Half price gym membership for all students. Access to all facilities including pool and classes.',
    company_name: 'Student Discount Co.',
    category: 'health_fitness',
    deal_type: 'affiliate',
    discount_percentage: 50,
    action_url: 'https://studentdiscounts.com/gym-membership',
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    terms_conditions: 'Valid student ID required. 12-month minimum contract.',
    status: 'approved'
  },
  {
    title: '15% Off Textbooks',
    description: 'Save on all textbooks and study materials. Wide selection available.',
    company_name: 'Student Discount Co.',
    category: 'education',
    deal_type: 'in-store',
    discount_percentage: 15,
    expires_at: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days from now
    terms_conditions: 'Show valid student ID in-store. Not valid on digital downloads.',
    status: 'pending'
  },
  {
    title: 'Student Cinema Tickets £5',
    description: 'Special student pricing for all movie screenings. Includes weekend shows!',
    company_name: 'Campus Eats',
    category: 'entertainment',
    deal_type: 'affiliate',
    action_url: 'https://campuseats.com/cinema-tickets',
    expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
    terms_conditions: 'Valid student ID required. Subject to availability.',
    status: 'pending'
  }
];

async function seedPartnersAndDeals() {
  try {
    console.log('Starting to seed partners and deals...');

    // Insert partners
    console.log('Inserting partners...');
    const { data: partnersData, error: partnersError } = await supabase
      .from('partners')
      .insert(samplePartners)
      .select();

    if (partnersError) {
      console.error('Error inserting partners:', partnersError);
      return;
    }

    console.log(`Successfully inserted ${partnersData.length} partners`);

    // Map partner emails to IDs for deals
    const partnerMap = new Map();
    partnersData.forEach(partner => {
      partnerMap.set(partner.contact_email, partner.id);
    });

    // Prepare deals with partner IDs
    const dealsWithPartnerIds = sampleDeals.map(deal => ({
      ...deal,
      partner_id: partnerMap.get(samplePartners.find(p => p.name === deal.company_name)?.contact_email)
    }));

    // Insert deals
    console.log('Inserting deals...');
    const { data: dealsData, error: dealsError } = await supabase
      .from('deals')
      .insert(dealsWithPartnerIds)
      .select();

    if (dealsError) {
      console.error('Error inserting deals:', dealsError);
      return;
    }

    console.log(`Successfully inserted ${dealsData.length} deals`);
    console.log('Seeding completed successfully!');

    // Log summary
    console.log('\n=== Summary ===');
    console.log(`Partners created: ${partnersData.length}`);
    console.log(`Deals created: ${dealsData.length}`);
    console.log(`Approved deals: ${dealsData.filter(d => d.status === 'approved').length}`);
    console.log(`Pending deals: ${dealsData.filter(d => d.status === 'pending').length}`);

  } catch (error) {
    console.error('Unexpected error during seeding:', error);
  }
}

// Check if script is run directly
if (require.main === module) {
  seedPartnersAndDeals()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { seedPartnersAndDeals };
