import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './lib/sendEmail.js';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions

// Function to verify the user is an admin
const requireAdmin = async (req: VercelRequest) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) throw new Error('Authentication token not provided.');

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error('Authentication failed.');

  // Check admin table for UID
  const { data: adminRow, error: adminError } = await supabase
    .from('admin')
    .select('uid')
    .eq('uid', user.id)
    .maybeSingle();
  if (adminError || !adminRow) {
    throw new Error('You must be an admin to perform this action.');
  }
  return user;
};
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isNonEmptyString = (val: unknown): val is string => {
  return typeof val === 'string' && val.trim().length > 0;
};

// Simple CORS handler
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== UNIFIED API REQUEST START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query:', req.query);
  // Avoid logging full headers/body to prevent leaking secrets/PII
  if (process.env.NODE_ENV !== 'production') {
    const { authorization, cookie, ...rest } = req.headers || {};
    console.log('Headers (redacted):', {
      ...rest,
      authorization: authorization ? 'REDACTED' : undefined,
      cookie: cookie ? 'REDACTED' : undefined,
    });
    console.log('Body shape:', typeof (req as any).body === 'object' ? Object.keys((req as any).body) : typeof (req as any).body);
  }

  try {
    // Handle CORS
    setCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const { method, query } = req;
    const { resource, action, id } = query;

    // Debug logging
    console.log('Unified API Request:', {
      method,
      resource,
      action,
      id,
      url: req.url
    });

    // Route to appropriate handler based on resource
    console.log('Routing to handler for resource:', resource);
    switch (resource) {
      case 'events':
        console.log('Routing to handleEvents');
        return await handleEvents(req, res, supabase, action as string, id as string);
      case 'societies':
        console.log('Routing to handleSocieties');
        return await handleSocieties(req, res, supabase, action as string, id as string);
      case 'users':
        console.log('Routing to handleUsers');
        return await handleUsers(req, res, supabase, action as string, id as string);
      case 'rsvps':
        console.log('Routing to handleRSVPs');
        return await handleRSVPs(req, res, supabase, action as string, id as string);
      case 'login':
        console.log('Routing to handleLogin');
        return await handleLogin(req, res, supabase);
      case 'partners':
        console.log('Routing to handlePartners');
        return await handlePartners(req, res, supabase, action as string, id as string);
      case 'students':
        console.log('Routing to handleStudents');
        return await handleStudents(req, res, supabase, action as string, id as string);
      case 'early-access':
        console.log('Routing to handleEarlyAccess');
        return await handleEarlyAccess(req, res, supabase);
      case 'admin':
        console.log('Routing to handleAdmin');
        return await handleAdmin(req, res, supabase, action as string, id as string);
      case 'society':
        console.log('Routing to handleSocietyActions');
        return await handleSocietyActions(req, res, supabase, action as string, id as string);
      case 'hello':
        console.log('Routing to handleHello');
        return await handleHello(req, res);
      default:
        console.log('Resource not found:', resource);
        return res.status(404).json({ error: 'Resource not found' });
    }
  } catch (error) {
    console.error('=== API ERROR ===');
    console.error('Error message:', error?.message || 'Unknown error');
    console.error('Error stack:', error?.stack || 'No stack trace');
    console.error('Error details:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error?.message || 'Unknown error',
      type: error?.constructor?.name || 'UnknownError'
    });
  }
}

