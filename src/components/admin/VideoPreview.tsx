import { useEffect, useState } from "react";
import { detectVideoType, generateEmbedUrl, generateThumbnailUrl, getVideoTypeLabel, isValidVideoUrl } from "@/lib/videoUtils";
import { cn } from "@/lib/utils";
import { Play, AlertCircle, Youtube, HardDrive } from "lucide-react";

interface VideoPreviewProps {
  url: string;
  className?: string;
  showPlayButton?: boolean;
}

export function VideoPreview({ url, className, showPlayButton = true }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const videoType = detectVideoType(url);
  const isValid = isValidVideoUrl(url);
  const thumbnailUrl = generateThumbnailUrl(url);
  const embedUrl = generateEmbedUrl(url);

  // Reset state when URL changes
  useEffect(() => {
    setIsPlaying(false);
    setThumbnailError(false);
  }, [url]);

  if (!url) {
    return (
      <div className={cn(
        "aspect-video rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground",
        className
      )}>
        <Play className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm">Cole uma URL de vídeo para ver o preview</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className={cn(
        "aspect-video rounded-lg bg-destructive/10 flex flex-col items-center justify-center text-destructive",
        className
      )}>
        <AlertCircle className="w-12 h-12 mb-2" />
        <p className="text-sm font-medium">URL inválida</p>
        <p className="text-xs mt-1 opacity-70">Use um link do YouTube ou Google Drive</p>
      </div>
    );
  }

  if (isPlaying && embedUrl) {
    return (
      <div className={cn("aspect-video rounded-lg overflow-hidden bg-black", className)}>
        {videoType === "youtube" ? (
          // Apply the same crop technique for YouTube
          <div className="relative w-full h-full overflow-hidden">
            <div 
              className="absolute"
              style={{
                width: '140%',
                height: '140%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <iframe
                src={embedUrl}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                className="w-full h-full border-0"
                style={{ pointerEvents: "none" }}
              />
            </div>
            <div className="absolute inset-0 z-10" />
          </div>
        ) : (
          // Drive doesn't need cropping
          <iframe
            src={embedUrl}
            allow="autoplay"
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "aspect-video rounded-lg overflow-hidden bg-muted relative group cursor-pointer",
        className
      )}
      onClick={() => showPlayButton && setIsPlaying(true)}
    >
      {/* Thumbnail */}
      {thumbnailUrl && !thumbnailError ? (
        <img
          src={thumbnailUrl}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
          onError={() => setThumbnailError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          {videoType === "youtube" ? (
            <Youtube className="w-16 h-16 text-muted-foreground" />
          ) : (
            <HardDrive className="w-16 h-16 text-muted-foreground" />
          )}
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {showPlayButton && (
          <div className="w-16 h-16 rounded-full bg-gold/20 backdrop-blur flex items-center justify-center border border-gold/50">
            <Play className="w-8 h-8 text-gold" />
          </div>
        )}
      </div>

      {/* Type Badge */}
      <div className="absolute top-3 left-3">
        <span className="px-2 py-1 rounded bg-black/50 backdrop-blur text-xs font-medium text-white flex items-center gap-1">
          {videoType === "youtube" ? (
            <Youtube className="w-3 h-3" />
          ) : (
            <HardDrive className="w-3 h-3" />
          )}
          {getVideoTypeLabel(videoType)}
        </span>
      </div>
    </div>
  );
}
