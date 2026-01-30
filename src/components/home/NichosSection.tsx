import { useState, useEffect } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { NicheCard } from "@/components/ui/NicheCard";
import { NicheModal } from "@/components/ui/NicheModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useFeaturedNiches } from "@/hooks/useNiches";
import { cn } from "@/lib/utils";
import { Grid3X3 } from "lucide-react";

export function NichosSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const { data: niches, isLoading } = useFeaturedNiches();
  const [modalOpen, setModalOpen] = useState(false);
  const [forceVisible, setForceVisible] = useState(false);

  // Force visibility after data loads (for stagger animation)
  useEffect(() => {
    if (niches && niches.length > 0 && isVisible) {
      setForceVisible(true);
    }
  }, [niches, isVisible]);

  return (
    <section id="nichos" className="py-24 md:py-32 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionTitle
          subtitle="Nossos Serviços"
          title="ESPECIALISTAS EM CADA NICHO"
        />

        <div
          ref={ref}
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger",
            (isVisible || forceVisible) && "visible"
          )}
        >
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-card border border-border">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))
          ) : niches && niches.length > 0 ? (
            niches.map((niche) => (
              <NicheCard
                key={niche.id}
                title={niche.name}
                description={niche.description}
                image={niche.cover_image || "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80"}
                href={`/nicho/${niche.slug}`}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhum nicho disponível
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setModalOpen(true)}
            className="border-gold text-gold hover:bg-gold hover:text-primary-foreground px-8 group"
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Ver todas as categorias
          </Button>
        </div>
      </div>

      {/* Modal */}
      <NicheModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}
