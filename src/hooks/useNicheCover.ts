import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "niche-covers";

/**
 * Hook to upload a niche cover image to Supabase Storage
 */
export function useUploadNicheCover() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
  });
}

/**
 * Hook to delete a niche cover image from Supabase Storage
 */
export function useDeleteNicheCover() {
  return useMutation({
    mutationFn: async (coverUrl: string) => {
      // Extract file path from URL
      // URL format: https://xxx.supabase.co/storage/v1/object/public/niche-covers/covers/filename.ext
      const urlParts = coverUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length < 2) {
        throw new Error("Invalid cover URL");
      }
      
      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) throw error;
    },
  });
}

/**
 * Check if a cover URL is from our niche-covers bucket
 */
export function isNicheCoverUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes(BUCKET_NAME);
}
