-- This migration creates a helper function to log admin activities.

CREATE OR REPLACE FUNCTION public.log_admin_activity(
    action TEXT,
    target_entity TEXT,
    target_id UUID,
    details JSONB
)
RETURNS void AS $$
BEGIN
    -- This function inserts a record into the admin_activity_log table.
    -- It runs with the privileges of the user that created it (the superuser),
    -- allowing it to bypass the restrictive RLS policies on the log table.
    INSERT INTO public.admin_activity_log (user_id, action, target_entity, target_id, details)
    VALUES (auth.uid(), action, target_entity, target_id, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment to describe the function's purpose
COMMENT ON FUNCTION public.log_admin_activity IS 'A security definer function to log an administrator''s action in the admin_activity_log table.';
