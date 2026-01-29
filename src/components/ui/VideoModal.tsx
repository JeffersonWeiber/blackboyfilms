import { X } from "lucide-react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
}

export function VideoModal({ isOpen, onClose, videoId, title }: VideoModalProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/95" />
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 md:top-8 md:right-8 z-50 w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-background/40 transition-all duration-300"
            aria-label="Fechar vídeo"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Video Container */}
          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={embedUrl}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
                style={{ pointerEvents: "none" }}
              />
            </div>

            {/* Title */}
            {title && (
              <div className="mt-6 text-center">
                <h3 className="text-xl md:text-2xl font-medium text-foreground">
                  {title}
                </h3>
              </div>
            )}
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
