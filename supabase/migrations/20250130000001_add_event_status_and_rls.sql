-- Migration: Add event status and lifecycle management
-- Created: 2025-01-30

-- 1. Create event_status enum if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- 2. Add updated_at column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event' AND column_name = 'updated_at') THEN
        ALTER TABLE event ADD COLUMN updated_at timestamptz DEFAULT now();
        -- Update existing events to have updated_at timestamp
        UPDATE event SET updated_at = created_at WHERE updated_at IS NULL;
    END IF;
END $$;

-- 3. Modify status column to use enum type if it's currently text
DO $$ 
BEGIN 
    -- Check if status column exists and is not the enum type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'event' AND column_name = 'status' 
               AND data_type != 'USER-DEFINED') THEN
        -- Drop default constraint first
        ALTER TABLE event ALTER COLUMN status DROP DEFAULT;
        -- Convert existing status values and change column type
        UPDATE event SET status = 'approved' WHERE status IS NULL OR status = '';
        ALTER TABLE event ALTER COLUMN status TYPE event_status USING 
            CASE 
                WHEN status = 'pending' THEN 'pending'::event_status
                WHEN status = 'rejected' THEN 'rejected'::event_status 
                ELSE 'approved'::event_status
            END;
        ALTER TABLE event ALTER COLUMN status SET NOT NULL;
        ALTER TABLE event ALTER COLUMN status SET DEFAULT 'pending'::event_status;
    END IF;
END $$;

-- 4. Enable Row Level Security on event table if not already enabled
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'event' AND relrowsecurity = true) THEN
        ALTER TABLE event ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

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
