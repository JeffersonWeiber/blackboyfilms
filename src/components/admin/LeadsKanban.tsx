import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KanbanColumn } from "./KanbanColumn";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { triggerWebhook } from "@/hooks/useWebhook";
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
  phone_e164: string | null;
  email: string;
  niche: string;
  city: string | null;
  message: string;
  created_at: string;
  status: string | null;
  notes: string | null;
  source_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  consent: boolean | null;
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
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, status, previousStatus }: { leadId: string; status: string; previousStatus: string }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return { lead: data as Lead, previousStatus };
    },
    onSuccess: ({ lead, previousStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["kanban-leads"] });
      toast.success("Status atualizado!");
      
      // Trigger webhook for status change
      triggerWebhook("status_changed", {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        phone_e164: lead.phone_e164,
        niche: lead.niche,
        city: lead.city,
        message: lead.message,
        status: lead.status,
        notes: lead.notes,
        source_page: lead.source_page,
        utm_source: lead.utm_source,
        utm_medium: lead.utm_medium,
        utm_campaign: lead.utm_campaign,
        utm_content: lead.utm_content,
        utm_term: lead.utm_term,
        consent: lead.consent,
        created_at: lead.created_at,
      }, previousStatus);
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
      const previousStatus = lead?.status || "novo";
      if (lead && previousStatus !== status) {
        updateStatusMutation.mutate({ leadId: draggedLeadId, status, previousStatus });
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
