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
      className={cn("niche-card block group rounded-lg h-80 md:h-96", className)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="niche-image w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
          <h3 className="font-display text-3xl md:text-4xl tracking-wide text-white mb-2">
            {title}
          </h3>
          <p className="text-white/80 text-sm md:text-base mb-4 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center gap-2 text-gold font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Ver projetos</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
