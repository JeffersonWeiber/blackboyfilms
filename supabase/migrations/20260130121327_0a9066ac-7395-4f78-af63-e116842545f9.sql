-- Create niches table
CREATE TABLE public.niches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  cover_image text,
  whatsapp_template text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;

-- Public can view active niches
CREATE POLICY "Public can view active niches"
ON public.niches
FOR SELECT
USING (is_active = true);

-- Admin and editor can view all niches
CREATE POLICY "Admin and editor can view all niches"
ON public.niches
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Admin and editor can insert niches
CREATE POLICY "Admin and editor can insert niches"
ON public.niches
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Admin and editor can update niches
CREATE POLICY "Admin and editor can update niches"
ON public.niches
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Only admin can delete niches
CREATE POLICY "Only admin can delete niches"
ON public.niches
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_niches_updated_at
BEFORE UPDATE ON public.niches
FOR EACH ROW
EXECUTE FUNCTION public.update_portfolio_updated_at();

-- Seed the 17 niches
INSERT INTO public.niches (name, slug, description, cover_image, is_featured, is_active, display_order) VALUES
('Casamento', 'casamento', 'Eternize o dia mais especial com cinematografia que emociona gerações.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', true, true, 1),
('Eventos', 'eventos', 'Cobertura completa de eventos corporativos, shows e festivais.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', true, true, 2),
('Clínicas', 'clinicas', 'Conteúdo profissional que transmite confiança e autoridade.', 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80', true, true, 3),
('Marcas & Ads', 'marcas-e-ads', 'Campanhas e brand films que conectam e convertem.', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80', true, true, 4),
('Food', 'food', 'Gastronomia filmada com técnica e estética premium.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', true, true, 5),
('Imobiliário', 'imobiliario', 'Vídeos e tours que vendem imóveis antes da visita.', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', true, true, 6),
('15 anos', '15-anos', 'Filme e highlights com emoção e estética cinematográfica.', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80', false, true, 7),
('Aniversários', 'aniversarios', 'Cobertura completa e conteúdo para relembrar e compartilhar.', 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=800&q=80', false, true, 8),
('Empresarial (Institucional)', 'empresarial', 'Vídeo institucional para posicionar sua empresa com credibilidade.', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', false, true, 9),
('Redes Sociais', 'redes-sociais', 'Conteúdo recorrente pensado para consistência e alcance.', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80', false, true, 10),
('Para o seu Marketing', 'marketing', 'Conteúdo estratégico para campanhas, anúncios e performance.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', false, true, 11),
('Automotivo', 'automotivo', 'Conteúdo dinâmico para mecânicas, carros e eventos automotivos.', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80', false, true, 12),
('Estética (Beleza)', 'estetica', 'Vídeos e fotos que elevam percepção e desejo pelo serviço.', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80', false, true, 13),
('Formato Vertical', 'formato-vertical', 'Conteúdo vertical nativo para Reels, TikTok e Shorts.', 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=800&q=80', false, true, 14),
('Produção de Cursos', 'producao-de-cursos', 'Captação e edição para aulas com qualidade e clareza.', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80', false, true, 15),
('YouTube', 'youtube', 'Conteúdo longo com storytelling, ritmo e retenção.', 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=800&q=80', false, true, 16),
('Clip Musical', 'clip-musical', 'Produção audiovisual para artistas com estética e direção criativa.', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80', false, true, 17);