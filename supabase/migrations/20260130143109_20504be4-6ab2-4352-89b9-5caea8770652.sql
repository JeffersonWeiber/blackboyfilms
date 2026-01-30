-- Criar bucket para capas de nichos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'niche-covers',
  'niche-covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- SELECT publico
CREATE POLICY "Public can view niche covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'niche-covers');

-- INSERT para admin/editor
CREATE POLICY "Admin and editor can upload niche covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'niche-covers' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

-- UPDATE para admin/editor
CREATE POLICY "Admin and editor can update niche covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'niche-covers' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

-- DELETE para admin/editor
CREATE POLICY "Admin and editor can delete niche covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'niche-covers' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);