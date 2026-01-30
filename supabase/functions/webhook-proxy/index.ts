import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WebhookConfig {
  enabled: boolean;
  url: string;
  secret?: string;
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

type WebhookEvent = "lead_created" | "lead_updated" | "status_changed" | "test";

interface RequestBody {
  event: WebhookEvent;
  data: LeadData;
  previous_status?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: RequestBody = await req.json();
    const { event, data, previous_status } = body;

    console.log(`[webhook-proxy] Received event: ${event}`);

    // Fetch webhook config from database
    const { data: configData, error: configError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "webhook_config")
      .maybeSingle();

    if (configError) {
      console.error("[webhook-proxy] Error fetching config:", configError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch webhook config" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!configData) {
      console.log("[webhook-proxy] No webhook config found");
      return new Response(
        JSON.stringify({ message: "No webhook configured" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const config = configData.value as unknown as WebhookConfig;

    // Check if webhook is enabled
    if (!config.enabled || !config.url) {
      console.log("[webhook-proxy] Webhook is disabled or URL not set");
      return new Response(
        JSON.stringify({ message: "Webhook is disabled" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if this event type should trigger the webhook (skip for test events)
    if (event !== "test") {
      if (event === "lead_created" && !config.send_on_create) {
        return new Response(
          JSON.stringify({ message: "Event type disabled" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (event === "lead_updated" && !config.send_on_update) {
        return new Response(
          JSON.stringify({ message: "Event type disabled" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (event === "status_changed" && !config.send_on_status_change) {
        return new Response(
          JSON.stringify({ message: "Event type disabled" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Build the payload
    const payload: Record<string, unknown> = {
      event,
      timestamp: new Date().toISOString(),
      source: "blackboy_films",
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        phone_e164: data.phone_e164,
        niche: data.niche,
        city: data.city,
        message: data.message,
        status: data.status,
        notes: data.notes,
        source_page: data.source_page,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
        utm_content: data.utm_content,
        utm_term: data.utm_term,
        consent: data.consent,
        created_at: data.created_at,
      },
    };

    if (event === "status_changed" && previous_status) {
      payload.previous_status = previous_status;
    }

    console.log(`[webhook-proxy] Sending to: ${config.url}`);

    // Build headers for the outgoing request
    const outgoingHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add secret header if configured
    if (config.secret) {
      outgoingHeaders["x-webhook-secret"] = config.secret;
    }

    // Send the webhook request (server-to-server)
    const webhookResponse = await fetch(config.url, {
      method: "POST",
      headers: outgoingHeaders,
      body: JSON.stringify(payload),
    });

    const responseText = await webhookResponse.text();

    console.log(
      `[webhook-proxy] Webhook response status: ${webhookResponse.status}`
    );

    return new Response(
      JSON.stringify({
        success: webhookResponse.ok,
        status: webhookResponse.status,
        message: webhookResponse.ok
          ? "Webhook sent successfully"
          : "Webhook request failed",
        response: responseText.substring(0, 500), // Limit response size
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[webhook-proxy] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
