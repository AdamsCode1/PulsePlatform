import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from './_utils';
import { supabase, supabaseSchema } from './_supabase';
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

// Helper to get path segments
const getPathSegments = (req: VercelRequest): string[] => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  return url.pathname.split('/').filter(Boolean).slice(1); // Remove 'api' prefix
};

// GET /api/users
const handleGetUsers = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'users' : `${supabaseSchema}.users`;
    
    let query = supabase.from(tableName).select('*');
    
    // Filter by user_type if provided
    if (req.query.user_type) {
      query = query.eq('user_type', req.query.user_type);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /api/users] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve users.' });
  }
};

// POST /api/users
const handleCreateUser = async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { name, email, user_type } = req.body;
    
    // Validation
    if (!isNonEmptyString(name)) {
      res.status(400).json({ message: 'Name is required and must be a non-empty string.' });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ message: 'Email is required and must be a valid email address.' });
      return;
    }
    if (!['student', 'society', 'organization'].includes(user_type)) {
      res.status(400).json({ message: 'User type must be one of: student, society, organization.' });
      return;
    }
    
    const newUser: Omit<User, 'created_at' | 'updated_at'> = {
      id: uuidv4(),
      name,
      email,
      user_type,
    };
    
    const tableName = supabaseSchema === 'public' ? 'users' : `${supabaseSchema}.users`;
    const { data, error } = await supabase
      .from(tableName)
      .insert([newUser])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    res.status(201).json(data);
  } catch (error: any) {
    console.error('[POST /api/users] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not create user.' });
  }
};

// Handle dynamic routes
const handleDynamicRoute = async (req: VercelRequest, res: VercelResponse) => {
  const pathSegments = getPathSegments(req);
  const userId = pathSegments[1]; // users/[id]
  
  if (!userId) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }
  
  switch (req.method) {
    case 'GET':
      return handleGetUserById(req, res, userId);
    case 'PUT':
      return handleUpdateUser(req, res, userId);
    case 'DELETE':
      return handleDeleteUser(req, res, userId);
    default:
      res.status(405).json({ message: `Method ${req.method} not allowed` });
      return;
  }
};

// GET /api/users/[id]
const handleGetUserById = async (req: VercelRequest, res: VercelResponse, userId: string) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'users' : `${supabaseSchema}.users`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[GET /api/users/${userId}] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve user.' });
  }
};

// PUT /api/users/[id]
const handleUpdateUser = async (req: VercelRequest, res: VercelResponse, userId: string) => {
  try {
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
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    if (!data) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error: any) {
    console.error(`[PUT /api/users/${userId}] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not update user.' });
  }
};

// DELETE /api/users/[id]
const handleDeleteUser = async (req: VercelRequest, res: VercelResponse, userId: string) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'users' : `${supabaseSchema}.users`;
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', userId);
    
    if (error) throw new Error(error.message);
    res.status(204).end();
  } catch (error: any) {
    console.error(`[DELETE /api/users/${userId}] Error:`, error.message);
    res.status(500).json({ message: error.message || 'Could not delete user.' });
  }
};

// Main handler for /api/users base routes
export default createHandler({
  GET: async (req: VercelRequest, res: VercelResponse) => {
    // GET /api/users
    return handleGetUsers(req, res);
  },
  POST: async (req: VercelRequest, res: VercelResponse) => {
    // POST /api/users
    return handleCreateUser(req, res);
  }
});
