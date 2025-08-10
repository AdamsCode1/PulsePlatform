-- This migration adds a 'partners' table and updates the 'deals' table
-- to support a moderation workflow for deals submitted by partners.

-- 1. Create the 'partners' table to store information about business partners.
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    contact_email TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT,
    website_url TEXT
);

-- 2. Add a 'status' column to the 'deals' table for moderation.
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- 3. Add a 'partner_id' foreign key to the 'deals' table to link deals to partners.
ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL;

-- 4. Enable RLS for the new 'partners' table.
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- 5. Add RLS policies for the 'partners' table.
-- Drop policy if it exists to make this migration rerunnable.
DROP POLICY IF EXISTS "Partners can manage their own data" ON public.partners;
CREATE POLICY "Partners can manage their own data" ON public.partners
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage all partners" ON public.partners;
CREATE POLICY "Admin can manage all partners" ON public.partners
    FOR ALL
    TO authenticated
    USING (is_admin()); -- Assumes the is_admin() function from the previous migration exists.

-- 6. Add RLS policies for partners to manage their own deals.
DROP POLICY IF EXISTS "Partners can manage their own deals" ON public.deals;
CREATE POLICY "Partners can manage their own deals" ON public.deals
    FOR ALL
    TO authenticated
    USING (partner_id IN (
        SELECT id FROM public.partners WHERE user_id = auth.uid()
    ));

-- Also, allow authenticated users to view approved deals
DROP POLICY IF EXISTS "Anyone can view deals" ON public.deals;
CREATE POLICY "Anyone can view approved deals" ON public.deals
    FOR SELECT
    TO authenticated
    USING (status = 'approved');
