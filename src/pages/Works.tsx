import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { VideoModal } from "@/components/ui/VideoModal";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useActiveNiches } from "@/hooks/useNiches";
import { cn } from "@/lib/utils";
import { Play, Loader2 } from "lucide-react";
import { generateThumbnailUrl, isShortVideo, VideoType } from "@/lib/videoUtils";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioItem {
  id: string;
  title: string;
  niche: string;
  video_url: string;
  video_type: string;
  thumbnail_url: string | null;
}

interface SelectedVideo {
  videoUrl: string;
  videoType: VideoType;
}

export default function Works() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  // Fetch active niches for dynamic categories
  const { data: niches, isLoading: isLoadingNiches } = useActiveNiches();

  // Build categories from niches
  const categories = [
    { id: "all", label: "Todos" },
    ...(niches?.map(n => ({ id: n.slug, label: n.name })) || []),
  ];

  // Fetch published portfolio items
  const { data: projects, isLoading } = useQuery({
    queryKey: ["portfolio-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("id, title, niche, video_url, video_type, thumbnail_url")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as PortfolioItem[];
    },
  });

  const allFilteredProjects = activeCategory === "all"
    ? projects
    : projects?.filter((p) => p.niche === activeCategory);

  const filteredProjects = allFilteredProjects?.slice(0, visibleCount) || [];

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setVisibleCount(12); // Reset to 12 when changing category
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const handleProjectClick = (project: PortfolioItem) => {
    setSelectedVideo({
      videoUrl: project.video_url,
      videoType: project.video_type as VideoType,
    });
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  const getThumbnail = (project: PortfolioItem) => {
    return project.thumbnail_url || generateThumbnailUrl(project.video_url) || null;
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
          {isLoadingNiches ? (
            <div className="flex justify-center gap-3 mb-12">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="w-24 h-10 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
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
          )}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProjects?.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>Nenhum projeto encontrado nesta categoria.</p>
            </div>
          ) : (
            <div
              ref={ref}
              className={cn(
                "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 reveal-stagger",
                "auto-rows-[minmax(0,1fr)]",
                // Force visible when filtering to prevent blank spaces if the ScrollReveal doesn't trigger again
                (isVisible || (!isLoading && filteredProjects && filteredProjects.length > 0)) && "visible"
              )}
            >
              {filteredProjects?.map((project, index) => {
                const thumbnail = getThumbnail(project);
                const isShort = isShortVideo(project.video_type as VideoType);
                
                return (
                  <div
                    key={project.id}
                    className={cn(
                      "group relative rounded-lg overflow-hidden cursor-pointer video-glow",
                      isShort
                        ? "aspect-[9/16] row-span-2"
                        : "aspect-video col-span-2"
                    )}
                    // Stagger delay via CSS custom property consumed by .reveal-stagger.visible > *
                    style={{ '--reveal-delay': `${index * 0.1}s` } as React.CSSProperties}
                    onClick={() => handleProjectClick(project)}
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Play className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center px-3">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/20 backdrop-blur flex items-center justify-center border border-gold/50">
                          <Play className="w-6 h-6 text-gold" />
                        </div>
                        <h3 className={cn(
                          "font-medium text-white",
                          isShort ? "text-sm" : "text-lg"
                        )}>
                          {project.title}
                        </h3>
                      </div>
                    </div>

                    {/* Category / Type Tags */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur text-xs font-medium text-white capitalize">
                        {project.niche}
                      </span>
                      {isShort && (
                        <span className="px-2.5 py-1 rounded-full bg-red-600/80 backdrop-blur text-xs font-medium text-white">
                          Shorts
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {allFilteredProjects && allFilteredProjects.length > visibleCount && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={loadMore}
                className="px-8 py-3 rounded-full bg-transparent border border-gold text-gold hover:bg-gold hover:text-primary-foreground font-medium transition-colors duration-300"
              >
                Carregar mais
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={handleCloseModal}
        videoUrl={selectedVideo?.videoUrl || ""}
        videoType={selectedVideo?.videoType}
      />
    </Layout>
  );
}
