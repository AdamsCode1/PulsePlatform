-- This migration creates a database function to get a unified list of all users
-- with their assigned roles (student, society, or partner).

CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        -- Use COALESCE to get the name from the first available profile table, or default to email
        COALESCE(soc.name, p.name, stu.first_name || ' ' || stu.last_name, u.email) as name,
        -- Determine the role based on which profile table has a matching user_id
        CASE
            WHEN (u.app_metadata->>'role' = 'admin') THEN 'admin'
            WHEN soc.id IS NOT NULL THEN 'society'
            WHEN p.id IS NOT NULL THEN 'partner'
            WHEN stu.id IS NOT NULL THEN 'student'
            ELSE 'user' -- A user that has signed up but not completed profile creation
        END as role,
        u.created_at
    FROM
        auth.users u
    LEFT JOIN
        public.society soc ON u.id = soc.user_id
    LEFT JOIN
        public.partners p ON u.id = p.user_id
    LEFT JOIN
        public.student stu ON u.id = stu.user_id
    ORDER BY
        u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
