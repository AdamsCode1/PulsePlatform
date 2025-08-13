-- Add name and join_whatsapp columns to early_access_signups table

-- Add the name column
ALTER TABLE early_access_signups 
ADD COLUMN name TEXT;

-- Add the join_whatsapp column
ALTER TABLE early_access_signups 
ADD COLUMN join_whatsapp BOOLEAN DEFAULT FALSE;

-- Update existing records to have a default name if needed
-- (This is safe since we currently have no records)
