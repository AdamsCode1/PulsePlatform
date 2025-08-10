-- Create platform_settings table to store admin-configurable settings
-- Ensures a single-row configuration with JSONB payload

CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE DEFAULT 'platform',
    config JSONB NOT NULL DEFAULT jsonb_build_object(
        'eventApproval', jsonb_build_object(
            'autoApproveSocietyEvents', false,
            'requireRejectionReason', true
        ),
        'dealModeration', jsonb_build_object(
            'requireApproval', true
        ),
        'userRegistration', jsonb_build_object(
            'allowPublicRegistration', true,
            'requireEmailVerification', true
        ),
        'emailNotifications', jsonb_build_object(
            'notifyAdminsOnSubmission', true,
            'digestFrequency', 'weekly'
        ),
        'maintenance', jsonb_build_object(
            'enabled', false,
            'message', 'The platform is under maintenance. Please check back later.'
        )
    ),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_platform_settings_updated_at ON public.platform_settings;
CREATE TRIGGER trg_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/update settings
DROP POLICY IF EXISTS "Admins can read settings" ON public.platform_settings;
CREATE POLICY "Admins can read settings" ON public.platform_settings
    FOR SELECT
    TO authenticated
    USING (is_admin());

DROP POLICY IF EXISTS "Admins can upsert settings" ON public.platform_settings;
CREATE POLICY "Admins can upsert settings" ON public.platform_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update settings" ON public.platform_settings;
CREATE POLICY "Admins can update settings" ON public.platform_settings
    FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Helper function to get or initialize settings in a single call
CREATE OR REPLACE FUNCTION public.get_or_create_platform_settings()
RETURNS public.platform_settings AS $$
DECLARE
    rec public.platform_settings;
BEGIN
    SELECT * INTO rec FROM public.platform_settings WHERE key = 'platform' LIMIT 1;
    IF rec IS NULL THEN
        INSERT INTO public.platform_settings (key) VALUES ('platform') RETURNING * INTO rec;
    END IF;
    RETURN rec;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.platform_settings IS 'Singleton configuration store for platform settings (admin managed).';
