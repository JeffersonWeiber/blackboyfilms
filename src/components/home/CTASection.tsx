import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function CTASection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-background to-background" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div
          className={cn(
            "max-w-4xl mx-auto text-center reveal",
            isVisible && "visible"
          )}
        >
          <span className="inline-block text-gold text-sm font-medium tracking-[0.3em] uppercase mb-6">
            Pronto para começar?
          </span>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide mb-6">
            VAMOS CRIAR ALGO
            <br />
            <span className="text-gradient">EXTRAORDINÁRIO</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Cada projeto é uma oportunidade de contar uma história única. 
            Entre em contato e descubra como podemos transformar sua visão em realidade.
          </p>

          <Button
            asChild
            size="lg"
            className="btn-glow bg-gold hover:bg-gold-light text-primary-foreground font-semibold px-10 py-6 text-lg group"
          >
            <Link to="/contato">
              Receber Proposta
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
