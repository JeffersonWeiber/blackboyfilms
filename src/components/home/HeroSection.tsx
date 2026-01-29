import { ArrowDown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  const scrollToNichos = () => {
    const element = document.getElementById("nichos");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video - Replace with actual video */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-40"
          poster="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1920&q=80"
        >
          <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        <div className={cn("reveal", isVisible && "visible")}>
          <span className="inline-block text-gold text-sm md:text-base font-medium tracking-[0.3em] uppercase mb-6">
            Produção Audiovisual Premium
          </span>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wide leading-tight mb-6">
            HISTÓRIAS QUE
            <br />
            <span className="text-gradient">INSPIRAM</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            Transformamos ideias em experiências cinematográficas inesquecíveis. 
            Do conceito à entrega, cada frame é pensado para impactar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="btn-glow bg-gold hover:bg-gold-light text-primary-foreground font-semibold px-8 py-6 text-base"
              onClick={() => {
                console.log("Event: cta_primary_click");
                window.location.href = "/contato";
              }}
            >
              Receber Proposta
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-foreground/30 hover:border-gold hover:text-gold px-8 py-6 text-base group"
              onClick={() => window.location.href = "/works"}
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Ver Portfólio
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToNichos}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-gold transition-colors animate-float"
        aria-label="Rolar para baixo"
      >
        <ArrowDown className="w-6 h-6" />
      </button>
    </section>
  );
}
