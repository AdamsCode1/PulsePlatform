-- This migration creates a database function to get the daily count of event submissions
-- for a specified number of past days. This is useful for dashboard charts.

CREATE OR REPLACE FUNCTION get_daily_event_submission_counts(days_limit INT)
RETURNS TABLE (submission_date DATE, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(created_at) AS submission_date,
        COUNT(*) AS count
    FROM
        public.event
    WHERE
        created_at >= NOW() - (days_limit || ' days')::INTERVAL
    GROUP BY
        DATE(created_at)
    ORDER BY
        DATE(created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
