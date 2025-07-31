import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './_utils';
import { supabase } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  const corsResult = handleCors(req, res);
  if (corsResult) return corsResult;

  const { method, query } = req;
  const { resource, action, id } = query;

  try {
    // Route to appropriate handler based on resource
    switch (resource) {
      case 'events':
        return await handleEvents(req, res, supabase, action as string, id as string);
      case 'societies':
        return await handleSocieties(req, res, supabase, action as string, id as string);
      case 'users':
        return await handleUsers(req, res, supabase, action as string, id as string);
      case 'rsvps':
        return await handleRSVPs(req, res, supabase, action as string, id as string);
      case 'login':
        return await handleLogin(req, res, supabase);
      default:
        return res.status(404).json({ error: 'Resource not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Events handlers
async function handleEvents(req: VercelRequest, res: VercelResponse, supabase: any, action?: string, id?: string) {
  const { method } = req;

  if (action === 'pending' && method === 'GET') {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (action === 'society' && method === 'GET') {
    const { societyId, status } = req.query;
    
    let query = supabase
      .from('events')
      .select('*')
      .eq('society_id', societyId);
    
    // Filter by status if not 'all'
    if (status !== 'all') {
      if (status === 'approved') {
        query = query.eq('approved', true);
      } else if (status === 'pending') {
        query = query.eq('approved', false);
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (action === 'by-date' && method === 'GET') {
    const { date } = req.query;
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('approved', true)
      .gte('event_date', date)
      .lte('event_date', `${date}T23:59:59`)
      .order('event_date', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (action === 'approve' && method === 'POST' && id) {
    const { data, error } = await supabase
      .from('events')
      .update({ approved: true })
      .eq('id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (action === 'reject' && method === 'POST' && id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Event rejected and deleted' });
  }

  // Default events CRUD
  if (method === 'GET') {
    if (id) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    } else {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('approved', true)
        .order('event_date', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('events')
      .insert([req.body])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (method === 'PUT' && id) {
    const { data, error } = await supabase
      .from('events')
      .update(req.body)
      .eq('id', id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (method === 'DELETE' && id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Event deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Societies handlers
async function handleSocieties(req: VercelRequest, res: VercelResponse, supabase: any, action?: string, id?: string) {
  const { method } = req;

  if (method === 'GET') {
    if (id) {
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    } else {
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .order('name', { ascending: true });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('societies')
      .insert([req.body])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (method === 'PUT' && id) {
    const { data, error } = await supabase
      .from('societies')
      .update(req.body)
      .eq('id', id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (method === 'DELETE' && id) {
    const { error } = await supabase
      .from('societies')
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
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    } else {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('users')
      .insert([req.body])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (method === 'PUT' && id) {
    const { data, error } = await supabase
      .from('users')
      .update(req.body)
      .eq('id', id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (method === 'DELETE' && id) {
    const { error } = await supabase
      .from('users')
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
        .from('rsvps')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    } else {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }
  }

  if (method === 'POST') {
    const { data, error } = await supabase
      .from('rsvps')
      .insert([req.body])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  if (method === 'PUT' && id) {
    const { data, error } = await supabase
      .from('rsvps')
      .update(req.body)
      .eq('id', id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  if (method === 'DELETE' && id) {
    const { error } = await supabase
      .from('rsvps')
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
        tableName = 'users';
        break;
      case 'society':
        tableName = 'societies';
        break;
      case 'organization':
        tableName = 'organizations';
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
