-- Migration: Add event status and lifecycle management
-- Created: 2025-01-30

-- 1. Create event_status enum if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- 2. The table is already created with the correct status field, so we skip column modifications

-- 3. Additional RLS policies specific to status management
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can approve/reject events' AND tablename = 'event') THEN
        CREATE POLICY "Admins can approve/reject events" ON public.event
            FOR UPDATE USING (
                -- This would be where admin check logic goes
                auth.jwt() ->> 'email' IN (
                    SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
                )
            );
    END IF;
END $$;

-- 4. Function to handle status reset on event updates (already created in base migration)
-- Trigger already exists in base migration

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_status ON public.event(status);
CREATE INDEX IF NOT EXISTS idx_event_society_id ON public.event(society_id);
CREATE INDEX IF NOT EXISTS idx_event_start_time ON public.event(start_time);

-- 5. Create RLS policy for societies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Society owns event row" ON event;
CREATE POLICY "Society owns event row"
  ON event
  FOR ALL
  USING (auth.uid() = society_id::uuid)
  WITH CHECK (auth.uid() = society_id::uuid);

-- 6. Create trigger function to reset status when approved event is edited
CREATE OR REPLACE FUNCTION reset_status_on_edit()
RETURNS trigger AS $$
BEGIN
  -- Only reset if the event was approved and content changed
  IF (OLD.status = 'approved' AND (
    OLD.name != NEW.name OR 
    COALESCE(OLD.description, '') != COALESCE(NEW.description, '') OR 
    OLD.start_time != NEW.start_time OR 
    OLD.end_time != NEW.end_time OR 
    OLD.location != NEW.location OR 
    COALESCE(OLD.category, '') != COALESCE(NEW.category, '')
  )) THEN
    NEW.status := 'pending';
  END IF;
  
  -- Always update the updated_at timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger (drop and recreate to avoid conflicts)
DROP TRIGGER IF EXISTS trg_reset_status ON event;
CREATE TRIGGER trg_reset_status
  BEFORE UPDATE ON event
  FOR EACH ROW
  EXECUTE PROCEDURE reset_status_on_edit();
