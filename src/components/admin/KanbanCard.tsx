import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Phone, Mail, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  niche: string;
  created_at: string;
  status: string | null;
};

interface KanbanCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onClick: () => void;
}

const NICHE_COLORS: Record<string, string> = {
  casamento: "bg-pink-500/20 text-pink-400",
  eventos: "bg-purple-500/20 text-purple-400",
  clinicas: "bg-blue-500/20 text-blue-400",
  marcas: "bg-orange-500/20 text-orange-400",
  food: "bg-green-500/20 text-green-400",
  imobiliario: "bg-cyan-500/20 text-cyan-400",
  outros: "bg-gray-500/20 text-gray-400",
};

export function KanbanCard({ lead, onDragStart, onClick }: KanbanCardProps) {
  const nicheKey = lead.niche.toLowerCase().replace(/\s+/g, "");
  const nicheColor = NICHE_COLORS[nicheKey] || NICHE_COLORS.outros;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = lead.phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${phone}`, "_blank");
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`mailto:${lead.email}`, "_blank");
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={onClick}
      className={cn(
        "bg-card border border-border/50 rounded-lg p-3 cursor-grab active:cursor-grabbing",
        "hover:border-gold/50 transition-all duration-200",
        "group"
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h4 className="font-medium text-sm truncate">{lead.name}</h4>

          {/* Phone */}
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {lead.phone}
          </p>

          {/* Niche tag */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full capitalize",
                nicheColor
              )}
            >
              {lead.niche}
            </span>
          </div>

          {/* Date and quick actions */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">
              {format(new Date(lead.created_at), "dd MMM", { locale: ptBR })}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleWhatsApp}
                className="p-1 hover:bg-green-500/20 rounded transition-colors"
                title="WhatsApp"
              >
                <Phone className="h-3 w-3 text-green-500" />
              </button>
              <button
                onClick={handleEmail}
                className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                title="Email"
              >
                <Mail className="h-3 w-3 text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
