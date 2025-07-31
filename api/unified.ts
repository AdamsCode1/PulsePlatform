import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './_utils';
import { supabase } from './_supabase';
import { createClient } from '@supabase/supabase-js';

// Create authenticated Supabase client
async function createAuthenticatedSupabaseClient(req: VercelRequest) {
  console.log('Creating authenticated client, auth header:', req.headers['authorization']?.substring(0, 20) + '...');
  
  const authHeader = req.headers['authorization'] as string;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted token length:', token.length);
    
    try {
      // Create client with user token for RLS
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
      
      console.log('Creating authenticated client with URL:', supabaseUrl);
      
      const authenticatedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });
      
      console.log('Authenticated client created successfully');
      return authenticatedSupabase;
    } catch (error) {
      console.error('Error creating authenticated client:', error);
      return supabase; // Fallback to default client
    }
  }
  
  console.log('No auth header, using default client');
  // Return default client for unauthenticated requests
  return supabase;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== UNIFIED API REQUEST START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.keys(req.headers));
  console.log('Query:', req.query);

  try {
    // Handle CORS first
    console.log('Handling CORS...');
    await handleCors(req, res);
    console.log('CORS handled successfully');

    const { method, query } = req;
    const { resource, action, id } = query;

    // Debug logging
    console.log('Unified API Request:', {
      method,
      resource,
      action,
      id,
      url: req.url,
      hasAuth: !!req.headers['authorization']
    });

    // Create authenticated Supabase client
    console.log('Creating authenticated Supabase client...');
    const authenticatedSupabase = await createAuthenticatedSupabaseClient(req);
    console.log('Authenticated Supabase client created');

    // Route to appropriate handler based on resource
    console.log('Routing to handler for resource:', resource);
    switch (resource) {
      case 'events':
        console.log('Routing to handleEvents');
        return await handleEvents(req, res, authenticatedSupabase, action as string, id as string);
      case 'societies':
        console.log('Routing to handleSocieties');
        return await handleSocieties(req, res, authenticatedSupabase, action as string, id as string);
      case 'users':
        console.log('Routing to handleUsers');
        return await handleUsers(req, res, authenticatedSupabase, action as string, id as string);
      case 'rsvps':
        console.log('Routing to handleRSVPs');
        return await handleRSVPs(req, res, authenticatedSupabase, action as string, id as string);
      case 'login':
        console.log('Routing to handleLogin');
        return await handleLogin(req, res, authenticatedSupabase);
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
      const { error } = await supabase
        .from('event')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Reject event error:', error);
        return res.status(500).json({ error: error.message });
      }
      console.log('Reject event success');
      return res.status(200).json({ message: 'Event rejected and deleted' });
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
      const { data, error } = await supabase
        .from('event')
        .insert([req.body])
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
