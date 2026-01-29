import { cn } from "@/lib/utils";
import { KanbanCard } from "./KanbanCard";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  niche: string;
  created_at: string;
  status: string | null;
};

interface KanbanColumnProps {
  title: string;
  status: string;
  leads: Lead[];
  color: string;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: string) => void;
  onCardClick: (leadId: string) => void;
  isDragOver: boolean;
}

export function KanbanColumn({
  title,
  status,
  leads,
  color,
  onDragStart,
  onDragOver,
  onDrop,
  onCardClick,
  isDragOver,
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-muted/30 rounded-lg min-h-[500px] transition-colors",
        isDragOver && "ring-2 ring-gold/50 bg-gold/5"
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Header */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", color)} />
          <h3 className="font-medium text-sm">{title}</h3>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
            Nenhum lead
          </div>
        ) : (
          leads.map((lead) => (
            <KanbanCard
              key={lead.id}
              lead={lead}
              onDragStart={onDragStart}
              onClick={() => onCardClick(lead.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
