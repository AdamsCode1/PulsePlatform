import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../_utils';
import { supabase, supabaseSchema } from '../_supabase';

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

// GET /api/societies/[id]
const handleGetSocietyById = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ message: 'Society ID is required' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'societies' : `${supabaseSchema}.societies`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'Society not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[GET /api/societies/[id]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve society.' });
  }
};

// PUT /api/societies/[id]
const handleUpdateSociety = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ message: 'Society ID is required' });
      return;
    }
    
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
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'Society not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[PUT /api/societies/[id]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not update society.' });
  }
};

// DELETE /api/societies/[id]
const handleDeleteSociety = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ message: 'Society ID is required' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'societies' : `${supabaseSchema}.societies`;
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    res.status(204).end();
  } catch (error: any) {
    console.error(`[DELETE /api/societies/[id]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not delete society.' });
  }
};

export default createHandler({
  GET: handleGetSocietyById,
  PUT: handleUpdateSociety,
  DELETE: handleDeleteSociety
});
