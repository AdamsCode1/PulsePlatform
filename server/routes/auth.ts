import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, supabaseSchema } from '../lib/supabase';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// POST /api/login
router.post('/', async (req: Request, res: Response) => {
  const { email, password, type } = req.body; // type: 'society' or 'student'
  if (!email || !password || !type) {
    return res.status(400).json({ message: 'Missing email, password, or type.' });
  }
  try {
    const table = type === 'society' ? 'society' : 'user';
    const tableName = supabaseSchema === 'public' ? table : `${supabaseSchema}.${table}`;
    const { data, error } = await supabase.from(tableName).select('*').eq('email', email).single();
    if (error || !data) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Password check
    if (!data.password_hash || !bcrypt.compareSync(password, data.password_hash)) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Issue JWT
    const token = jwt.sign({ id: data.id, type }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: data.id, email: data.email, name: data.name, type } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.' });
  }
});

export default router;
