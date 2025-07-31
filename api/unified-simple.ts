import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Simple Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== SIMPLIFIED UNIFIED API START ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);

  try {
    // Basic CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const { resource, action, id } = req.query;

    // Test societies endpoint
    if (resource === 'societies' && req.method === 'GET') {
      console.log('Fetching societies...');
      
      const { data, error } = await supabase
        .from('society')
        .select('*')
        .order('name', { ascending: true });
      
      console.log('Societies result:', { data, error, count: data?.length });
      
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message, details: error });
      }
      
      return res.status(200).json(data);
    }

    // Test events endpoint
    if (resource === 'events') {
      if (action === 'by-date' && req.method === 'GET') {
        const { date } = req.query;
        console.log('Fetching events by date:', date);
        
        const { data, error } = await supabase
          .from('event')
          .select('*')
          .eq('status', 'approved')
          .gte('start_time', `${date}T00:00:00`)
          .lte('start_time', `${date}T23:59:59`)
          .order('start_time', { ascending: true });

        console.log('Events by date result:', { data, error, count: data?.length });
        
        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: error.message, details: error });
        }
        
        return res.status(200).json(data);
      }
      
      // Default events
      if (req.method === 'GET') {
        console.log('Fetching all events...');
        
        const { data, error } = await supabase
          .from('event')
          .select('*')
          .eq('status', 'approved')
          .order('start_time', { ascending: true });
        
        console.log('All events result:', { data, error, count: data?.length });
        
        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: error.message, details: error });
        }
        
        return res.status(200).json(data);
      }
    }

    return res.status(404).json({ error: 'Resource not found' });
    
  } catch (error) {
    console.error('=== API ERROR ===');
    console.error('Error message:', error?.message || 'Unknown error');
    console.error('Error stack:', error?.stack || 'No stack trace');
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error?.message || 'Unknown error'
    });
  }
}
