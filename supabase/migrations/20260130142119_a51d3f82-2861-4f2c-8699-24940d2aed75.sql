-- Criar bucket para thumbnails do portfolio
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-thumbnails', 'portfolio-thumbnails', true);

-- Politica SELECT publica
CREATE POLICY "Public can view portfolio thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-thumbnails');

-- Politica INSERT para admin/editor
CREATE POLICY "Admin and editor can upload portfolio thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio-thumbnails' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'editor'::app_role)
  )
);

-- Politica UPDATE para admin/editor
CREATE POLICY "Admin and editor can update portfolio thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'portfolio-thumbnails' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'editor'::app_role)
  )
);

-- Politica DELETE para admin/editor
CREATE POLICY "Admin and editor can delete portfolio thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portfolio-thumbnails' 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'editor'::app_role)
  )
);