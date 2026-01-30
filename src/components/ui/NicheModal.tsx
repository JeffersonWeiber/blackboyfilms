import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NicheCardCompact } from "@/components/ui/NicheCardCompact";
import { useActiveNiches } from "@/hooks/useNiches";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NicheModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NicheModal({ open, onOpenChange }: NicheModalProps) {
  const [search, setSearch] = useState("");
  const { data: niches, isLoading } = useActiveNiches();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setIsVisible(false);
    } else {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const filteredNiches = useMemo(() => {
    if (!niches) return [];
    if (!search.trim()) return niches;
    
    const searchLower = search.toLowerCase();
    return niches.filter(
      (niche) =>
        niche.name.toLowerCase().includes(searchLower) ||
        niche.description.toLowerCase().includes(searchLower)
    );
  }, [niches, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "data-[state=open]:slide-in-from-bottom-4",
          "motion-reduce:animate-none"
        )}
      >
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="font-display text-2xl tracking-wide">
            TODAS AS CATEGORIAS
          </DialogTitle>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)]">
          <div className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNiches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {search ? "Nenhuma categoria encontrada" : "Nenhuma categoria disponível"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNiches.map((niche, index) => (
                  <NicheCardCompact
                    key={niche.id}
                    name={niche.name}
                    slug={niche.slug}
                    description={niche.description}
                    coverImage={niche.cover_image}
                    onClick={() => onOpenChange(false)}
                    className="motion-reduce:opacity-100"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                      transitionDelay: `${index * 50}ms`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
