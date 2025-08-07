import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

// This is a secure, server-side only file.
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const requireAdmin = async (req: Request, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token not provided.' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    if (user.app_metadata?.role !== 'admin') {
      return res.status(403).json({ message: 'You must be an admin to perform this action.' });
    }

    // Attach user to request object for use in subsequent handlers
    (req as any).user = user;
    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const router = Router();

// Route to update an event's status
router.patch('/events', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { eventId, payload } = req.body;
    if (!eventId || !payload) {
      return res.status(400).json({ message: 'Event ID and payload are required.' });
    }

    const { data, error } = await supabaseAdmin
      .from('event')
      .update(payload)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get all users
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin.rpc('get_all_users');
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get dashboard chart data
router.get('/dashboard', requireAdmin, async (req: Request, res: Response) => {
    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 7;
        const { data, error } = await supabaseAdmin.rpc('get_daily_event_submission_counts', { days_limit: days });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
