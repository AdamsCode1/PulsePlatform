-- This migration updates the Row Level Security (RLS) policies for admin access.
-- It replaces the insecure check for a hardcoded email with a secure, role-based check
-- using a helper function that inspects the user's app_metadata.

-- Drop the old, insecure RLS policies that checked for a specific admin email.
DROP POLICY IF EXISTS "Admin can view all societies" ON public.society;
DROP POLICY IF EXISTS "Admin can manage all events" ON public.event;
-- The "Admin can view all events" policy is redundant because "manage all" includes select.
DROP POLICY IF EXISTS "Admin can view all events" ON public.event;


-- Create a helper function to securely check if the authenticated user is an admin.
-- This function checks the 'role' claim within the user's app_metadata.
-- Using a SECURITY DEFINER function can also improve performance.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user's role is 'admin' from the JWT claims.
  -- The ->> operator extracts the value as text.
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Create new, secure RLS policies for admin access using the is_admin() helper function.

-- Policy for the 'society' table
CREATE POLICY "Admin can manage societies" ON public.society
    FOR ALL
    TO authenticated
    USING (is_admin());

-- Policy for the 'event' table
CREATE POLICY "Admin can manage events" ON public.event
    FOR ALL
    TO authenticated
    USING (is_admin());

-- Policy for the 'deals' table
CREATE POLICY "Admin can manage deals" ON public.deals
    FOR ALL
    TO authenticated
    USING (is_admin());

-- Policy for the 'student' table (representing user profiles)
CREATE POLICY "Admin can manage students" ON public.student
    FOR ALL
    TO authenticated
    USING (is_admin());

-- Policy for the 'rsvp' table
CREATE POLICY "Admin can manage rsvps" ON public.rsvp
    FOR ALL
    TO authenticated
    USING (is_admin());
