import { supabase } from "@/integrations/supabase/client";

interface WebhookConfig {
  enabled: boolean;
  url: string;
  send_on_create: boolean;
  send_on_update: boolean;
  send_on_status_change: boolean;
}

interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_e164?: string | null;
  niche: string;
  city?: string | null;
  message: string;
  status?: string | null;
  notes?: string | null;
  source_page?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  consent?: boolean | null;
  created_at: string;
}

type WebhookEvent = "lead_created" | "lead_updated" | "status_changed";

async function getWebhookConfig(): Promise<WebhookConfig | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "webhook_config")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.value as unknown as WebhookConfig;
}

export async function triggerWebhook(
  event: WebhookEvent,
  leadData: LeadData,
  previousStatus?: string
): Promise<void> {
  try {
    const config = await getWebhookConfig();

    if (!config || !config.enabled || !config.url) {
      return;
    }

    // Check if this event type should trigger the webhook
    if (event === "lead_created" && !config.send_on_create) return;
    if (event === "lead_updated" && !config.send_on_update) return;
    if (event === "status_changed" && !config.send_on_status_change) return;

    const payload: Record<string, unknown> = {
      event,
      timestamp: new Date().toISOString(),
      source: "blackboy_films",
      data: {
        id: leadData.id,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        phone_e164: leadData.phone_e164,
        niche: leadData.niche,
        city: leadData.city,
        message: leadData.message,
        status: leadData.status,
        notes: leadData.notes,
        source_page: leadData.source_page,
        utm_source: leadData.utm_source,
        utm_medium: leadData.utm_medium,
        utm_campaign: leadData.utm_campaign,
        utm_content: leadData.utm_content,
        utm_term: leadData.utm_term,
        consent: leadData.consent,
        created_at: leadData.created_at,
      },
    };

    if (event === "status_changed" && previousStatus) {
      payload.previous_status = previousStatus;
    }

    // Send webhook (no-cors mode for cross-origin requests)
    await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors",
      body: JSON.stringify(payload),
    });

    console.log(`[Webhook] Event "${event}" sent successfully`);
  } catch (error) {
    console.error("[Webhook] Error sending webhook:", error);
  }
}
