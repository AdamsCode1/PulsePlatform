-- Add rejection_reason column to event table
-- This column is optional and only used when an event is rejected

ALTER TABLE public.event 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add a comment to explain the column's purpose
COMMENT ON COLUMN public.event.rejection_reason IS 'Optional reason provided when an event is rejected by an admin';

-- Create an index for better performance when filtering by rejection reason
CREATE INDEX IF NOT EXISTS idx_event_rejection_reason ON public.event(rejection_reason) 
WHERE rejection_reason IS NOT NULL;
