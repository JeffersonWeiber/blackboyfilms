import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

type Lead = {
  id: string;
  created_at: string;
  status: string | null;
  niche: string;
  utm_source: string | null;
  source_page: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  novo: "#3B82F6",
  em_contato: "#F59E0B",
  proposta_enviada: "#8B5CF6",
  fechado: "#10B981",
  perdido: "#EF4444",
};

const STATUS_LABELS: Record<string, string> = {
  novo: "Novos",
  em_contato: "Em Contato",
  proposta_enviada: "Proposta",
  fechado: "Fechados",
  perdido: "Perdidos",
};

const NICHE_COLORS = [
  "#D4AF37",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
];

export default function Analytics() {
  const [period, setPeriod] = useState("30");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["analytics-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, created_at, status, niche, utm_source, source_page")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    const cutoff = subDays(new Date(), parseInt(period));
    return leads.filter((lead) => new Date(lead.created_at) >= cutoff);
  }, [leads, period]);

  // KPIs
  const kpis = useMemo(() => {
    if (!filteredLeads.length) {
      return { total: 0, conversion: 0, newLeads: 0, trend: 0 };
    }

    const total = filteredLeads.length;
    const closed = filteredLeads.filter((l) => l.status === "fechado").length;
    const conversion = total > 0 ? ((closed / total) * 100).toFixed(1) : "0";
    const newLeads = filteredLeads.filter((l) => l.status === "novo").length;

    // Trend: compare first half vs second half of period
    const halfPeriod = Math.floor(parseInt(period) / 2);
    const midPoint = subDays(new Date(), halfPeriod);
    const recentLeads = filteredLeads.filter(
      (l) => new Date(l.created_at) >= midPoint
    ).length;
    const olderLeads = filteredLeads.filter(
      (l) => new Date(l.created_at) < midPoint
    ).length;
    const trend = olderLeads > 0 ? (((recentLeads - olderLeads) / olderLeads) * 100).toFixed(0) : 0;

    return { total, conversion, newLeads, trend: Number(trend) };
  }, [filteredLeads, period]);

  // Leads over time chart data
  const leadsOverTime = useMemo(() => {
    if (!filteredLeads.length) return [];

    const days = parseInt(period);
    const interval = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date(),
    });

    return interval.map((date) => {
      const dayLeads = filteredLeads.filter(
        (lead) =>
          format(new Date(lead.created_at), "yyyy-MM-dd") ===
          format(date, "yyyy-MM-dd")
      );
      return {
        date: format(date, "dd/MM", { locale: ptBR }),
        leads: dayLeads.length,
      };
    });
  }, [filteredLeads, period]);

  // Leads by niche
  const leadsByNiche = useMemo(() => {
    if (!filteredLeads.length) return [];

    const nicheCount: Record<string, number> = {};
    filteredLeads.forEach((lead) => {
      nicheCount[lead.niche] = (nicheCount[lead.niche] || 0) + 1;
    });

    return Object.entries(nicheCount)
      .map(([niche, count]) => ({ niche, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredLeads]);

  // Leads by status (for pie chart)
  const leadsByStatus = useMemo(() => {
    if (!filteredLeads.length) return [];

    const statusCount: Record<string, number> = {};
    filteredLeads.forEach((lead) => {
      const status = lead.status || "novo";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || "#6B7280",
    }));
  }, [filteredLeads]);

  // Funnel data
  const funnelData = useMemo(() => {
    if (!filteredLeads.length) return [];

    const statusOrder = ["novo", "em_contato", "proposta_enviada", "fechado"];
    const statusCounts: Record<string, number> = {};

    filteredLeads.forEach((lead) => {
      const status = lead.status || "novo";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Cumulative funnel: each stage includes leads from that stage onwards
    let cumulative = 0;
    return statusOrder.reverse().map((status) => {
      cumulative += statusCounts[status] || 0;
      return {
        name: STATUS_LABELS[status],
        value: cumulative,
        fill: STATUS_COLORS[status],
      };
    }).reverse();
  }, [filteredLeads]);

  // Traffic sources
  const trafficSources = useMemo(() => {
    if (!filteredLeads.length) return [];

    const sourceCount: Record<string, number> = {};
    filteredLeads.forEach((lead) => {
      const source = lead.utm_source || "Direto";
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });

    return Object.entries(sourceCount)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredLeads]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl tracking-wide">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Métricas e desempenho dos leads
            </p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{kpis.total}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {kpis.trend >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={kpis.trend >= 0 ? "text-green-500" : "text-red-500"}>
                      {Math.abs(kpis.trend)}%
                    </span>
                    <span className="ml-1">vs período anterior</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{kpis.conversion}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Leads convertidos em clientes
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{kpis.newLeads}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aguardando primeiro contato
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nichos Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{leadsByNiche.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Categorias com leads
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Leads Over Time */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display tracking-wide">
                Leads ao Longo do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={leadsOverTime}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="date"
                      stroke="#666"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis stroke="#666" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="leads"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorLeads)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Leads by Niche */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display tracking-wide">
                Leads por Nicho
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leadsByNiche} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#666" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="niche"
                      stroke="#666"
                      fontSize={12}
                      width={100}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {leadsByNiche.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={NICHE_COLORS[index % NICHE_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Status Distribution */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display tracking-wide">
                Distribuição por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {leadsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {leadsByStatus.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display tracking-wide">
                Origem do Tráfego
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : trafficSources.length > 0 ? (
                <div className="space-y-4">
                  {trafficSources.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{source.source}</span>
                        <span className="text-sm text-muted-foreground">
                          {source.count} leads
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold rounded-full transition-all"
                          style={{
                            width: `${(source.count / trafficSources[0].count) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado de tráfego disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Funnel */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display tracking-wide">
              Funil de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {funnelData.map((stage, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="mx-auto mb-2 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                      style={{
                        backgroundColor: stage.fill,
                        height: "80px",
                        width: `${100 - index * 15}%`,
                      }}
                    >
                      {stage.value}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stage.name}
                    </span>
                    {index < funnelData.length - 1 && funnelData[index + 1] && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {funnelData[index + 1].value > 0
                          ? `${((funnelData[index + 1].value / stage.value) * 100).toFixed(0)}%`
                          : "0%"}{" "}
                        →
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
