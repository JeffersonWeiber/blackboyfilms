-- Create site_settings table for tracking configuration
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Admin can read and write all settings
CREATE POLICY "Admin can manage all settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Editor can only read settings
CREATE POLICY "Editor can view settings"
ON public.site_settings
FOR SELECT
USING (has_role(auth.uid(), 'editor'));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_portfolio_updated_at();

-- Insert default tracking settings
INSERT INTO public.site_settings (key, value) VALUES
  ('tracking_ga4', '{"enabled": false, "measurement_id": "", "debug_mode": false}'::jsonb),
  ('tracking_meta', '{"enabled": false, "pixel_id": ""}'::jsonb),
  ('tracking_tiktok', '{"enabled": false, "pixel_id": ""}'::jsonb),
  ('tracking_lgpd', '{"anonymize_ip": true, "consent_mode": true, "cookies_required": false}'::jsonb);