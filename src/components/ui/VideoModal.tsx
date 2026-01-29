import { X } from "lucide-react";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

export function VideoModal({ isOpen, onClose, videoId }: VideoModalProps) {
  // Using YouTube nocookie domain + all hiding parameters
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0`;

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

          {/* Video Container - cropped to hide YouTube branding */}
          <div
            className="relative w-full max-w-6xl mx-4 md:mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Wrapper that clips the iframe edges */}
            <div 
              className="relative w-full overflow-hidden rounded-lg"
              style={{ 
                aspectRatio: '16/9',
              }}
            >
              {/* Scaled iframe to crop out YouTube branding */}
              <iframe
                src={embedUrl}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                className="absolute border-0"
                style={{ 
                  pointerEvents: "none",
                  width: '300%',
                  height: '300%',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) scale(0.34)',
                }}
              />
              {/* Invisible overlay to block any YouTube UI interactions */}
              <div className="absolute inset-0 z-10" />
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
