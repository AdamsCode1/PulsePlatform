-- Admin User Creation SQL Script
-- Run this in your Supabase SQL Editor

-- First, check if the user already exists
-- Replace 'admin@dupulse.co.uk' with your desired admin email

-- Method 1: If you already have a user and want to make them admin
UPDATE auth.users 
SET app_metadata = jsonb_set(
  COALESCE(app_metadata, '{}'),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@dupulse.co.uk';

-- Method 2: If you need to create a new user with admin role
-- (This requires using Supabase Auth API - use the JavaScript script instead)

-- Verify the admin user was created/updated correctly
SELECT 
  id,
  email,
  app_metadata,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'admin@dupulse.co.uk';

-- Expected result should show:
-- app_metadata: {"role": "admin"}
