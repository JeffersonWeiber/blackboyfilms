import { useState } from "react";
import {
  generateEmbedUrl,
  detectVideoType,
  generateThumbnailUrl,
  VideoType,
} from "@/lib/videoUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NicheVideoPlayerProps {
  videoUrl: string;
  videoType?: string;
  fallbackImage?: string;
  className?: string;
}

export function NicheVideoPlayer({
  videoUrl,
  videoType,
  fallbackImage,
  className,
}: NicheVideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const detectedType = detectVideoType(videoUrl);
  const explicitType = videoType as VideoType | undefined;
  const type =
    detectedType === "youtube-short"
      ? detectedType
      : explicitType && explicitType !== "unknown"
        ? explicitType
        : detectedType;

  const embedUrl = generateEmbedUrl(videoUrl, type, {
    autoplay: true,
    muted: true,
    loop: true,
  });

  const thumbnailUrl = fallbackImage || generateThumbnailUrl(videoUrl, type);

  // If no valid embed URL, show fallback image
  if (!embedUrl || hasError) {
    return (
      <div className={cn("relative w-full h-full overflow-hidden rounded-lg", className)}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Vídeo indisponível</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden rounded-lg", className)}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <Skeleton className="absolute inset-0 z-10" />
      )}

      <div className="absolute inset-0 overflow-hidden">
        <iframe
          src={embedUrl}
          title="Video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={cn(
            "w-full h-full border-0 pointer-events-none transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
}
