import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  inProgressLeads: number;
  closedLeads: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: leads, error } = await supabase
        .from("leads")
        .select("status");

      if (error) throw error;

      const totalLeads = leads?.length || 0;
      const newLeads = leads?.filter(l => l.status === "novo").length || 0;
      const inProgressLeads = leads?.filter(l => 
        l.status === "em_contato" || l.status === "proposta_enviada"
      ).length || 0;
      const closedLeads = leads?.filter(l => l.status === "fechado").length || 0;

      setStats({
        totalLeads,
        newLeads,
        inProgressLeads,
        closedLeads,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: "Total de Leads", 
      value: stats?.totalLeads || 0, 
      icon: Users,
      description: "Todos os leads recebidos"
    },
    { 
      title: "Novos", 
      value: stats?.newLeads || 0, 
      icon: TrendingUp,
      description: "Aguardando primeiro contato"
    },
    { 
      title: "Em Andamento", 
      value: stats?.inProgressLeads || 0, 
      icon: Clock,
      description: "Em negociação"
    },
    { 
      title: "Fechados", 
      value: stats?.closedLeads || 0, 
      icon: CheckCircle,
      description: "Projetos confirmados"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl tracking-wide">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu negócio
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display tracking-wide">Ações Rápidas</CardTitle>
            <CardDescription>
              Gerencie seus leads e acompanhe métricas
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <a 
              href="/admin/leads"
              className="p-4 rounded-lg border border-border/50 hover:border-gold/50 transition-colors group"
            >
              <Users className="h-6 w-6 text-gold mb-2" />
              <h3 className="font-medium group-hover:text-gold transition-colors">Ver Leads</h3>
              <p className="text-sm text-muted-foreground">
                Gerenciar todos os formulários
              </p>
            </a>
            <a 
              href="/admin/analytics"
              className="p-4 rounded-lg border border-border/50 hover:border-gold/50 transition-colors group"
            >
              <TrendingUp className="h-6 w-6 text-gold mb-2" />
              <h3 className="font-medium group-hover:text-gold transition-colors">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Visualizar métricas e gráficos
              </p>
            </a>
            <a 
              href="/contato"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg border border-border/50 hover:border-gold/50 transition-colors group"
            >
              <CheckCircle className="h-6 w-6 text-gold mb-2" />
              <h3 className="font-medium group-hover:text-gold transition-colors">Ver Formulário</h3>
              <p className="text-sm text-muted-foreground">
                Abrir página de contato
              </p>
            </a>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
