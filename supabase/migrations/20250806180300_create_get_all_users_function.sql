-- This migration creates a database function to get a unified list of all users
-- with their assigned roles (student, society, or partner).

CREATE OR REPLACE FUNCTION get_all_users(
    role_filter TEXT DEFAULT 'all',
    status_filter TEXT DEFAULT 'all',
    search_term TEXT DEFAULT ''
)
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    role TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        COALESCE(soc.name, p.name, stu.first_name || ' ' || stu.last_name, u.email) as name,
        CASE
            WHEN (u.app_metadata->>'role' = 'admin') THEN 'admin'
            WHEN soc.id IS NOT NULL THEN 'society'
            WHEN p.id IS NOT NULL THEN 'partner'
            WHEN stu.id IS NOT NULL THEN 'student'
            ELSE 'user'
        END as role,
        CASE
            WHEN u.banned_until IS NOT NULL AND u.banned_until > NOW() THEN 'suspended'
            WHEN u.email_confirmed_at IS NULL THEN 'pending_verification'
            ELSE 'active'
        END as status,
        u.created_at
    FROM
        auth.users u
    LEFT JOIN
        public.society soc ON u.id = soc.user_id
    LEFT JOIN
        public.partners p ON u.id = p.user_id
    LEFT JOIN
        public.student stu ON u.id = stu.user_id
    WHERE
        (role_filter = 'all' OR (
            CASE
                WHEN (u.app_metadata->>'role' = 'admin') THEN 'admin'
                WHEN soc.id IS NOT NULL THEN 'society'
                WHEN p.id IS NOT NULL THEN 'partner'
                WHEN stu.id IS NOT NULL THEN 'student'
                ELSE 'user'
            END
        ) = role_filter)
    AND
        (status_filter = 'all' OR (
            CASE
                WHEN u.banned_until IS NOT NULL AND u.banned_until > NOW() THEN 'suspended'
                WHEN u.email_confirmed_at IS NULL THEN 'pending_verification'
                ELSE 'active'
            END
        ) = status_filter)
    AND
        (search_term = '' OR
         u.email ILIKE '%' || search_term || '%' OR
         COALESCE(soc.name, p.name, stu.first_name || ' ' || stu.last_name) ILIKE '%' || search_term || '%'
        )
    ORDER BY
        u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
