import { X } from "lucide-react";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { detectVideoType, generateEmbedUrl, isShortVideo, VideoType } from "@/lib/videoUtils";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoType?: VideoType;
}

export function VideoModal({ isOpen, onClose, videoUrl, videoType }: VideoModalProps) {
  const detectedType = detectVideoType(videoUrl);
  const type =
    detectedType === "youtube-short"
      ? detectedType
      : videoType && videoType !== "unknown"
        ? videoType
        : detectedType;
  const embedUrl = generateEmbedUrl(videoUrl, type, {
    autoplay: true,
    muted: false,
    loop: false,
  });
  const isShort = isShortVideo(type);
  const isYoutubePlayer = type === "youtube" || type === "youtube-short";

  if (!embedUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black" />
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-8 md:right-8 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300"
            aria-label="Fechar vídeo"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Video Container */}
          <div
            className={
              isShort
                ? "relative w-[85vw] max-w-sm"
                : "relative w-[90vw] max-w-5xl"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full overflow-hidden rounded-lg bg-black"
              style={{ aspectRatio: isShort ? "9/16" : "16/9" }}
            >
              {isYoutubePlayer ? (
                <div className="absolute inset-0 overflow-hidden">
                  <iframe
                    src={embedUrl}
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                    allowFullScreen
                    className="absolute border-0"
                    style={{
                      width: isShort ? "110%" : "104%",
                      height: isShort ? "110%" : "104%",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
              ) : (
                <iframe
                  src={embedUrl}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
