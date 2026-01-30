import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Niche {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string | null;
  whatsapp_template: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export function useFeaturedNiches() {
  return useQuery({
    queryKey: ["niches", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("niches")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Niche[];
    },
  });
}

export function useActiveNiches() {
  return useQuery({
    queryKey: ["niches", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("niches")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Niche[];
    },
  });
}

export function useAllNiches() {
  return useQuery({
    queryKey: ["niches", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("niches")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Niche[];
    },
  });
}

export function useNicheBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["niches", "slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from("niches")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as Niche | null;
    },
    enabled: !!slug,
  });
}
