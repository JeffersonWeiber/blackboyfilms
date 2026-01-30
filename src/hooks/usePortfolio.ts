import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "portfolio-thumbnails";

/**
 * Hook to upload a portfolio thumbnail to Supabase Storage
 */
export function useUploadPortfolioThumbnail() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

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
 * Hook to delete a portfolio thumbnail from Supabase Storage
 */
export function useDeletePortfolioThumbnail() {
  return useMutation({
    mutationFn: async (thumbnailUrl: string) => {
      // Extract file path from URL
      // URL format: https://xxx.supabase.co/storage/v1/object/public/portfolio-thumbnails/thumbnails/filename.ext
      const urlParts = thumbnailUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length < 2) {
        throw new Error("Invalid thumbnail URL");
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
 * Check if a thumbnail URL is from our portfolio-thumbnails bucket
 */
export function isPortfolioThumbnailUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes(BUCKET_NAME);
}
