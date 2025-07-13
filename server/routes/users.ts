import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase, supabaseSchema } from '../lib/supabase';

const router = Router();
console.log('Supabase in users.ts:', !!supabase);

// Helper to read users from Supabase
type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};


// Email validation using a simple regex
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Check if a value is a non-empty string
const isNonEmptyString = (val: unknown): val is string => {
  return typeof val === 'string' && val.trim().length > 0;
};

// Helper to parse and validate ISO 8601 UTC date string
const parseAndValidateUTCDate = (val: unknown): string | undefined => {
  if (typeof val !== 'string') return undefined;
  const date = new Date(val);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

// GET /users - get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'user' : `${supabaseSchema}.user`;
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('[GET /users] Error:', error.message);
    res.status(500).json({ message: error.message || 'Could not retrieve users.' });
  }
});

// GET /users/:id - get one user
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'user' : `${supabaseSchema}.user`;
    const { data, error } = await supabase.from(tableName).select('*').eq('id', req.params.id).single();
    if (error) {
      res.status(404).json({ message: 'User not found' });
      return
    };
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not read user.' });
  }
});

// POST /users - add a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, created_at } = req.body;
    if (!name || !email) {
      res.status(400).json({ message: 'Missing required fields.' });
      return;
    }
    if (!isNonEmptyString(name)) {
      res.status(400).json({ message: 'Invalid or missing name. It must be a non-empty string.' });
      return;
    }
    if (!isNonEmptyString(email) || !isValidEmail(email)) {
      res.status(400).json({ message: 'Invalid or missing email. It must be a valid email address.' });
      return;
    }
    let createdAt = created_at ? parseAndValidateUTCDate(created_at) : new Date().toISOString();
    if (!createdAt) {
      res.status(400).json({ message: 'Invalid created_at date format. Use ISO 8601 (UTC).' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'user' : `${supabaseSchema}.user`;
    // Check for duplicates
    const { data: existingUsers, error: selectError } = await supabase.from(tableName).select('*').or(`name.eq.${name},email.eq.${email}`);
    if (selectError) throw new Error(selectError.message);
    if (existingUsers && existingUsers.length > 0) {
      if (existingUsers.some((u: any) => u.name === name)) {
        res.status(409).json({ message: 'Duplicate name. This name is already in use.' });
        return
      }
      if (existingUsers.some((u: any) => u.email === email)) {
        res.status(409).json({ message: 'Duplicate email. This email is already in use.' });
        return
      }
    }
    const id = uuidv4();
    const { error } = await supabase.from(tableName).insert([{ id, name, email, created_at: createdAt }]);
    if (error) throw new Error(error.message);
    res.status(201).json({ id, name, email, created_at: createdAt });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not add user.' });
  }
});

// PUT /users/:id - update a user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (name === undefined && email === undefined) {
      res.status(400).json({ message: 'At least one field (name or email) must be provided.' });
      return;
    }
    if (name !== undefined && !isNonEmptyString(name)) {
      res.status(400).json({ message: 'Invalid or missing name. It must be a non-empty string.' });
      return;
    }
    if (email !== undefined && (!isNonEmptyString(email) || !isValidEmail(email))) {
      res.status(400).json({ message: 'Invalid or missing email. It must be a valid email address.' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'user' : `${supabaseSchema}.user`;
    // Check for duplicates (excluding current user)
    const { data: existingUsers, error: selectError } = await supabase.from(tableName).select('*').or(`name.eq.${name},email.eq.${email}`);
    if (selectError) throw new Error(selectError.message);
    if (existingUsers && existingUsers.some((u: any) => u.id !== req.params.id && (u.name === name || u.email === email))) {
      if (existingUsers.some((u: any) => u.id !== req.params.id && u.name === name)) {
        res.status(409).json({ message: 'Duplicate name. This name is already in use.' });
        return
      }
      if (existingUsers.some((u: any) => u.id !== req.params.id && u.email === email)) {
        res.status(409).json({ message: 'Duplicate email. This email is already in use.' });
        return
      }
    }
    const updates: Partial<User> = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    const { error } = await supabase.from(tableName).update(updates).eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.status(200).json({ id: req.params.id, ...updates });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not update user.' });
  }
});

// DELETE /users/:id - delete a user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase.from(`${supabaseSchema}.user`).delete().eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.status(200).json({ message: 'User deleted', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not delete user.' });
  }
});

export default router;