// Events handlers
async function handleEvents(req: VercelRequest, res: VercelResponse, supabase: any, action?: string, id?: string) {
  console.log('=== HANDLE EVENTS START ===');
  const { method } = req;
  console.log('Events handler - method:', method, 'action:', action, 'id:', id);

  try {
    if (action === 'pending' && method === 'GET') {
      console.log('Handling pending events query');
      const { data, error } = await supabase
        .from('event')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Pending events error:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('Pending events success:', data?.length || 0, 'events');
      return res.status(200).json(data);
    }

    if (action === 'society' && method === 'GET') {
      console.log('Handling society events query');
      const { societyId, status } = req.query;
      
      let query = supabase
        .from('event')
        .select('*')
        .eq('society_id', societyId);
      
      // Filter by status if not 'all'
      if (status !== 'all') {
        if (status === 'approved') {
          query = query.eq('status', 'approved');
        } else if (status === 'pending') {
          query = query.eq('status', 'pending');
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Society events error:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('Society events success:', data?.length || 0, 'events');
      return res.status(200).json(data);
    }

    if (action === 'by-date' && method === 'GET') {
      console.log('Handling by-date events query');
      const { date } = req.query;
      console.log('Date parameter:', date);
      
      if (!date) {
        console.error('No date parameter provided');
        return res.status(400).json({ error: 'Date parameter is required' });
      }

      const { data, error } = await supabase
        .from('event')
        .select('*')
        .eq('status', 'approved')
        .gte('start_time', `${date}T00:00:00`)
        .lte('start_time', `${date}T23:59:59`)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('By-date events error:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('By-date events success:', data?.length || 0, 'events');
      return res.status(200).json(data);
    }

    if (action === 'approve' && method === 'POST' && id) {
      console.log('Handling approve event');
      // Require admin
      await requireAdmin(req);
      const { data, error } = await supabase
        .from('event')
        .update({ status: 'approved' })
        .eq('id', id)
        .select();
      if (error) {
        console.error('Approve event error:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('Approve event success');
      return res.status(200).json(data[0]);
    }

    if (action === 'reject' && method === 'POST' && id) {
      console.log('Handling reject event');
      // Require admin
      await requireAdmin(req);
      // Update event status only (do not persist rejection reason)
      const { error: updateError } = await supabase
        .from('event')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (updateError) {
        console.error('Reject event update error:', updateError);
        return res.status(500).json({ error: updateError.message });
      }
      // Fetch event details
      const { data: eventDetails, error: eventError } = await supabase
        .from('event')
        .select('name, society_id')
        .eq('id', id)
        .single();
      if (eventError || !eventDetails) {
        console.error('Reject event fetch error:', eventError);
        return res.status(500).json({ error: eventError?.message || 'Event not found' });
      }
      // Fetch society details
      const { data: societyDetails, error: societyError } = await supabase
        .from('society')
        .select('contact_email')
        .eq('id', eventDetails.society_id)
        .single();
      if (societyError || !societyDetails) {
        console.error('Reject event society fetch error:', societyError);
        return res.status(500).json({ error: societyError?.message || 'Society not found' });
      }
      // Send rejection email
      try {
        await sendEmail({
          to: societyDetails.contact_email,
          subject: `Event "${eventDetails.name}" Rejected`,
          text: `Your event titled "${eventDetails.name}" has been rejected.\n\nReason: ${req.body?.reason || 'No reason provided.'}`,
        });
        console.log('Rejection email sent to', societyDetails.contact_email);
      } catch (emailErr) {
        console.error('Failed to send rejection email:', emailErr);
      }
      return res.status(200).json({ message: 'Event rejected and organiser notified.' });
    }

    // Default events CRUD
    if (method === 'GET') {
      if (id) {
        console.log('Handling get single event');
        const { data, error } = await supabase
          .from('event')
          .select('*')
          .eq('id', id)
          .single();
        if (error) {
          console.error('Get single event error:', error);
          return res.status(500).json({ error: error.message });
        }
        console.log('Get single event success');
        return res.status(200).json(data);
      } else {
        console.log('Handling get all events');
        const { data, error } = await supabase
          .from('event')
          .select('*')
          .eq('status', 'approved')
          .order('start_time', { ascending: true });
        if (error) {
          console.error('Get all events error:', error);
          return res.status(500).json({ error: error.message });
        }
        console.log('Get all events success:', data?.length || 0, 'events');
        return res.status(200).json(data);
      }
    }

    if (method === 'POST') {
      console.log('Handling create event');
      const body = req.body;
      const locationDetails = body.location_details;
      if (!locationDetails) {
        return res.status(400).json({ error: 'Missing location details' });
      }
      // Upsert location
      const { data: locationRows, error: locationError } = await supabase
        .from('locations')
        .upsert([
          {
            provider: locationDetails.provider,
            provider_place_id: locationDetails.provider_place_id,
            name: locationDetails.name,
            formatted_address: locationDetails.formatted_address,
            latitude: locationDetails.latitude,
            longitude: locationDetails.longitude,
            city: locationDetails.city || null,
            region: locationDetails.region || null,
            country: locationDetails.country || null,
          }
        ], { onConflict: ['provider', 'provider_place_id'], ignoreDuplicates: false })
        .select();
      if (locationError || !locationRows || locationRows.length === 0) {
        console.error('Location upsert error:', locationError);
        return res.status(500).json({ error: locationError?.message || 'Failed to upsert location' });
      }
      const locationUuid = locationRows[0].id;
      // Insert event, referencing location UUID
      const eventPayload = {
        ...body,
        location: locationUuid,
      };
      delete eventPayload.location_details;
      const { data, error } = await supabase
        .from('event')
        .insert([eventPayload])
        .select();
      if (error) {
        console.error('Create event error:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('Create event success');
      return res.status(201).json(data[0]);
    }

    if (method === 'PUT' && id) {
      console.log('Handling update event');
      const { data, error } = await supabase
        .from('event')
        .update(req.body)
        .eq('id', id)
        .select();
      if (error) {
        console.error('Update event error:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('Update event success');
      return res.status(200).json(data[0]);
    }

    if (method === 'DELETE' && id) {
      console.log('Handling delete event');
      const { error } = await supabase
        .from('event')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Delete event error:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('Delete event success');
      return res.status(200).json({ message: 'Event deleted' });
    }

    console.log('Method not allowed for events:', method);
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('=== EVENTS HANDLER ERROR ===');
    console.error('Error details:', error);
    return res.status(500).json({ 
      error: 'Events handler failed', 
      details: error?.message || 'Unknown error' 
    });
  }
}

// Societies handlers
async function handleSocieties(req: VercelRequest, res: VercelResponse, supabase: any, action?: string, id?: string) {
  const { method } = req;

  console.log('handleSocieties called:', { method, action, id });

  if (method === 'GET') {
    try {
      if (id) {
        console.log('Fetching single society with id:', id);
        const { data, error } = await supabase
          .from('society')
          .select('*')
          .eq('id', id)
          .single();
        
        console.log('Single society result:', { data, error });
        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: error.message, details: error });
        }
        return res.status(200).json(data);
      } else {
        console.log('Fetching all societies');
        const { data, error } = await supabase
          .from('society')
          .select('*')
          .order('name', { ascending: true });
        
        console.log('All societies result:', { data, error, count: data?.length });
        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: error.message, details: error });
        }
        return res.status(200).json(data);
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return res.status(500).json({ error: 'Database operation failed', details: dbError });
    }
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('society')
      .insert([req.body])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (method === 'PUT' && id) {
    const { data, error } = await supabase
      .from('society')
      .update(req.body)
      .eq('id', id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (method === 'DELETE' && id) {
    const { error } = await supabase
      .from('society')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Society deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Users handlers
async function handleUsers(req: VercelRequest, res: VercelResponse, supabase: any, action?: string, id?: string) {
  const { method } = req;

  if (method === 'GET') {
    if (id) {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    } else {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('user')
      .insert([req.body])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (method === 'PUT' && id) {
    const { data, error } = await supabase
      .from('user')
      .update(req.body)
      .eq('id', id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (method === 'DELETE' && id) {
    const { error } = await supabase
      .from('user')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'User deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// RSVPs handlers
async function handleRSVPs(req: VercelRequest, res: VercelResponse, supabase: any, action?: string, id?: string) {
  const { method } = req;

  if (method === 'GET') {
    if (id) {
      const { data, error } = await supabase
        .from('rsvp')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    } else {
      const { data, error } = await supabase
        .from('rsvp')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('rsvp')
      .insert([req.body])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (method === 'PUT' && id) {
    const { data, error } = await supabase
      .from('rsvp')
      .update(req.body)
      .eq('id', id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (method === 'DELETE' && id) {
    const { error } = await supabase
      .from('rsvp')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'RSVP deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Login handler
async function handleLogin(req: VercelRequest, res: VercelResponse, supabase: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, userType } = req.body;

  if (!email || !password || !userType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let tableName;
    switch (userType) {
      case 'student':
        tableName = 'user';
        break;
      case 'society':
        tableName = 'society';
        break;
      case 'organization':
        tableName = 'organization';
        break;
      default:
        return res.status(400).json({ error: 'Invalid user type' });
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Note: In production, you should hash passwords and compare hashes
    if (data.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = data;
    
    return res.status(200).json({
      user: userWithoutPassword,
      userType,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Partners handler - restored from removed api/partners.ts
async function handlePartners(req: VercelRequest, res: VercelResponse, supabase: any, action?: string, id?: string) {
  const { method, body } = req;

  try {
    switch (method) {
      case 'POST':
        // POST /api/partners - register new partner
        const { email, business_name, business_type, website, contact_name, phone } = body;

        console.log('[API/partners] Incoming registration body:', body);

        if (!isNonEmptyString(email) || !isValidEmail(email)) {
          return res.status(400).json({ message: 'Valid email is required.' });
        }

        if (!isNonEmptyString(business_name)) {
          return res.status(400).json({ message: 'Business name is required.' });
        }

        if (!isNonEmptyString(contact_name)) {
          return res.status(400).json({ message: 'Contact name is required.' });
        }

        // Check for duplicate email
        const { data: existing, error: checkError } = await supabase
          .from('partner')
          .select('id, email')
          .eq('email', email.trim().toLowerCase())
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('[API/partners] Error checking for existing partner:', checkError);
          return res.status(500).json({ message: 'Error checking for existing partner' });
        }

        if (existing) {
          return res.status(409).json({ message: 'Partner with this email already exists.' });
        }

        const newPartner = {
          email: email.trim().toLowerCase(),
          business_name: business_name.trim(),
          business_type: business_type?.trim() || null,
          website: website?.trim() || null,
          contact_name: contact_name.trim(),
          phone: phone?.trim() || null
        };

        console.log('[API/partners] Attempting to insert:', newPartner);

        const { data, error } = await supabase
          .from('partner')
          .insert([newPartner])
          .select()
          .single();

        if (error) {
          console.error('[API/partners] Supabase insert error:', error);
          if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ message: 'Partner with this email already exists.' });
          }
          return res.status(500).json({ message: error.message || 'Unknown error', details: error });
        }
        return res.status(201).json(data);

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Partners API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

// Students handler - restored from removed api/students.ts
async function handleStudents(req: VercelRequest, res: VercelResponse, supabase: any, action?: string, id?: string) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        if (id) {
          // GET /api/students?id=uuid - get specific user
          if (!isNonEmptyString(id)) {
            return res.status(400).json({ message: 'Valid user ID is required.' });
          }

          const { data, error } = await supabase
            .from('student')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              return res.status(404).json({ message: 'User not found.' });
            }
            throw new Error(error.message);
          }
          return res.status(200).json(data);
        } else {
          // GET /api/students - get all users (students for now)
          const { data, error } = await supabase
            .from('student')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw new Error(error.message);
          return res.status(200).json(data);
        }

      case 'POST':
        // POST /api/students - create new user (student)
        const { email, first_name, last_name, user_id } = body;

        console.log('[API/students] Incoming registration body:', body);

        if (!isNonEmptyString(email) || !isValidEmail(email)) {
          return res.status(400).json({ message: 'Valid email is required.' });
        }

        if (!isNonEmptyString(first_name)) {
          return res.status(400).json({ message: 'First name is required.' });
        }

        const newUser = {
          email: email.trim().toLowerCase(),
          first_name: first_name.trim(),
          last_name: last_name?.trim() || null,
          user_id: user_id || null
        };

        console.log('[API/students] Attempting to insert:', newUser);

        const { data, error } = await supabase
          .from('student')
          .insert([newUser])
          .select()
          .single();

        if (error) {
          console.error('[API/students] Supabase insert error:', error);
          if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ message: 'User with this email already exists.' });
          }
          return res.status(500).json({ message: error.message || 'Unknown error', details: error });
        }
        return res.status(201).json(data);

      case 'PUT':
        // PUT /api/students?id=uuid - update user
        if (!isNonEmptyString(id)) {
          return res.status(400).json({ message: 'Valid user ID is required.' });
        }

        const updates: any = {};
        const { email: updateEmail, first_name: updateFirstName, last_name: updateLastName } = body;

        if (updateEmail !== undefined) {
          if (!isNonEmptyString(updateEmail) || !isValidEmail(updateEmail)) {
            return res.status(400).json({ message: 'Valid email is required.' });
          }
          updates.email = updateEmail.trim().toLowerCase();
        }

        if (updateFirstName !== undefined) {
          if (!isNonEmptyString(updateFirstName)) {
            return res.status(400).json({ message: 'First name cannot be empty.' });
          }
          updates.first_name = updateFirstName.trim();
        }

        if (updateLastName !== undefined) {
          updates.last_name = updateLastName?.trim() || null;
        }

        const { data: updatedData, error: updateError } = await supabase
          .from('student')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          if (updateError.code === 'PGRST116') {
            return res.status(404).json({ message: 'User not found.' });
          }
          if (updateError.code === '23505') {
            return res.status(409).json({ message: 'User with this email already exists.' });
          }
          throw new Error(updateError.message);
        }

        return res.status(200).json(updatedData);

      case 'DELETE':
        // DELETE /api/students?id=uuid - delete user
        if (!isNonEmptyString(id)) {
          return res.status(400).json({ message: 'Valid user ID is required.' });
        }

        const { error: deleteError } = await supabase
          .from('student')
          .delete()
          .eq('id', id);

        if (deleteError) throw new Error(deleteError.message);
        return res.status(204).end();

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Students API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

// Early Access handler - simplified waitlist signups
async function handleEarlyAccess(req: VercelRequest, res: VercelResponse, supabase: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let body: any = (req as any).body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ message: 'Invalid request body format.' });
    }
  }

  const { email, name } = body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  if (!isNonEmptyString(normalizedName) || !isValidEmail(normalizedEmail)) {
    return res.status(400).json({ message: 'Valid name and email are required.' });
  }

  const { error } = await supabase
    .from('waitlist')
    .insert([{ name: normalizedName, email: normalizedEmail }]);

  if (error) {
    if ((error as any).code === '23505') {
      return res.status(409).json({ message: 'This email is already on the waitlist.' });
    }
    return res.status(500).json({ message: (error as any).message || 'Failed to insert into waitlist.' });
  }

  return res.status(201).json({ message: 'Successfully registered for waitlist!' });
}

// Hello handler
async function handleHello(req: VercelRequest, res: VercelResponse) {
  return res.status(200).send('Hello from API!');
}

// Admin handler - consolidates all admin functionality
async function handleAdmin(req: VercelRequest, res: VercelResponse, supabase: any, action?: string, id?: string) {
  const { method } = req;

  try {
    // Verify admin access for all admin operations
    await requireAdmin(req);

    // Route based on action parameter
    switch (action) {
      case 'activity':
        return await handleAdminActivity(req, res, supabase);
      case 'dashboard':
        return await handleAdminDashboard(req, res, supabase);
      case 'deals':
        return await handleAdminDeals(req, res, supabase, id);
      case 'events':
        return await handleAdminEvents(req, res, supabase, id);
      case 'settings':
        return await handleAdminSettings(req, res, supabase);
      case 'system':
        return await handleAdminSystem(req, res, supabase);
      case 'users':
        return await handleAdminUsers(req, res, supabase, id);
      default:
        return res.status(404).json({ error: 'Admin action not found' });
    }
  } catch (error: any) {
    console.error('Admin handler error:', error);
    return res.status(403).json({ message: error.message || 'Access denied' });
  }
}

// Society actions handler
async function handleSocietyActions(req: VercelRequest, res: VercelResponse, supabase: any, action?: string, id?: string) {
  switch (action) {
    case 'rsvpList':
      return await handleSocietyRSVPList(req, res, supabase, id);
    case 'emailRSVPList':
      return await handleSocietyEmailRSVPList(req, res, supabase, id);
    default:
      return res.status(404).json({ error: 'Society action not found' });
  }
}

// Admin Activity handler
async function handleAdminActivity(req: VercelRequest, res: VercelResponse, supabase: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return res.status(200).json(data || []);
  } catch (error: any) {
    console.error('Error fetching activity log:', error);
    return res.status(500).json({ error: 'Failed to fetch activity log' });
  }
}

// Admin Dashboard handler
async function handleAdminDashboard(req: VercelRequest, res: VercelResponse, supabase: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get event submissions over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('event')
      .select('submission_date')
      .gte('submission_date', sevenDaysAgo.toISOString())
      .order('submission_date', { ascending: true });

    if (error) throw error;

    // Group by date and count
    const chartData = (data || []).reduce((acc: any[], event: any) => {
      const date = new Date(event.submission_date).toISOString().split('T')[0];
      const existing = acc.find(item => item.submission_date === date);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ submission_date: date, count: 1 });
      }
      return acc;
    }, []);

    return res.status(200).json(chartData);
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

// Placeholder handlers for other admin functions (to be implemented)
async function handleAdminDeals(req: VercelRequest, res: VercelResponse, supabase: any, id?: string) {
  return res.status(200).json({ message: 'Admin deals functionality' });
}

async function handleAdminEvents(req: VercelRequest, res: VercelResponse, supabase: any, id?: string) {
  return res.status(200).json({ message: 'Admin events functionality' });
}

async function handleAdminSettings(req: VercelRequest, res: VercelResponse, supabase: any) {
  return res.status(200).json({ message: 'Admin settings functionality' });
}

async function handleAdminSystem(req: VercelRequest, res: VercelResponse, supabase: any) {
  return res.status(200).json({ message: 'Admin system functionality' });
}

async function handleAdminUsers(req: VercelRequest, res: VercelResponse, supabase: any, id?: string) {
  return res.status(200).json({ message: 'Admin users functionality' });
}

// Society RSVP List handler
async function handleSocietyRSVPList(req: VercelRequest, res: VercelResponse, supabase: any, eventId?: string) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('rsvp')
      .select(`
        *,
        student (
          first_name,
          last_name,
          email,
          college,
          year_of_study
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data || []);
  } catch (error: any) {
    console.error('Error fetching RSVP list:', error);
    return res.status(500).json({ error: 'Failed to fetch RSVP list' });
  }
}

// Society Email RSVP List handler
async function handleSocietyEmailRSVPList(req: VercelRequest, res: VercelResponse, supabase: any, eventId?: string) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  try {
    // Get RSVP list
    const { data: rsvps, error } = await supabase
      .from('rsvp')
      .select(`
        *,
        student (
          first_name,
          last_name,
          email
        )
      `)
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    if (error) throw error;

    const emailList = (rsvps || []).map((rsvp: any) => rsvp.student?.email).filter(Boolean);

    return res.status(200).json({ 
      message: 'Email list generated successfully',
      emailList,
      count: emailList.length
    });
  } catch (error: any) {
    console.error('Error generating email list:', error);
    return res.status(500).json({ error: 'Failed to generate email list' });
  }
}
