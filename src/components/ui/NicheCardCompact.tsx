import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface NicheCardCompactProps {
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function NicheCardCompact({
  name,
  slug,
  description,
  coverImage,
  className,
  style,
  onClick,
}: NicheCardCompactProps) {
  const defaultImage = "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80";

  return (
    <Link
      to={`/nicho/${slug}`}
      onClick={onClick}
      className={cn(
        "group block rounded-lg overflow-hidden bg-card border border-border/50",
        "transition-all duration-300 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5",
        className
      )}
      style={style}
    >
      {/* Image */}
      <div className="overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <img
            src={coverImage || defaultImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </AspectRatio>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg text-gold mb-1 line-clamp-1">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>
        <span className="inline-flex items-center text-xs text-gold font-medium group-hover:gap-2 transition-all">
          Ver mais
          <ArrowRight className="w-3 h-3 ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </span>
      </div>
    </Link>
  );
}
