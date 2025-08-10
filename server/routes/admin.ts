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

// Route to update an event's status (approve/reject/pending)
router.patch('/events', requireAdmin, async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line no-console
    console.log('[admin.events] PATCH request body:', JSON.stringify(req.body, null, 2));

    const { eventId, status, rejection_reason, payload } = req.body as {
      eventId?: string;
      status?: 'approved' | 'rejected' | 'pending';
      rejection_reason?: string;
      payload?: Record<string, unknown>;
    };

    // eslint-disable-next-line no-console
    console.log('[admin.events] Extracted values:', { eventId, status, rejection_reason, payload });

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    // Build updateData - NEVER include rejection_reason since column doesn't exist
    let updateData: Record<string, unknown>;
    if (typeof status === 'string') {
      const validStatus = ['approved', 'rejected', 'pending'] as const;
      if (!(validStatus as readonly string[]).includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
      }
      updateData = { status };
      // eslint-disable-next-line no-console
      console.log('[admin.events] Built updateData from status (no rejection_reason column):', updateData);
    } else if (payload && typeof payload === 'object') {
      // Remove rejection_reason from payload if it exists since column doesn't exist
      const { rejection_reason: _omit, ...safePayload } = payload as any;
      updateData = safePayload;
      // eslint-disable-next-line no-console
      console.log('[admin.events] Built updateData from payload (removed rejection_reason):', updateData);
    } else {
      return res.status(400).json({ message: 'Event update payload is required.' });
    }

    // eslint-disable-next-line no-console
    console.log('[admin.events] Final updateData before DB call:', updateData);

    const { error } = await supabaseAdmin
      .from('event')
      .update(updateData)
      .eq('id', eventId);

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[admin.events] Database update error:', error);
      throw error;
    }

    // eslint-disable-next-line no-console
    console.log('[admin.events] Event status updated successfully');

    // Best-effort log of admin activity (do not fail request if logging fails)
    if (status === 'approved' || status === 'rejected') {
      const { error: logError } = await supabaseAdmin.rpc('log_admin_activity', {
        action: `event.${status}`,
        target_entity: 'event',
        target_id: eventId,
        details: {
          rejection_reason: status === 'rejected' ? rejection_reason : undefined,
        },
      });
      if (logError) {
        // eslint-disable-next-line no-console
        console.error('Failed to log admin activity:', logError);
      }
    }

    // Return minimal, safe payload
    res.status(200).json({ id: eventId, status, ...(status === 'rejected' ? { rejection_reason } : {}) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get users (with simple paging/filtering). Falls back if RPC is missing.
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role = 'all', status = 'all', search = '', page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string, 10) || 10, 1), 100);
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    // Try RPC first
    const rpc = await supabaseAdmin.rpc('get_all_users');
    let rows: any[] | null = null;
    if (!rpc.error && rpc.data) {
      rows = rpc.data as any[];
    } else {
      // Fallback: union from role-specific tables if they exist
      // Note: adjust table/column names to match your schema
      const candidates: any[] = [];
      const adds: Array<Promise<void>> = [];
      const pushRows = (data: any[] | null | undefined, roleName: string) => {
        (data || []).forEach((r: any) => candidates.push({
          id: r.id,
          name: r.name ?? r.full_name ?? null,
          email: r.email,
          role: roleName,
          status: r.status ?? 'active',
          created_at: r.created_at,
        }));
      };
      adds.push((async () => {
        const { data } = await supabaseAdmin.from('students').select('id,name,email,status,created_at');
        pushRows(data, 'student');
      })());
      adds.push((async () => {
        const { data } = await supabaseAdmin.from('societies').select('id,name,email,status,created_at');
        pushRows(data, 'society');
      })());
      adds.push((async () => {
        const { data } = await supabaseAdmin.from('partners').select('id,name,email,status,created_at');
        pushRows(data, 'partner');
      })());
      adds.push((async () => {
        const { data } = await supabaseAdmin.from('admins').select('id,name,email,status,created_at');
        pushRows(data, 'admin');
      })());
      await Promise.all(adds);
      rows = candidates;
    }

    // Filtering
    let filtered = rows || [];
    if (role !== 'all') filtered = filtered.filter(r => r.role === role);
    if (status !== 'all') filtered = filtered.filter(r => r.status === status);
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(r => (r.email?.toLowerCase().includes(q) || r.name?.toLowerCase().includes(q)));
    }

    const count = filtered.length;
    const data = filtered.slice(from, to + 1);
    res.status(200).json({ data, count, page: pageNum, limit: pageSize });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get dashboard chart data
