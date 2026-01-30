import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, X, Upload } from "lucide-react";
import {
  useUploadNicheCover,
  useDeleteNicheCover,
  isNicheCoverUrl,
} from "@/hooks/useNicheCover";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  slug: z.string().min(1, "Slug é obrigatório").max(100)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().min(1, "Descrição é obrigatória").max(500),
  whatsapp_template: z.string().max(1000).optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  display_order: z.coerce.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NichesForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cover image state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);

  // Upload/delete mutations
  const uploadCover = useUploadNicheCover();
  const deleteCover = useDeleteNicheCover();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      whatsapp_template: "",
      is_featured: false,
      is_active: true,
      display_order: 0,
    },
  });

  // Auto-generate slug from name
  const watchedName = form.watch("name");
  useEffect(() => {
    if (!isEditing && watchedName) {
      const slug = generateSlug(watchedName);
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [watchedName, isEditing, form]);

  // Fetch existing item if editing
  const { data: niche, isLoading: isLoadingNiche } = useQuery({
    queryKey: ["niche", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("niches")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Populate form when niche loads
  useEffect(() => {
    if (niche) {
      form.reset({
        name: niche.name,
        slug: niche.slug,
        description: niche.description,
        whatsapp_template: niche.whatsapp_template || "",
        is_featured: niche.is_featured,
        is_active: niche.is_active,
        display_order: niche.display_order,
      });
      setExistingCoverUrl(niche.cover_image || null);
    }
  }, [niche, form]);

  // Handle cover file change
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Use JPG, PNG ou WebP",
        variant: "destructive",
      });
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // Handle cover removal
  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setExistingCoverUrl(null);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let coverUrl = existingCoverUrl;

      // Upload new cover if selected
      if (coverFile) {
        // Delete old cover if it's from our bucket
        if (existingCoverUrl && isNicheCoverUrl(existingCoverUrl)) {
          try {
            await deleteCover.mutateAsync(existingCoverUrl);
          } catch (err) {
            console.warn("Failed to delete old cover:", err);
          }
        }
        coverUrl = await uploadCover.mutateAsync(coverFile);
      }

      // If user removed cover (no file, no existing)
      if (!coverFile && !existingCoverUrl && niche?.cover_image && isNicheCoverUrl(niche.cover_image)) {
        try {
          await deleteCover.mutateAsync(niche.cover_image);
        } catch (err) {
          console.warn("Failed to delete removed cover:", err);
        }
      }

      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        cover_image: coverUrl,
        whatsapp_template: values.whatsapp_template || null,
        is_featured: values.is_featured,
        is_active: values.is_active,
        display_order: values.display_order,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("niches")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("niches").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["niches"] });
      toast({ title: isEditing ? "Nicho atualizado" : "Nicho criado" });
      navigate("/admin/nichos");
    },
    onError: (error: Error) => {
      console.error("Save error:", error);
      if (error.message.includes("duplicate key")) {
        toast({ title: "Esse slug já existe", variant: "destructive" });
      } else {
        toast({ title: "Erro ao salvar", variant: "destructive" });
      }
    },
  });

  const onSubmit = (values: FormValues) => {
    saveMutation.mutate(values);
  };

  if (isEditing && isLoadingNiche) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const isUploading = uploadCover.isPending || deleteCover.isPending;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/nichos")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">
              {isEditing ? "Editar Nicho" : "Novo Nicho"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Atualize as informações do nicho" : "Crie uma nova categoria de serviço"}
            </p>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Casamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: casamento" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL: /nicho/{field.value || "slug"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição curta do nicho..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cover Image Upload */}
            <FormItem>
              <FormLabel>Imagem de Capa</FormLabel>
              <div className="flex items-start gap-4">
                {/* Preview */}
                {(coverPreview || existingCoverUrl) && (
                  <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-border flex-shrink-0">
                    <img
                      src={coverPreview || existingCoverUrl || ""}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="absolute top-1 right-1 p-1 bg-destructive rounded-full hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-3 h-3 text-destructive-foreground" />
                    </button>
                  </div>
                )}

                {/* Upload Input */}
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverChange}
                      className="cursor-pointer"
                    />
                  </div>
                  <FormDescription>
                    JPG, PNG ou WebP. Máximo 5MB. Recomendado: 800x600
                  </FormDescription>
                </div>
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="whatsapp_template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template WhatsApp</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Olá! Tenho interesse em saber mais sobre..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mensagem pré-preenchida ao clicar no WhatsApp
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Destaque</FormLabel>
                      <FormDescription>Exibir na Home</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ativo</FormLabel>
                      <FormDescription>Visível no site</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/nichos")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending || isUploading}>
                {(saveMutation.isPending || isUploading) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isEditing ? "Salvar Alterações" : "Criar Nicho"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
