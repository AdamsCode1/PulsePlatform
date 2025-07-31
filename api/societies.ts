import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from './_utils';
import { supabase, supabaseSchema } from './_supabase';
import { v4 as uuidv4 } from 'uuid';

// Society type matching Supabase schema
interface Society {
  id: string;
  created_at: string;
  name: string;
  description?: string;
  email: string;
  contact_person?: string;
  contact_email?: string;
  updated_at?: string;
}

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && val.trim().length > 0;
const isValidEmail = (val: unknown): val is string => {
  return typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
};

// Helper to get path segments
const getPathSegments = (req: VercelRequest): string[] => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  return url.pathname.split('/').filter(Boolean).slice(1); // Remove 'api' prefix
};

// GET /api/societies
const handleGetSocieties = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'societies' : `${supabaseSchema}.societies`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /api/societies] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve societies.' });
  }
};

// POST /api/societies
const handleCreateSociety = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { name, description, email, contact_person, contact_email } = req.body;
    
    // Validation
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: 'Name is required and must be a non-empty string.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Email is required and must be a valid email address.' });
    }
    if (contact_email && !isValidEmail(contact_email)) {
      return res.status(400).json({ message: 'Contact email must be a valid email address if provided.' });
    }
    
    const newSociety: Omit<Society, 'created_at' | 'updated_at'> = {
      id: uuidv4(),
      name,
      description: description || null,
      email,
      contact_person: contact_person || null,
      contact_email: contact_email || null,
    };
    
    const tableName = supabaseSchema === 'public' ? 'societies' : `${supabaseSchema}.societies`;
    const { data, error } = await supabase
      .from(tableName)
      .insert([newSociety])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    res.status(201).json(data);
  } catch (error: any) {
    console.error('[POST /api/societies] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not create society.' });
  }
};

// Handle dynamic routes
const handleDynamicRoute = async (req: VercelRequest, res: VercelResponse) => {
  const pathSegments = getPathSegments(req);
  const societyId = pathSegments[1]; // societies/[id]
  
  if (!societyId) {
    res.status(400).json({ message: 'Society ID is required' });
    return;
  }
  
  switch (req.method) {
    case 'GET':
      return handleGetSocietyById(req, res, societyId);
    case 'PUT':
      return handleUpdateSociety(req, res, societyId);
    case 'DELETE':
      return handleDeleteSociety(req, res, societyId);
    default:
      res.status(405).json({ message: `Method ${req.method} not allowed` });
      return;
  }
};

// GET /api/societies/[id]
const handleGetSocietyById = async (req: VercelRequest, res: VercelResponse, societyId: string) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'societies' : `${supabaseSchema}.societies`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', societyId)
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'Society not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[GET /api/societies/${societyId}] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve society.' });
  }
};

// PUT /api/societies/[id]
const handleUpdateSociety = async (req: VercelRequest, res: VercelResponse, societyId: string) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { name, description, email, contact_person, contact_email } = req.body;
    const updates: Partial<Society> = { updated_at: new Date().toISOString() };
    
    // Validation and updates
    if (name !== undefined) {
      if (!isNonEmptyString(name)) {
        res.status(400).json({ message: 'Name must be a non-empty string.' });
        return;
      }
      updates.name = name;
    }
    
    if (description !== undefined) {
      updates.description = description;
    }
    
    if (email !== undefined) {
      if (!isValidEmail(email)) {
        res.status(400).json({ message: 'Email must be a valid email address.' });
        return;
      }
      updates.email = email;
    }
    
    if (contact_person !== undefined) {
      updates.contact_person = contact_person;
    }
    
    if (contact_email !== undefined) {
      if (contact_email && !isValidEmail(contact_email)) {
        res.status(400).json({ message: 'Contact email must be a valid email address if provided.' });
        return;
      }
      updates.contact_email = contact_email;
    }
    
    const tableName = supabaseSchema === 'public' ? 'societies' : `${supabaseSchema}.societies`;
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', societyId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'Society not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[PUT /api/societies/${societyId}] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not update society.' });
  }
};

// DELETE /api/societies/[id]
const handleDeleteSociety = async (req: VercelRequest, res: VercelResponse, societyId: string) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'societies' : `${supabaseSchema}.societies`;
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', societyId);
    
    if (error) throw new Error(error.message);
    res.status(204).end();
  } catch (error: any) {
    console.error(`[DELETE /api/societies/${societyId}] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not delete society.' });
  }
};

// Main handler for /api/societies base routes
export default createHandler({
  GET: async (req: VercelRequest, res: VercelResponse) => {
    // GET /api/societies
    return handleGetSocieties(req, res);
  },
  POST: async (req: VercelRequest, res: VercelResponse) => {
    // POST /api/societies
    return handleCreateSociety(req, res);
  }
});
