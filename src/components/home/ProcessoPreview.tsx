import { MessageSquare, FileText, Video, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: MessageSquare,
    title: "Briefing",
    description: "Entendemos sua visão, objetivos e expectativas em uma conversa detalhada.",
  },
  {
    icon: FileText,
    title: "Planejamento",
    description: "Criamos roteiro, storyboard e cronograma sob medida para seu projeto.",
  },
  {
    icon: Video,
    title: "Produção",
    description: "Filmagem com equipamentos profissionais e equipe especializada.",
  },
  {
    icon: CheckCircle,
    title: "Entrega",
    description: "Edição refinada, color grading cinematográfico e revisões até a aprovação final.",
  },
];

export function ProcessoPreview() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionTitle
          subtitle="Como Trabalhamos"
          title="NOSSO PROCESSO"
        />

        <div
          ref={ref}
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 reveal-stagger",
            isVisible && "visible"
          )}
        >
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-[2px] bg-border" />
              )}
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center group-hover:bg-gold transition-colors duration-300">
                  <step.icon className="w-7 h-7 text-muted-foreground group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <span className="text-gold text-sm font-medium mb-2 block">
                  0{index + 1}
                </span>
                <h3 className="font-display text-2xl tracking-wide mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-gold text-gold hover:bg-gold hover:text-primary-foreground px-8"
          >
            <Link to="/processo">Ver Processo Completo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
