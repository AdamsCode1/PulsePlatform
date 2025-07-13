import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase, supabaseSchema } from '../lib/supabase';

const router = Router();

// Society type matching Supabase schema
interface Society {
  id: string;
  created_at: string;
  name: string;
  contact_email: string;
}

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

// GET /societies - get all societies
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'society' : `${supabaseSchema}.society`;
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not fetch societies.' });
  }
});

// GET /societies/:id - get one society
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'society' : `${supabaseSchema}.society`;
    const { data, error } = await supabase.from(tableName).select('*').eq('id', req.params.id).single();
    if (error) {
      res.status(404).json({ message: 'Society not found' });
      return;
    }
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not read society.' });
  }
});

// POST /societies - add a new society
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, contact_email, created_at } = req.body;
    if (!name || !contact_email) {
      res.status(400).json({ message: 'Missing required fields.' });
      return;
    }
    if (!isNonEmptyString(name)) {
      res.status(400).json({ message: 'Invalid or missing name. It must be a non-empty string.' });
      return;
    }
    if (!isNonEmptyString(contact_email) || !isValidEmail(contact_email)) {
      res.status(400).json({ message: 'Invalid or missing contact_email. It must be a valid email address.' });
      return;
    }
    let createdAt = created_at ? parseAndValidateUTCDate(created_at) : new Date().toISOString();
    if (!createdAt) {
      res.status(400).json({ message: 'Invalid created_at date format. Use ISO 8601 (UTC).' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    // Duplicate checks
    const tableName = supabaseSchema === 'public' ? 'society' : `${supabaseSchema}.society`;
    const { data: existing, error: selectError } = await supabase.from(tableName).select('*').or(`name.eq.${name},contact_email.eq.${contact_email}`);
    if (selectError) throw new Error(selectError.message);
    if (existing && existing.length > 0) {
      if (existing.some((s: any) => s.name === name)) {
        res.status(409).json({ message: 'Duplicate name. This name is already in use.' });
        return;
      }
      if (existing.some((s: any) => s.contact_email === contact_email)) {
        res.status(409).json({ message: 'Duplicate contact_email. This email is already in use.' });
        return;
      }
    }
    const id = uuidv4();
    const { error } = await supabase.from(tableName).insert([{ id, created_at: createdAt, name, contact_email }]);
    if (error) throw new Error(error.message);
    res.status(201).json({ id, created_at: createdAt, name, contact_email });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not add society.' });
  }
});

// PUT /societies/:id - update a society
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, contact_email } = req.body;
    if (name === undefined && contact_email === undefined) {
      res.status(400).json({ message: 'At least one field (name or contact_email) must be provided.' });
      return;
    }
    if (name !== undefined && !isNonEmptyString(name)) {
      res.status(400).json({ message: 'Invalid or missing name. It must be a non-empty string.' });
      return;
    }
    if (contact_email !== undefined && (!isNonEmptyString(contact_email) || !isValidEmail(contact_email))) {
      res.status(400).json({ message: 'Invalid or missing contact_email. It must be a valid email address.' });
      return;
    }
    if (!supabase) throw new Error('Supabase client not initialized');
    // Duplicate checks (ignore current society)
    let orFilters: string[] = [];
    if (name !== undefined) orFilters.push(`name.eq.${name}`);
    if (contact_email !== undefined) orFilters.push(`contact_email.eq.${contact_email}`);
    let existing: any[] = [];
    if (orFilters.length > 0) {
      const tableName = supabaseSchema === 'public' ? 'society' : `${supabaseSchema}.society`;
      const { data, error: selectError } = await supabase.from(tableName).select('*').or(orFilters.join(","));
      if (selectError) throw new Error(selectError.message);
      existing = data || [];
    }
    if (
      (name !== undefined && existing.some((s: any) => s.id !== req.params.id && s.name === name)) ||
      (contact_email !== undefined && existing.some((s: any) => s.id !== req.params.id && s.contact_email === contact_email))
    ) {
      res.status(409).json({ message: 'Duplicate name or contact_email. This value is already in use.' });
      return;
    }
    const updates: Partial<Society> = {};
    if (name !== undefined) updates.name = name;
    if (contact_email !== undefined) updates.contact_email = contact_email;
    // Remove any undefined fields from updates
    Object.keys(updates).forEach(key => updates[key as keyof Society] === undefined && delete updates[key as keyof Society]);
    const tableName = supabaseSchema === 'public' ? 'society' : `${supabaseSchema}.society`;
    const { error } = await supabase.from(tableName).update(updates).eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.status(200).json({ id: req.params.id, ...updates });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Could not update society.' });
  }
});

// DELETE /societies/:id - delete a society
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!supabase) throw new Error('Supabase client not initialized');
    const tableName = supabaseSchema === 'public' ? 'society' : `${supabaseSchema}.society`;
    const { error } = await supabase.from(tableName).delete().eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.status(200).json({ message: 'Society deleted', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting society.' });
  }
});

export default router;
