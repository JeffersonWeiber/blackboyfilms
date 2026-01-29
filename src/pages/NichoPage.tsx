import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { ArrowRight, Play, CheckCircle } from "lucide-react";

const nichosData: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  benefits: string[];
  projects: { title: string; thumbnail: string; videoId: string }[];
}> = {
  casamento: {
    title: "CASAMENTO",
    subtitle: "Wedding Films",
    description: "Eternize o dia mais especial com cinematografia que emociona gerações. Cada olhar, cada sorriso, cada lágrima de alegria - capturamos a essência do seu amor com sensibilidade e técnica impecável.",
    heroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
    benefits: [
      "Cobertura completa do evento",
      "Filme principal de 5-15 minutos",
      "Teaser para redes sociais",
      "Same-day edit disponível",
      "Drone para cenas aéreas",
      "Entrega em até 60 dias",
    ],
    projects: [
      { title: "Ana & Pedro", thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Juliana & Marcos", thumbnail: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Carla & Bruno", thumbnail: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
    ],
  },
  eventos: {
    title: "EVENTOS",
    subtitle: "Event Coverage",
    description: "Cobertura completa de eventos corporativos, shows, festivais e conferências. Capturamos a energia e os momentos marcantes que fazem seu evento único.",
    heroImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80",
    benefits: [
      "Múltiplas câmeras",
      "Cobertura completa do evento",
      "Highlight reel",
      "Entrevistas com participantes",
      "Live streaming disponível",
      "Entrega expressa",
    ],
    projects: [
      { title: "Festival Music 2024", thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Conferência Tech", thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Gala Anual", thumbnail: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
    ],
  },
  clinicas: {
    title: "CLÍNICAS",
    subtitle: "Healthcare Content",
    description: "Conteúdo audiovisual profissional para clínicas e consultórios. Transmita confiança e expertise através de vídeos que humanizam sua marca e conectam com pacientes.",
    heroImage: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1920&q=80",
    benefits: [
      "Vídeos institucionais",
      "Depoimentos de pacientes",
      "Apresentação de procedimentos",
      "Conteúdo para redes sociais",
      "Tours virtuais",
      "Conformidade com regulamentações",
    ],
    projects: [
      { title: "Clínica Premium", thumbnail: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Centro Odontológico", thumbnail: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Dermatologia Avançada", thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
    ],
  },
  marcas: {
    title: "MARCAS & ADS",
    subtitle: "Brand Films & Advertising",
    description: "Campanhas publicitárias e brand films que conectam com seu público. Do conceito à entrega, criamos narrativas visuais que impulsionam resultados.",
    heroImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1920&q=80",
    benefits: [
      "Comerciais para TV e digital",
      "Brand films",
      "Vídeos para redes sociais",
      "Product shots",
      "Campanhas integradas",
      "A/B testing de criativos",
    ],
    projects: [
      { title: "Campaign XYZ", thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Lançamento Produto", thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Brand Story", thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
    ],
  },
  food: {
    title: "FOOD",
    subtitle: "Gastronomia",
    description: "Gastronomia filmada com técnica e paixão. Cada prato é uma obra de arte, e nosso trabalho é fazer com que as pessoas sintam o sabor através da tela.",
    heroImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80",
    benefits: [
      "Food styling profissional",
      "Slow motion e macro",
      "Ambiente e atmosfera",
      "Menu em vídeo",
      "Conteúdo para delivery apps",
      "Behind the scenes",
    ],
    projects: [
      { title: "Restaurante Gourmet", thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Chef's Table", thumbnail: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Confeitaria Artesanal", thumbnail: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
    ],
  },
  imobiliario: {
    title: "IMOBILIÁRIO",
    subtitle: "Real Estate",
    description: "Tours virtuais e vídeos que vendem propriedades antes mesmo da visita. Destaque cada detalhe e crie uma conexão emocional com potenciais compradores.",
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80",
    benefits: [
      "Tours virtuais 360°",
      "Filmagem com drone",
      "Vídeos de apresentação",
      "Fotos profissionais",
      "Virtual staging",
      "Entrega em 48h",
    ],
    projects: [
      { title: "Mansão Contemporânea", thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Cobertura Duplex", thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
      { title: "Empreendimento Premium", thumbnail: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", videoId: "dQw4w9WgXcQ" },
    ],
  },
};

export default function NichoPage() {
  const { nicho } = useParams<{ nicho: string }>();
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  
  const data = nicho ? nichosData[nicho] : null;

  if (!data) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl mb-4">Página não encontrada</h1>
            <Button asChild>
              <Link to="/">Voltar para Home</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={data.heroImage}
            alt={data.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center pt-20">
          <span className="inline-block text-gold text-sm font-medium tracking-[0.3em] uppercase mb-4">
            {data.subtitle}
          </span>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wide mb-6">
            {data.title}
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
            {data.description}
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 md:py-32 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div
            ref={ref}
            className={cn("grid lg:grid-cols-2 gap-12 lg:gap-20 items-center reveal", isVisible && "visible")}
          >
            <div>
              <SectionTitle
                subtitle="O Que Oferecemos"
                title="INCLUÍDO NO SERVIÇO"
                align="left"
              />
              <ul className="space-y-4">
                {data.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                className="mt-10 btn-glow bg-gold hover:bg-gold-light text-primary-foreground font-semibold px-8 py-6 group"
              >
                <Link to="/contato">
                  Solicitar Orçamento
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {data.projects.slice(0, 2).map((project) => (
                <div
                  key={project.title}
                  className="aspect-[3/4] rounded-lg overflow-hidden group cursor-pointer"
                >
                  <div className="relative w-full h-full">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-gold/20 backdrop-blur flex items-center justify-center border border-gold/50">
                        <Play className="w-6 h-6 text-gold" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionTitle
            subtitle="Portfólio"
            title="PROJETOS RECENTES"
          />

          <div className="grid md:grid-cols-3 gap-6">
            {data.projects.map((project) => (
              <div
                key={project.title}
                className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer"
              >
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">{project.title}</h3>
                    <div className="w-10 h-10 rounded-full bg-gold/20 backdrop-blur flex items-center justify-center border border-gold/50">
                      <Play className="w-5 h-5 text-gold" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gold text-gold hover:bg-gold hover:text-primary-foreground px-8"
            >
              <Link to="/works">Ver Todos os Projetos</Link>
            </Button>
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
            Entre em contato e receba uma proposta personalizada para o seu projeto.
          </p>
          <Button
            asChild
            size="lg"
            className="btn-glow bg-gold hover:bg-gold-light text-primary-foreground font-semibold px-10 py-6"
          >
            <Link to="/contato">Receber Proposta</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
