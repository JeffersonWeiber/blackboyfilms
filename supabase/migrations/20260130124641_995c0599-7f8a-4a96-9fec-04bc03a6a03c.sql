-- Create clients table for "Alguns de nossos clientes" section
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  category TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Public can view active and featured clients
CREATE POLICY "Public can view featured active clients"
ON public.clients
FOR SELECT
USING (is_active = true AND is_featured = true);

-- Admin and editor can view all clients
CREATE POLICY "Admin and editor can view all clients"
ON public.clients
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Admin and editor can insert clients
CREATE POLICY "Admin and editor can insert clients"
ON public.clients
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Admin and editor can update clients
CREATE POLICY "Admin and editor can update clients"
ON public.clients
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Only admin can delete clients
CREATE POLICY "Only admin can delete clients"
ON public.clients
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_portfolio_updated_at();

-- Create storage bucket for client logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-logos',
  'client-logos',
  true,
  2097152,
  ARRAY['image/svg+xml', 'image/png', 'image/webp']
);

-- Storage policies for client logos
CREATE POLICY "Public can view client logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'client-logos');

CREATE POLICY "Admin and editor can upload client logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'client-logos' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

CREATE POLICY "Admin and editor can update client logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'client-logos' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

CREATE POLICY "Admin can delete client logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'client-logos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);