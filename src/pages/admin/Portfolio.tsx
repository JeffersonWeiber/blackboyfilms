import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Star, Eye, EyeOff, Youtube, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectVideoType, generateThumbnailUrl } from "@/lib/videoUtils";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  niche: string;
  video_url: string;
  video_type: string;
  thumbnail_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

const nicheOptions = [
  { value: "all", label: "Todos os nichos" },
  { value: "casamento", label: "Casamento" },
  { value: "eventos", label: "Eventos" },
  { value: "clinicas", label: "Clínicas" },
  { value: "marcas", label: "Marcas" },
  { value: "food", label: "Food" },
  { value: "imobiliario", label: "Imobiliário" },
];

const statusOptions = [
  { value: "all", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "draft", label: "Rascunhos" },
];

export default function Portfolio() {
  const [search, setSearch] = useState("");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["portfolio-items", nicheFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("portfolio_items")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (nicheFilter !== "all") {
        query = query.eq("niche", nicheFilter);
      }

      if (statusFilter === "published") {
        query = query.eq("is_published", true);
      } else if (statusFilter === "draft") {
        query = query.eq("is_published", false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PortfolioItem[];
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("portfolio_items")
        .update({ is_published })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-items"] });
      toast({ title: "Status atualizado" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from("portfolio_items")
        .update({ is_featured })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-items"] });
      toast({ title: "Destaque atualizado" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-items"] });
      toast({ title: "Projeto excluído" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    },
  });

  const filteredItems = items?.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const getThumbnail = (item: PortfolioItem) => {
    return item.thumbnail_url || generateThumbnailUrl(item.video_url) || null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Portfólio</h1>
            <p className="text-muted-foreground">Gerencie os projetos do portfólio</p>
          </div>
          <Button asChild>
            <Link to="/admin/portfolio/new">
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={nicheFilter} onValueChange={setNicheFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Nicho" />
            </SelectTrigger>
            <SelectContent>
              {nicheOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Thumb</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Nicho</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredItems?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum projeto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems?.map((item) => {
                  const thumbnail = getThumbnail(item);
                  const videoType = detectVideoType(item.video_url);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="w-16 h-10 rounded overflow-hidden bg-muted">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {videoType === "youtube" ? (
                                <Youtube className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <HardDrive className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          {item.is_featured && (
                            <Star className="w-4 h-4 text-gold fill-gold" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="capitalize">
                          {item.niche}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {videoType === "youtube" ? (
                            <Youtube className="w-3 h-3" />
                          ) : (
                            <HardDrive className="w-3 h-3" />
                          )}
                          {videoType === "youtube" ? "YouTube" : "Drive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.is_published ? "default" : "secondary"}
                          className={cn(
                            item.is_published && "bg-green-600 hover:bg-green-700"
                          )}
                        >
                          {item.is_published ? "Publicado" : "Rascunho"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              toggleFeatured.mutate({
                                id: item.id,
                                is_featured: !item.is_featured,
                              })
                            }
                            title={item.is_featured ? "Remover destaque" : "Destacar"}
                          >
                            <Star
                              className={cn(
                                "w-4 h-4",
                                item.is_featured ? "text-gold fill-gold" : "text-muted-foreground"
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              togglePublish.mutate({
                                id: item.id,
                                is_published: !item.is_published,
                              })
                            }
                            title={item.is_published ? "Despublicar" : "Publicar"}
                          >
                            {item.is_published ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/portfolio/${item.id}/edit`}>
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O projeto "{item.title}" será
                                  removido permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteItem.mutate(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
