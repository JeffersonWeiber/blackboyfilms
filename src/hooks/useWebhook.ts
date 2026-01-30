import { supabase } from "@/integrations/supabase/client";

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

type WebhookEvent = "lead_created" | "lead_updated" | "status_changed" | "test";

export async function triggerWebhook(
  event: WebhookEvent,
  leadData: LeadData,
  previousStatus?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`[Webhook] Triggering event: ${event}`);

    const { data, error } = await supabase.functions.invoke("webhook-proxy", {
      body: {
        event,
        data: leadData,
        previous_status: previousStatus,
      },
    });

    if (error) {
      console.error("[Webhook] Error invoking edge function:", error);
      return { success: false, message: error.message };
    }

    console.log(`[Webhook] Response:`, data);
    return { success: data?.success ?? true, message: data?.message };
  } catch (error) {
    console.error("[Webhook] Error sending webhook:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
