import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { VideoModal } from "@/components/ui/VideoModal";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface SelectedVideo {
  videoId: string;
  title: string;
}

const categories = [
  { id: "all", label: "Todos" },
  { id: "casamento", label: "Casamento" },
  { id: "eventos", label: "Eventos" },
  { id: "clinicas", label: "Clínicas" },
  { id: "marcas", label: "Marcas" },
  { id: "food", label: "Food" },
  { id: "imobiliario", label: "Imobiliário" },
];

const projects = [
  {
    id: 1,
    title: "Wedding Film - Ana & Pedro",
    category: "casamento",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    videoId: "dQw4w9WgXcQ",
  },
  {
    id: 2,
    title: "Festival de Música 2024",
    category: "eventos",
    thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    videoId: "dQw4w9WgXcQ",
  },
  {
    id: 3,
    title: "Clínica Premium - Institucional",
    category: "clinicas",
    thumbnail: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80",
    videoId: "dQw4w9WgXcQ",
  },
  {
    id: 4,
    title: "Campaign - Marca XYZ",
    category: "marcas",
    thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
    videoId: "dQw4w9WgXcQ",
  },
  {
    id: 5,
    title: "Restaurante Gourmet",
    category: "food",
    thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    videoId: "dQw4w9WgXcQ",
  },
  {
    id: 6,
    title: "Mansão Contemporânea",
    category: "imobiliario",
    thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    videoId: "dQw4w9WgXcQ",
  },
  {
    id: 7,
    title: "Casamento - Juliana & Marcos",
    category: "casamento",
    thumbnail: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=800&q=80",
    videoId: "dQw4w9WgXcQ",
  },
  {
    id: 8,
    title: "Lançamento de Produto",
    category: "marcas",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
    videoId: "dQw4w9WgXcQ",
  },
];

export default function Works() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(null);
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  const handleProjectClick = (project: typeof projects[0]) => {
    setSelectedVideo({
      videoId: project.videoId,
      title: project.title,
    });
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionTitle
            subtitle="Portfólio"
            title="NOSSOS TRABALHOS"
          />

          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  activeCategory === cat.id
                    ? "bg-gold text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-24 md:pb-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div
            ref={ref}
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger",
              isVisible && "visible"
            )}
          >
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer"
                onClick={() => handleProjectClick(project)}
              >
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/20 backdrop-blur flex items-center justify-center border border-gold/50">
                      <Play className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-lg font-medium text-white">
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Category Tag */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur text-xs font-medium text-white capitalize">
                    {project.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={handleCloseModal}
        videoId={selectedVideo?.videoId || ""}
      />
    </Layout>
  );
}
