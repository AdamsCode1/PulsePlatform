-- Add rejection_reason column to events table
-- This migration only adds the missing column without any policies or other changes

ALTER TABLE public.event 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
