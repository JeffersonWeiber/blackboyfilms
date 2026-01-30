import { X } from "lucide-react";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { detectVideoType, generateEmbedUrl, VideoType } from "@/lib/videoUtils";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoType?: VideoType;
}

export function VideoModal({ isOpen, onClose, videoUrl, videoType }: VideoModalProps) {
  const type = videoType || detectVideoType(videoUrl);
  const embedUrl = generateEmbedUrl(videoUrl, type, {
    muted: false,
    autoplay: true,
    controls: true,
    loop: false
  });

  if (!embedUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90" />
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-8 md:right-8 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all duration-300"
            aria-label="Fechar vídeo"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Video Container */}
          <div
            className="relative w-[90vw] max-w-5xl rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ aspectRatio: '16/9' }}
          >
            <div
              className="absolute"
              style={{
                width: '115%',
                height: '115%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
              }}
            >
              <iframe
                src={embedUrl}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
