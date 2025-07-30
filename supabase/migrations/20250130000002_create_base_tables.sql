-- Create society table and other missing tables for the application
-- This migration sets up the basic database structure

-- Society table
CREATE TABLE IF NOT EXISTS public.society (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    contact_email TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT,
    website_url TEXT
);

-- Event table (update to match the interface in the code)
CREATE TABLE IF NOT EXISTS public.event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    category TEXT,
    society_id UUID REFERENCES public.society(id) ON DELETE CASCADE,
    signup_link TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    attendee_count INTEGER DEFAULT 0,
    image_url TEXT
);

-- User/Student table
CREATE TABLE IF NOT EXISTS public.student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RSVP table
CREATE TABLE IF NOT EXISTS public.rsvp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    event_id UUID REFERENCES public.event(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.student(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'attending' CHECK (status IN ('attending', 'not_attending', 'maybe')),
    UNIQUE(event_id, student_id)
);

-- Deals table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    discount_percentage INTEGER,
    company_name TEXT NOT NULL,
    image_url TEXT,
    expires_at TIMESTAMPTZ,
    category TEXT
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.society ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Society table
CREATE POLICY "Societies can view their own data" ON public.society
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Societies can update their own data" ON public.society
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create a society" ON public.society
    FOR INSERT WITH CHECK (true);

-- RLS Policies for Event table
CREATE POLICY "Anyone can view approved events" ON public.event
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Societies can manage their own events" ON public.event
    FOR ALL USING (
        society_id IN (
            SELECT id FROM public.society WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can create events" ON public.event
    FOR INSERT WITH CHECK (true);

-- RLS Policies for Student table
CREATE POLICY "Students can view their own data" ON public.student
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own data" ON public.student
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create a student profile" ON public.student
    FOR INSERT WITH CHECK (true);

-- RLS Policies for RSVP table
CREATE POLICY "Students can manage their own RSVPs" ON public.rsvp
    FOR ALL USING (
        student_id IN (
            SELECT id FROM public.student WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view RSVPs" ON public.rsvp
    FOR SELECT USING (true);

-- RLS Policies for Deals table
CREATE POLICY "Anyone can view deals" ON public.deals
    FOR SELECT USING (true);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_updated_at BEFORE UPDATE ON public.event
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to reset event status to pending when updated
CREATE OR REPLACE FUNCTION reset_event_status_on_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Only reset status if the event content has changed (not just status itself)
    IF OLD.name != NEW.name OR 
       OLD.description != NEW.description OR 
       OLD.start_time != NEW.start_time OR 
       OLD.end_time != NEW.end_time OR 
       OLD.location != NEW.location OR 
       OLD.category != NEW.category THEN
        NEW.status = 'pending';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER reset_status_on_event_update BEFORE UPDATE ON public.event
    FOR EACH ROW EXECUTE FUNCTION reset_event_status_on_update();
