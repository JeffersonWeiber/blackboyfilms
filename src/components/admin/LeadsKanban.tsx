import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KanbanColumn } from "./KanbanColumn";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  niche: string;
  created_at: string;
  status: string | null;
};

const COLUMNS = [
  { status: "novo", title: "Novos", color: "bg-blue-500" },
  { status: "em_contato", title: "Em Contato", color: "bg-yellow-500" },
  { status: "proposta_enviada", title: "Proposta Enviada", color: "bg-purple-500" },
  { status: "fechado", title: "Fechados", color: "bg-green-500" },
  { status: "perdido", title: "Perdidos", color: "bg-red-500" },
];

const NICHES = [
  { value: "todos", label: "Todos os nichos" },
  { value: "casamento", label: "Casamento" },
  { value: "eventos", label: "Eventos" },
  { value: "clinicas", label: "Clínicas" },
  { value: "marcas", label: "Marcas & Ads" },
  { value: "food", label: "Food" },
  { value: "imobiliario", label: "Imobiliário" },
  { value: "outros", label: "Outros" },
];

export function LeadsKanban() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [nicheFilter, setNicheFilter] = useState("todos");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["kanban-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, phone, email, niche, created_at, status")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const { error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-leads"] });
      toast.success("Status atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    if (nicheFilter === "todos") return leads;
    return leads.filter(
      (lead) => lead.niche.toLowerCase() === nicheFilter.toLowerCase()
    );
  }, [leads, nicheFilter]);

  const getLeadsByStatus = (status: string) => {
    return filteredLeads.filter((lead) => (lead.status || "novo") === status);
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedLeadId) {
      const lead = leads?.find((l) => l.id === draggedLeadId);
      if (lead && (lead.status || "novo") !== status) {
        updateStatusMutation.mutate({ leadId: draggedLeadId, status });
      }
    }
    setDraggedLeadId(null);
  };

  const handleColumnDragEnter = (status: string) => {
    setDragOverColumn(status);
  };

  const handleCardClick = (leadId: string) => {
    navigate(`/admin/leads/${leadId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[500px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-end">
        <Select value={nicheFilter} onValueChange={setNicheFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por nicho" />
          </SelectTrigger>
          <SelectContent>
            {NICHES.map((niche) => (
              <SelectItem key={niche.value} value={niche.value}>
                {niche.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
        {COLUMNS.map((column) => (
          <div
            key={column.status}
            onDragEnter={() => handleColumnDragEnter(column.status)}
          >
            <KanbanColumn
              title={column.title}
              status={column.status}
              leads={getLeadsByStatus(column.status)}
              color={column.color}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onCardClick={handleCardClick}
              isDragOver={dragOverColumn === column.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
