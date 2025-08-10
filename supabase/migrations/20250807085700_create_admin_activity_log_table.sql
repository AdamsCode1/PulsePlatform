-- This migration creates the admin_activity_log table to track admin actions.

-- 1. Create the admin_activity_log table
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_entity TEXT,
    target_id UUID,
    details JSONB,
    CONSTRAINT "check_action_format" CHECK (action ~ '^[a-z_]+\.[a-z_]+$')
);

-- 2. Add comments to the columns for clarity
COMMENT ON COLUMN public.admin_activity_log.user_id IS 'The ID of the admin user who performed the action.';
COMMENT ON COLUMN public.admin_activity_log.action IS 'The type of action performed, e.g., "event.approved" or "user.suspended".';
COMMENT ON COLUMN public.admin_activity_log.target_entity IS 'The type of entity that was affected, e.g., "event", "user", "society".';
COMMENT ON COLUMN public.admin_activity_log.target_id IS 'The UUID of the affected entity.';
COMMENT ON COLUMN public.admin_activity_log.details IS 'A JSON object for storing extra information about the action.';


-- 3. Enable Row Level Security (RLS) on the new table
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for the admin_activity_log table
-- Admins should be able to view all activity logs.
CREATE POLICY "Admin can view activity logs" ON public.admin_activity_log
    FOR SELECT
    TO authenticated
    USING (is_admin()); -- Assumes the is_admin() function exists

-- No one should be able to update or delete logs directly.
-- Inserts will be handled by a SECURITY DEFINER function.
CREATE POLICY "Block all updates and deletes" ON public.admin_activity_log
    FOR ALL
    TO public
    USING (false);

-- 5. Create an index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON public.admin_activity_log(created_at DESC);

-- 6. Create an index on user_id for filtering by admin
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_user_id ON public.admin_activity_log(user_id);
