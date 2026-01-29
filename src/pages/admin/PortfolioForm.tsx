import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { VideoPreview } from "@/components/admin/VideoPreview";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { detectVideoType, isValidVideoUrl, generateThumbnailUrl } from "@/lib/videoUtils";

const nicheOptions = [
  { value: "casamento", label: "Casamento" },
  { value: "eventos", label: "Eventos" },
  { value: "clinicas", label: "Clínicas" },
  { value: "marcas", label: "Marcas" },
  { value: "food", label: "Food" },
  { value: "imobiliario", label: "Imobiliário" },
];

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200),
  description: z.string().max(1000).optional(),
  niche: z.string().min(1, "Selecione um nicho"),
  video_url: z.string().min(1, "URL do vídeo é obrigatória").refine(
    (url) => isValidVideoUrl(url),
    "URL inválida. Use um link do YouTube ou Google Drive"
  ),
  thumbnail_url: z.string().url("URL inválida").optional().or(z.literal("")),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  display_order: z.coerce.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function PortfolioForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      niche: "",
      video_url: "",
      thumbnail_url: "",
      is_published: false,
      is_featured: false,
      display_order: 0,
    },
  });

  // Watch video URL for preview
  const watchedVideoUrl = form.watch("video_url");
  useEffect(() => {
    setVideoUrl(watchedVideoUrl);
  }, [watchedVideoUrl]);

  // Fetch existing item if editing
  const { data: item, isLoading: isLoadingItem } = useQuery({
    queryKey: ["portfolio-item", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Populate form when item loads
  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title,
        description: item.description || "",
        niche: item.niche,
        video_url: item.video_url,
        thumbnail_url: item.thumbnail_url || "",
        is_published: item.is_published,
        is_featured: item.is_featured,
        display_order: item.display_order,
      });
    }
  }, [item, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const videoType = detectVideoType(values.video_url);
      const thumbnailUrl = values.thumbnail_url || generateThumbnailUrl(values.video_url) || null;

      const payload = {
        title: values.title,
        description: values.description || null,
        niche: values.niche,
        video_url: values.video_url,
        video_type: videoType,
        thumbnail_url: thumbnailUrl,
        is_published: values.is_published,
        is_featured: values.is_featured,
        display_order: values.display_order,
        created_by: user?.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("portfolio_items")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("portfolio_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-items"] });
      toast({ title: isEditing ? "Projeto atualizado" : "Projeto criado" });
      navigate("/admin/portfolio");
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast({ title: "Erro ao salvar", variant: "destructive" });
    },
  });

  const onSubmit = (values: FormValues) => {
    saveMutation.mutate(values);
  };

  if (isEditing && isLoadingItem) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/portfolio")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">
              {isEditing ? "Editar Projeto" : "Novo Projeto"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Atualize as informações do projeto" : "Adicione um novo projeto ao portfólio"}
            </p>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Projeto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Wedding Film - Ana & Pedro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Uma breve descrição do projeto..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="niche"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nicho *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nicho" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {nicheOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem de exibição</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>Menor número = aparece primeiro</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="video_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Vídeo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://youtube.com/watch?v=... ou https://drive.google.com/file/d/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Cole um link do YouTube ou Google Drive
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Video Preview */}
            <div>
              <label className="text-sm font-medium mb-2 block">Preview do Vídeo</label>
              <VideoPreview url={videoUrl} />
            </div>

            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail Customizada</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Deixe vazio para usar a thumbnail automática do vídeo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-6">
              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Publicado</FormLabel>
                      <FormDescription>Visível no site público</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Destaque</FormLabel>
                      <FormDescription>Exibir na home</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/portfolio")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Criar Projeto"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