router.get('/dashboard', requireAdmin, async (req: Request, res: Response) => {
    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 7;
        const { data, error } = await supabaseAdmin.rpc('get_daily_event_submission_counts', { days_limit: days });
        if (!error && data) {
          return res.status(200).json(data);
        }
        // Fallback: compute counts per day from events created_at
        const since = new Date();
        since.setDate(since.getDate() - days + 1);
        const { data: events, error: eventsError } = await supabaseAdmin
          .from('event')
          .select('created_at')
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: true });
        if (eventsError) throw eventsError;
        const map = new Map<string, number>();
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          map.set(key, 0);
        }
        (events || []).forEach((e: any) => {
          const key = new Date(e.created_at).toISOString().slice(0, 10);
          if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
        });
        const result = Array.from(map.entries()).map(([submission_date, count]) => ({ submission_date, count }));
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Recent admin activity
router.get('/activity', requireAdmin, async (_req: Request, res: Response) => {
  try {
    // Fetch recent logs without joining to users to avoid schema relationship issues
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('admin_activity_log')
      .select('id,created_at,action,target_entity,target_id,details,user_id')
      .order('created_at', { ascending: false })
      .limit(10);
    if (logsError) throw logsError;

    const userIds = Array.from(new Set((logs || []).map(l => l.user_id).filter(Boolean))) as string[];
    const emailsById = new Map<string, string>();
    if (userIds.length > 0) {
      // Use Supabase Admin API to fetch users by ID (avoids schema relationship issues)
      await Promise.all(
        userIds.map(async (id) => {
          try {
            const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
            if (!error && data?.user) {
              emailsById.set(id, (data.user.email as string) || 'Unknown User');
            }
          } catch (_e) {
            // ignore individual lookup failures
          }
        })
      );
    }

    const formatted = (logs || []).map((log: any) => ({
      id: log.id,
      created_at: log.created_at,
      action: log.action,
      target_entity: log.target_entity,
      target_id: log.target_id,
      details: log.details,
      user_email: (log.user_id && emailsById.get(log.user_id)) || 'Unknown User',
    }));

    res.status(200).json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Settings handlers: GET returns settings, PATCH updates
router.get('/settings', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_or_create_platform_settings');
    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const payload = (req.body as any)?.config;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ message: 'Invalid settings payload' });
    }
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('platform_settings')
      .select('*')
      .eq('key', 'platform')
      .single();
    if (fetchError && (fetchError as any).code !== 'PGRST116') throw fetchError;

    let data, error;
    if (!existing) {
      ({ data, error } = await supabaseAdmin
        .from('platform_settings')
        .insert({ key: 'platform', config: payload })
        .select()
        .single());
    } else {
      ({ data, error } = await supabaseAdmin
        .from('platform_settings')
        .update({ config: payload })
        .eq('key', 'platform')
        .select()
        .single());
    }
    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// System tools: GET health, POST clear cache, PATCH export data
router.get('/system', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { error } = await supabaseAdmin.from('event').select('id').limit(1);
    if (error) throw error;
    res.status(200).json({ api: 'healthy', db: 'healthy', ts: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ api: 'degraded', db: 'degraded', message: error.message });
  }
});

router.post('/system', requireAdmin, async (_req: Request, res: Response) => {
  try {
    // no-op placeholder for cache clear
    res.status(200).json({ message: 'Cache cleared' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/system', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { data: events } = await supabaseAdmin.from('event').select('*').limit(1000);
    const { data: deals } = await supabaseAdmin.from('deals').select('*').limit(1000);
    const payload = { exported_at: new Date().toISOString(), events, deals };
    res.status(200).json(payload);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Deals: update status
router.patch('/deals', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { dealId, payload } = req.body;
    if (!dealId || !payload) {
      return res.status(400).json({ message: 'Deal ID and payload are required.' });
    }
    const { data, error } = await supabaseAdmin
      .from('deals')
      .update(payload)
      .eq('id', dealId)
      .select()
      .single();
    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
