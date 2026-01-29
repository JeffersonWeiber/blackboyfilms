import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VideoBackgroundProps {
  src: string;
  poster?: string;
  className?: string;
  overlay?: boolean;
  overlayClassName?: string;
}

export function VideoBackground({
  src,
  poster,
  className,
  overlay = true,
  overlayClassName,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      video.play().catch(() => {
        // Autoplay was prevented, that's okay
      });
    };

    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  return (
    <div className={cn("video-cinema absolute inset-0", className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        className={cn(
          "w-full h-full object-cover transition-opacity duration-1000",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
      
      {overlay && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background",
            overlayClassName
          )}
        />
      )}
    </div>
  );
}

interface EmbeddedVideoProps {
  videoId: string;
  platform?: "youtube" | "vimeo";
  className?: string;
  autoplay?: boolean;
}

export function EmbeddedVideo({
  videoId,
  platform = "youtube",
  className,
  autoplay = true,
}: EmbeddedVideoProps) {
  const getEmbedUrl = () => {
    if (platform === "youtube") {
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0`;
    }
    return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&muted=1&loop=1&background=1&quality=1080p`;
  };

  return (
    <div className={cn("video-cinema relative w-full aspect-video overflow-hidden", className)}>
      <iframe
        src={getEmbedUrl()}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0 scale-[1.2] origin-center"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}
