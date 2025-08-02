-- Add admin policies for full access to events and societies
-- This migration allows admin@dupulse.co.uk to view and manage all content

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admin can view all events" ON public.event;
DROP POLICY IF EXISTS "Admin can manage all events" ON public.event;
DROP POLICY IF EXISTS "Admin can view all societies" ON public.society;

-- Add admin policies for Event table
CREATE POLICY "Admin can view all events" ON public.event
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@dupulse.co.uk'
        )
    );

CREATE POLICY "Admin can manage all events" ON public.event
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@dupulse.co.uk'
        )
    );

-- Add admin policies for Society table
CREATE POLICY "Admin can view all societies" ON public.society
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@dupulse.co.uk'
        )
    );

-- Add admin policies for RSVP table (so admin can see all RSVPs)
CREATE POLICY "Admin can view all rsvps" ON public.rsvp
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@dupulse.co.uk'
        )
    );

-- Add admin policies for Student table (so admin can see all students)
CREATE POLICY "Admin can view all students" ON public.student
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@dupulse.co.uk'
        )
    );
