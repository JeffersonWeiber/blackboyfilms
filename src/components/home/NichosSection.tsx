import { SectionTitle } from "@/components/ui/SectionTitle";
import { NicheCard } from "@/components/ui/NicheCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

const nichos = [
  {
    title: "Casamento",
    description: "Eternize o dia mais especial com cinematografia que emociona gerações.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    href: "/nicho/casamento",
  },
  {
    title: "Eventos",
    description: "Cobertura completa de eventos corporativos, shows e festivais.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    href: "/nicho/eventos",
  },
  {
    title: "Clínicas",
    description: "Conteúdo médico profissional que transmite confiança e expertise.",
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80",
    href: "/nicho/clinicas",
  },
  {
    title: "Marcas & Ads",
    description: "Campanhas publicitárias e brand films que conectam com seu público.",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
    href: "/nicho/marcas",
  },
  {
    title: "Food",
    description: "Gastronomia filmada com técnica e paixão. Cada prato, uma obra de arte.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    href: "/nicho/food",
  },
  {
    title: "Imobiliário",
    description: "Tours virtuais e vídeos que vendem propriedades antes mesmo da visita.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    href: "/nicho/imobiliario",
  },
];

export function NichosSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

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
            isVisible && "visible"
          )}
        >
          {nichos.map((nicho) => (
            <NicheCard key={nicho.title} {...nicho} />
          ))}
        </div>
      </div>
    </section>
  );
}
