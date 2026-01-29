-- Create portfolio_items table
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  niche TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL DEFAULT 'youtube',
  thumbnail_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Public can view published items
CREATE POLICY "Public can view published portfolio items"
ON public.portfolio_items
FOR SELECT
USING (is_published = true);

-- Admin and editor can view all items
CREATE POLICY "Admin and editor can view all portfolio items"
ON public.portfolio_items
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Admin and editor can insert items
CREATE POLICY "Admin and editor can insert portfolio items"
ON public.portfolio_items
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Admin and editor can update items
CREATE POLICY "Admin and editor can update portfolio items"
ON public.portfolio_items
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Only admin can delete items
CREATE POLICY "Only admin can delete portfolio items"
ON public.portfolio_items
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolio_items_updated_at
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION public.update_portfolio_updated_at();

-- Add index for common queries
CREATE INDEX idx_portfolio_items_published ON public.portfolio_items(is_published, display_order);
CREATE INDEX idx_portfolio_items_niche ON public.portfolio_items(niche);