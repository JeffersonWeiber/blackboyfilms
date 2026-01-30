import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { 
  Webhook, 
  Save,
  CheckCircle,
  AlertCircle,
  Zap,
  TestTube
} from "lucide-react";

interface WebhookConfig {
  enabled: boolean;
  url: string;
  send_on_create: boolean;
  send_on_update: boolean;
  send_on_status_change: boolean;
}

const defaultWebhookConfig: WebhookConfig = {
  enabled: false,
  url: "",
  send_on_create: true,
  send_on_update: true,
  send_on_status_change: true,
};

export default function Config() {
  const { role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<WebhookConfig>(defaultWebhookConfig);
  const [isTesting, setIsTesting] = useState(false);

  const isAdmin = role === "admin";

  const { data: config, isLoading } = useQuery({
    queryKey: ["webhook-config"],
    queryFn: async (): Promise<WebhookConfig> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "webhook_config")
        .maybeSingle();

      if (error) {
        console.error("Error fetching webhook config:", error);
        return defaultWebhookConfig;
      }

      if (!data) {
        return defaultWebhookConfig;
      }

      return data.value as unknown as WebhookConfig;
    },
  });

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: async (newConfig: WebhookConfig) => {
      // Check if the setting exists
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", "webhook_config")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ 
            value: JSON.parse(JSON.stringify(newConfig)) as Json,
            updated_at: new Date().toISOString() 
          })
          .eq("key", "webhook_config");

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ 
            key: "webhook_config",
            value: JSON.parse(JSON.stringify(newConfig)) as Json
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-config"] });
      toast({
        title: "Configurações salvas",
        description: "O webhook foi configurado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleTestWebhook = async () => {
    if (!formData.url) {
      toast({
        title: "URL não configurada",
        description: "Por favor, insira a URL do webhook antes de testar.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);

    try {
      await fetch(formData.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          event: "test",
          timestamp: new Date().toISOString(),
          source: "blackboy_films_admin",
          data: {
            message: "Teste de webhook da Blackboy Films",
            lead_sample: {
              id: "test-uuid",
              name: "Lead de Teste",
              email: "teste@exemplo.com",
              phone: "(11) 99999-9999",
              niche: "casamento",
              status: "novo",
              message: "Esta é uma mensagem de teste do webhook.",
              created_at: new Date().toISOString(),
            }
          }
        }),
      });

      toast({
        title: "Requisição enviada",
        description: "O webhook foi disparado. Verifique sua ferramenta de automação para confirmar o recebimento.",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast({
        title: "Erro ao testar",
        description: "Não foi possível enviar a requisição. Verifique a URL.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Configure integrações e automações do sistema
          </p>
        </div>

        {!isAdmin && (
          <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Você tem permissão apenas para visualizar. Apenas administradores podem editar.
            </p>
          </div>
        )}

        {/* Webhook Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Webhook className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Webhook de Automação</CardTitle>
                  <CardDescription>
                    Envie dados de leads para Zapier, Make, n8n ou qualquer ferramenta
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={formData.enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, enabled: checked }))
                }
                disabled={!isAdmin}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL do Webhook</Label>
              <div className="relative">
                <Input
                  id="webhook-url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={formData.url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, url: e.target.value }))
                  }
                  disabled={!isAdmin}
                  className="pr-10"
                />
                {formData.url && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {validateUrl(formData.url) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Cole aqui a URL do webhook do Zapier, Make, n8n ou outra ferramenta de automação.
              </p>
            </div>

            {/* Trigger Options */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Disparar webhook quando:</Label>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm">Novo lead criado</p>
                  <p className="text-xs text-muted-foreground">Formulário enviado</p>
                </div>
                <Switch
                  checked={formData.send_on_create}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, send_on_create: checked }))
                  }
                  disabled={!isAdmin}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm">Lead atualizado</p>
                  <p className="text-xs text-muted-foreground">Qualquer alteração nos dados</p>
                </div>
                <Switch
                  checked={formData.send_on_update}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, send_on_update: checked }))
                  }
                  disabled={!isAdmin}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm">Status alterado</p>
                  <p className="text-xs text-muted-foreground">Movimentação no Kanban</p>
                </div>
                <Switch
                  checked={formData.send_on_status_change}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, send_on_status_change: checked }))
                  }
                  disabled={!isAdmin}
                />
              </div>
            </div>

            {/* Test Button */}
            {isAdmin && formData.url && (
              <Button
                variant="outline"
                onClick={handleTestWebhook}
                disabled={isTesting}
                className="gap-2"
              >
                <TestTube className="h-4 w-4" />
                {isTesting ? "Enviando..." : "Testar Webhook"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Data Sent Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Enviados</CardTitle>
            <CardDescription>
              Informações que serão enviadas para o webhook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-muted-foreground">
{`{
  "event": "lead_created | lead_updated | status_changed",
  "timestamp": "2025-01-30T12:00:00.000Z",
  "source": "blackboy_films",
  "data": {
    "id": "uuid",
    "name": "Nome Completo",
    "email": "email@exemplo.com",
    "phone": "(11) 99999-9999",
    "phone_e164": "+5511999999999",
    "niche": "casamento",
    "city": "Cascavel",
    "message": "Mensagem do lead...",
    "status": "novo | em_contato | proposta_enviada | fechado | perdido",
    "notes": "Observações internas",
    "source_page": "/contato",
    "utm_source": "instagram",
    "utm_medium": "social",
    "utm_campaign": "campanha",
    "consent": true,
    "created_at": "2025-01-30T12:00:00.000Z"
  },
  "previous_status": "novo" // apenas para status_changed
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Integration Tips */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>
              <CardTitle className="text-lg">Dicas de Integração</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-orange-500/50 text-orange-500">Zapier</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Crie um Zap com trigger "Webhooks by Zapier" → "Catch Hook" e cole a URL gerada acima.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500/50 text-blue-500">Make</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Crie um cenário com módulo "Webhooks" → "Custom webhook" e use a URL gerada.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-500/50 text-green-500">n8n</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Use o node "Webhook" como trigger e configure para receber POST requests.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        {isAdmin && (
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
