import { Layout } from "@/components/layout/Layout";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { Award, Users, Film, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import equipeImage from "@/assets/equipe-blackboy.jpeg";
const stats = [
  { number: "200+", label: "Projetos Entregues" },
  { number: "50+", label: "Marcas Atendidas" },
  { number: "8", label: "Anos de Experiência" },
  { number: "100%", label: "Satisfação" },
];

const values = [
  {
    icon: Film,
    title: "Excelência Técnica",
    description: "Investimos constantemente em equipamentos de ponta e formação da equipe para entregar o melhor.",
  },
  {
    icon: Heart,
    title: "Paixão por Histórias",
    description: "Cada projeto é uma oportunidade de contar uma história única e impactante.",
  },
  {
    icon: Users,
    title: "Parceria Genuína",
    description: "Trabalhamos lado a lado com nossos clientes, entendendo suas necessidades como nossas.",
  },
  {
    icon: Award,
    title: "Compromisso com Qualidade",
    description: "Não entregamos nada que não nos orgulhemos. Cada frame importa.",
  },
];

export default function Sobre() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionTitle
            subtitle="Quem Somos"
            title="BLACKBOY FILMS"
          />
        </div>
      </section>

      {/* Story */}
      <section className="pb-24 md:pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div
            ref={ref}
            className={cn("grid lg:grid-cols-2 gap-12 lg:gap-20 items-center reveal", isVisible && "visible")}
          >
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <img
                  src={equipeImage}
                  alt="Equipe Blackboy Films"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gold/10 rounded-lg -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-gold/30 rounded-lg -z-10" />
            </div>

            {/* Content */}
            <div>
              <h3 className="font-display text-3xl md:text-4xl tracking-wide mb-6">
                NOSSA <span className="text-gradient">HISTÓRIA</span>
              </h3>
              <div className="space-y-6 text-muted-foreground">
                <p>
                  A Blackboy Films nasceu da paixão por contar histórias através das lentes. 
                  Fundada em 2016, começamos com uma câmera e um sonho: criar conteúdo audiovisual 
                  que realmente conectasse pessoas e marcas.
                </p>
                <p>
                  Ao longo dos anos, evoluímos de uma pequena produtora para uma referência 
                  no mercado audiovisual brasileiro. Trabalhamos com marcas de diversos segmentos, 
                  sempre mantendo o mesmo comprometimento com qualidade e criatividade que nos 
                  trouxe até aqui.
                </p>
                <p>
                  Hoje, nossa equipe é formada por profissionais apaixonados, equipados com 
                  tecnologia de ponta e movidos pela busca constante pela excelência. Cada projeto 
                  é tratado com a mesma dedicação, seja um vídeo institucional ou uma superprodução.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 md:py-32 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="font-display text-5xl md:text-6xl text-gradient">
                  {stat.number}
                </span>
                <p className="mt-2 text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionTitle
            subtitle="O Que Nos Move"
            title="NOSSOS VALORES"
          />

          <div
            ref={valuesRef}
            className={cn(
              "grid md:grid-cols-2 lg:grid-cols-4 gap-8 reveal-stagger",
              valuesVisible && "visible"
            )}
          >
            {values.map((value) => (
              <div
                key={value.title}
                className="p-8 rounded-lg bg-card border border-border/50 hover:border-gold/50 transition-colors duration-300 group"
              >
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors duration-300">
                  <value.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-display text-xl tracking-wide mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-card">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-display text-4xl md:text-5xl tracking-wide mb-6">
            QUER FAZER PARTE <span className="text-gradient">DESSA HISTÓRIA?</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10">
            Estamos sempre em busca de novos desafios e histórias para contar. 
            Vamos criar algo incrível juntos.
          </p>
          <Button
            asChild
            size="lg"
            className="btn-glow bg-gold hover:bg-gold-light text-primary-foreground font-semibold px-10 py-6"
          >
            <Link to="/contato">Entre em Contato</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
