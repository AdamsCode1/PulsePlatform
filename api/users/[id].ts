import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from '../_utils';
import { supabase, supabaseSchema } from '../_supabase';
import { v4 as uuidv4 } from 'uuid';

// User type matching Supabase schema
interface User {
  id: string;
  created_at: string;
  name: string;
  email: string;
  user_type: 'student' | 'society' | 'organization';
  updated_at?: string;
}

const isNonEmptyString = (val: unknown): val is string => typeof val === 'string' && val.trim().length > 0;
const isValidEmail = (val: unknown): val is string => {
  return typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
};

// GET /api/users/[id]
const handleGetUserById = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'users' : `${supabaseSchema}.users`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[GET /api/users/[id]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve user.' });
  }
};

// PUT /api/users/[id]
const handleUpdateUser = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { name, email, user_type } = req.body;
    const updates: Partial<User> = { updated_at: new Date().toISOString() };
    
    // Validation and updates
    if (name !== undefined) {
      if (!isNonEmptyString(name)) {
        res.status(400).json({ message: 'Name must be a non-empty string.' });
        return;
      }
      updates.name = name;
    }
    
    if (email !== undefined) {
      if (!isValidEmail(email)) {
        res.status(400).json({ message: 'Email must be a valid email address.' });
        return;
      }
      updates.email = email;
    }
    
    if (user_type !== undefined) {
      if (!['student', 'society', 'organization'].includes(user_type)) {
        res.status(400).json({ message: 'User type must be one of: student, society, organization.' });
        return;
      }
      updates.user_type = user_type;
    }
    
    const tableName = supabaseSchema === 'public' ? 'users' : `${supabaseSchema}.users`;
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[PUT /api/users/[id]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not update user.' });
  }
};

// DELETE /api/users/[id]
const handleDeleteUser = async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'users' : `${supabaseSchema}.users`;
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
    res.status(204).end();
  } catch (error: any) {
    console.error(`[DELETE /api/users/[id]] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not delete user.' });
  }
};

export default createHandler({
  GET: handleGetUserById,
  PUT: handleUpdateUser,
  DELETE: handleDeleteUser
});
