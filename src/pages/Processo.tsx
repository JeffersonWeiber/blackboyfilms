import { Layout } from "@/components/layout/Layout";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  FileText, 
  Video, 
  CheckCircle, 
  Palette,
  Film,
  Sparkles,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Briefing Inicial",
    description: "Tudo começa com uma conversa. Entendemos seus objetivos, expectativas, público-alvo e visão para o projeto. Nessa etapa, definimos o tom, estilo e escopo do trabalho.",
    details: ["Reunião inicial (presencial ou online)", "Definição de objetivos e KPIs", "Análise de referências visuais", "Alinhamento de expectativas"],
  },
  {
    icon: FileText,
    number: "02",
    title: "Planejamento Criativo",
    description: "Com base no briefing, desenvolvemos toda a estrutura criativa do projeto. Aqui nasce o conceito que vai guiar cada decisão.",
    details: ["Roteiro e storyboard", "Cronograma de produção", "Seleção de locações", "Casting e equipe técnica"],
  },
  {
    icon: Palette,
    number: "03",
    title: "Pré-Produção",
    description: "Preparamos cada detalhe para que o dia da filmagem seja perfeito. Nada é deixado ao acaso.",
    details: ["Visita técnica às locações", "Teste de equipamentos", "Briefing com a equipe", "Checklist de produção"],
  },
  {
    icon: Video,
    number: "04",
    title: "Produção",
    description: "O grande dia chegou. Nossa equipe captura cada momento com equipamentos de ponta e técnica refinada.",
    details: ["Câmeras cinema 4K/6K", "Iluminação profissional", "Captação de áudio dedicada", "Direção de fotografia"],
  },
  {
    icon: Film,
    number: "05",
    title: "Pós-Produção",
    description: "Onde a magia acontece. Montagem, color grading, sound design e motion graphics transformam o material bruto em arte.",
    details: ["Edição narrativa", "Color grading cinematográfico", "Sound design e mixagem", "Motion graphics"],
  },
  {
    icon: Sparkles,
    number: "06",
    title: "Revisões",
    description: "Seu feedback é essencial. Fazemos ajustes até que o resultado final supere suas expectativas.",
    details: ["Até 3 rodadas de revisão", "Ajustes de corte e timing", "Refinamentos de cor", "Aprovação final"],
  },
  {
    icon: Send,
    number: "07",
    title: "Entrega Final",
    description: "Projeto aprovado, entregamos em todos os formatos necessários, otimizados para cada plataforma.",
    details: ["Versões para web e TV", "Formatos para redes sociais", "Arquivos em alta resolução", "Backup seguro na nuvem"],
  },
  {
    icon: CheckCircle,
    number: "08",
    title: "Suporte Contínuo",
    description: "Nosso relacionamento não termina na entrega. Estamos sempre disponíveis para suporte e novos projetos.",
    details: ["Suporte técnico", "Adaptações futuras", "Arquivo do projeto", "Condições especiais para clientes"],
  },
];

export default function Processo() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-gold rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <SectionTitle
            subtitle="Metodologia"
            title="NOSSO PROCESSO"
          />
          <p className="text-center text-muted-foreground max-w-2xl mx-auto text-lg">
            Da primeira conversa à entrega final, cada etapa é pensada para garantir 
            um resultado que supere suas expectativas.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-24 md:pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div ref={ref} className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-border" />

            <div className="space-y-12 lg:space-y-24">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={cn(
                    "reveal lg:grid lg:grid-cols-2 lg:gap-16 items-center",
                    isVisible && "visible"
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Content */}
                  <div
                    className={cn(
                      "mb-8 lg:mb-0",
                      index % 2 === 0 ? "lg:text-right lg:order-1" : "lg:order-2"
                    )}
                  >
                    <span className="text-gold font-display text-5xl opacity-30 mb-4 block">
                      {step.number}
                    </span>
                    <h3 className="font-display text-3xl md:text-4xl tracking-wide mb-4">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {step.description}
                    </p>
                    <ul className={cn(
                      "space-y-2",
                      index % 2 === 0 ? "lg:text-right" : ""
                    )}>
                      {step.details.map((detail) => (
                        <li key={detail} className="text-sm text-muted-foreground flex items-center gap-2 lg:justify-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Icon */}
                  <div
                    className={cn(
                      "relative flex justify-center",
                      index % 2 === 0 ? "lg:order-2" : "lg:order-1"
                    )}
                  >
                    {/* Timeline dot */}
                    <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gold shadow-lg shadow-gold/50" />
                    
                    <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center">
                      <step.icon className="w-10 h-10 text-gold" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-card">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-display text-4xl md:text-5xl tracking-wide mb-6">
            PRONTO PARA <span className="text-gradient">COMEÇAR?</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10">
            Vamos conversar sobre seu projeto. O primeiro passo para criar algo extraordinário é uma simples conversa.
          </p>
          <Button
            asChild
            size="lg"
            className="btn-glow bg-gold hover:bg-gold-light text-primary-foreground font-semibold px-10 py-6"
          >
            <Link to="/contato">Iniciar Projeto</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
