-- Create early access signups table
CREATE TABLE early_access_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_type TEXT CHECK (user_type IN ('student', 'society', 'partner')) DEFAULT 'student',
  signup_date TIMESTAMP DEFAULT NOW(),
  referral_code TEXT UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)),
  referred_by TEXT REFERENCES early_access_signups(referral_code),
  launched BOOLEAN DEFAULT FALSE,
  created_account BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for referral lookups
CREATE INDEX idx_early_access_referral_code ON early_access_signups(referral_code);
CREATE INDEX idx_early_access_email ON early_access_signups(email);

-- Create RLS policies
ALTER TABLE early_access_signups ENABLE ROW LEVEL SECURITY;

-- Allow public to insert signups
CREATE POLICY "Allow public signup insertion" ON early_access_signups
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow reading own signup by email (for checking existing signups)
CREATE POLICY "Allow reading own signup" ON early_access_signups
  FOR SELECT TO anon
  USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON early_access_signups
  FOR ALL TO service_role
  USING (true);
