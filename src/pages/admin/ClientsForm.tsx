import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Loader2, Upload, X, ImageIcon } from "lucide-react";
import {
  useClient,
  useCreateClient,
  useUpdateClient,
  useUploadClientLogo,
  useDeleteClientLogo,
} from "@/hooks/useClients";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Máximo 100 caracteres"),
  website_url: z.string().url("URL inválida").optional().or(z.literal("")),
  category: z.string().max(50, "Máximo 50 caracteres").optional(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  display_order: z.coerce.number().min(0, "Valor mínimo é 0"),
});

type FormData = z.infer<typeof formSchema>;

export default function ClientsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: client, isLoading: isLoadingClient } = useClient(id);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const uploadLogo = useUploadClientLogo();
  const deleteLogo = useDeleteClientLogo();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      website_url: "",
      category: "",
      is_featured: true,
      is_active: true,
      display_order: 0,
    },
  });

  // Load existing client data
  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        website_url: client.website_url || "",
        category: client.category || "",
        is_featured: client.is_featured,
        is_active: client.is_active,
        display_order: client.display_order,
      });
      setExistingLogoUrl(client.logo_url);
    }
  }, [client, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/svg+xml", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      form.setError("name", {
        message: "Formato inválido. Use SVG, PNG ou WebP",
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      form.setError("name", { message: "Arquivo muito grande. Máximo 2MB" });
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (!isEdit) {
      setExistingLogoUrl(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let logoUrl = existingLogoUrl;

      // Upload new logo if selected
      if (logoFile) {
        // Delete old logo if exists
        if (existingLogoUrl) {
          await deleteLogo.mutateAsync(existingLogoUrl);
        }
        logoUrl = await uploadLogo.mutateAsync(logoFile);
      }

      // Require logo
      if (!logoUrl) {
        form.setError("name", { message: "Logo é obrigatória" });
        return;
      }

      const clientData = {
        name: data.name,
        logo_url: logoUrl,
        website_url: data.website_url || null,
        category: data.category || null,
        is_featured: data.is_featured,
        is_active: data.is_active,
        display_order: data.display_order,
      };

      if (isEdit && id) {
        await updateClient.mutateAsync({ id, ...clientData });
      } else {
        await createClient.mutateAsync(clientData);
      }

      navigate("/admin/clients");
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const isSubmitting =
    createClient.isPending ||
    updateClient.isPending ||
    uploadLogo.isPending;

  if (isEdit && isLoadingClient) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/clients")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold tracking-wide">
            {isEdit ? "Editar Cliente" : "Novo Cliente"}
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <FormLabel>Logo *</FormLabel>
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div
                  className={cn(
                    "w-32 h-20 rounded-lg border-2 border-dashed border-border",
                    "flex items-center justify-center bg-muted/20 relative overflow-hidden"
                  )}
                >
                  {logoPreview || existingLogoUrl ? (
                    <>
                      <img
                        src={logoPreview || existingLogoUrl || ""}
                        alt="Preview"
                        className="max-h-16 max-w-28 object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <label
                    htmlFor="logo-upload"
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-3",
                      "border border-border rounded-lg cursor-pointer",
                      "hover:bg-muted/50 transition-colors",
                      "text-sm text-muted-foreground"
                    )}
                  >
                    <Upload className="h-4 w-4" />
                    Escolher arquivo
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept=".svg,.png,.webp,image/svg+xml,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    SVG, PNG ou WebP. Máximo 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website URL */}
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Link externo (abre em nova aba ao clicar na logo)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tecnologia, Saúde..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Order */}
            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem de exibição</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormDescription>
                    Menor número aparece primeiro
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Destaque</FormLabel>
                      <FormDescription>
                        Exibir na seção da Home
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>
                        Pausar sem excluir
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/clients")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isEdit ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
