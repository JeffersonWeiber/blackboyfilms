import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export const SectionTitle = React.forwardRef<HTMLDivElement, SectionTitleProps>(
  ({ title, subtitle, align = "center", className }, forwardedRef) => {
    const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

    return (
      <div
        ref={ref}
        className={cn(
          "reveal mb-12 md:mb-16",
          isVisible && "visible",
          align === "center" && "text-center",
          align === "right" && "text-right",
          className
        )}
      >
        {subtitle && (
          <span className="inline-block text-gold text-sm font-medium tracking-widest uppercase mb-4">
            {subtitle}
          </span>
        )}
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide">
          {title}
        </h2>
        <div className={cn(
          "section-divider mt-6",
          align === "left" && "mx-0",
          align === "right" && "ml-auto mr-0"
        )} />
      </div>
    );
  }
);
SectionTitle.displayName = "SectionTitle";
