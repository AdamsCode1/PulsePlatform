import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to verify partner authentication
const requirePartner = async (req: VercelRequest) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    throw new Error('Authentication token not provided.');
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Authentication failed.');
  }

  // Check if user is associated with a partner organization
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('*')
    .eq('contact_email', user.email)
    .single();

  if (partnerError || !partner) {
    throw new Error('You must be a registered partner to perform this action.');
  }

  return { user, partner };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // Public endpoint to fetch approved deals
      const { data: deals, error } = await supabase
        .from('deals')
        .select(`
          *,
          partner:partner_id(name, contact_email)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ deals });
    }

    if (req.method === 'POST') {
      // Partner endpoint to submit a new deal
      const { user, partner } = await requirePartner(req);
      
      const {
        title,
        description,
        discount_percentage,
        company_name,
        image_url,
        expires_at,
        category,
        deal_type,
        action_url,
        promo_code,
        terms_conditions
      } = req.body;

      // Basic validation
      if (!title || !description || !company_name || !category || !deal_type) {
        return res.status(400).json({ 
          message: 'Title, description, company name, category, and deal type are required.' 
        });
      }

      // Insert the deal with pending status
      const { data: deal, error } = await supabase
        .from('deals')
        .insert({
          title,
          description,
          discount_percentage,
          company_name,
          image_url,
          expires_at,
          category,
          deal_type,
          action_url,
          promo_code,
          terms_conditions,
          partner_id: partner.id,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ 
        message: 'Deal submitted successfully for review.',
        deal 
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Deals API error:', error);
    return res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
}
