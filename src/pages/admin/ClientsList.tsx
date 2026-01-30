import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  Building2,
} from "lucide-react";
import {
  useAllClients,
  useUpdateClient,
  useDeleteClient,
  useDeleteClientLogo,
  Client,
} from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";

export default function ClientsList() {
  const { role } = useAuth();
  const { data: clients, isLoading } = useAllClients();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const deleteClientLogo = useDeleteClientLogo();

  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const filteredClients = clients?.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleFeatured = async (client: Client) => {
    await updateClient.mutateAsync({
      id: client.id,
      is_featured: !client.is_featured,
    });
  };

  const handleToggleActive = async (client: Client) => {
    await updateClient.mutateAsync({
      id: client.id,
      is_active: !client.is_active,
    });
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;

    // Delete logo from storage first
    if (clientToDelete.logo_url) {
      await deleteClientLogo.mutateAsync(clientToDelete.logo_url);
    }

    await deleteClient.mutateAsync(clientToDelete.id);
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const confirmDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">Clientes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie os logos de clientes exibidos na Home
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/clients/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : !filteredClients?.length ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {search
                ? "Tente ajustar sua busca"
                : "Comece adicionando seu primeiro cliente"}
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[80px]">Logo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="text-center w-[100px]">Featured</TableHead>
                  <TableHead className="text-center w-[100px]">Ativo</TableHead>
                  <TableHead className="text-center w-[80px]">Ordem</TableHead>
                  <TableHead className="text-right w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="w-16 h-10 bg-muted/20 rounded flex items-center justify-center overflow-hidden">
                        <img
                          src={client.logo_url}
                          alt={client.name}
                          className="max-h-8 max-w-14 object-contain"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{client.name}</div>
                      {client.website_url && (
                        <a
                          href={client.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-gold flex items-center gap-1 mt-0.5"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Website
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {client.category ? (
                        <Badge variant="secondary">{client.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={client.is_featured}
                        onCheckedChange={() => handleToggleFeatured(client)}
                        disabled={updateClient.isPending}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={client.is_active}
                        onCheckedChange={() => handleToggleActive(client)}
                        disabled={updateClient.isPending}
                      />
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {client.display_order}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" asChild>
                          <Link to={`/admin/clients/${client.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {role === "admin" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => confirmDelete(client)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir "{clientToDelete?.name}"? Esta ação
                não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
