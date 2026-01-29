import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NicheCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  className?: string;
}

export function NicheCard({ title, description, image, href, className }: NicheCardProps) {
  const handleClick = () => {
    // Track click_nicho_card event
    console.log("Event: click_nicho_card", { niche: title });
  };

  return (
    <Link
      to={href}
      onClick={handleClick}
      className={cn(
        "niche-card block group rounded-lg h-80 md:h-96 flex flex-col bg-card border border-border/50",
        className
      )}
    >
      {/* Image Section - Top ~55% */}
      <div className="relative h-[55%] overflow-hidden rounded-t-lg">
        <img
          src={image}
          alt={title}
          className="niche-image w-full h-full object-cover"
          loading="lazy"
        />
        {/* Subtle fade at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
      </div>

      {/* Content Section - Bottom ~45% */}
      <div className="flex flex-col justify-between flex-1 p-5 md:p-6">
        <div>
          <h3 className="font-display text-2xl md:text-3xl tracking-wide text-gold mb-2">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm md:text-base line-clamp-2">
            {description}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-gold font-medium text-sm mt-3 group-hover:gap-3 transition-all duration-300">
          <span>Ver mais</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
