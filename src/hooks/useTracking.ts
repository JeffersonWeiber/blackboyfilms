import { useCallback } from "react";
import { useTrackingConfig } from "./useTrackingConfig";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (...args: unknown[]) => void;
      page: () => void;
    };
  }
}

type EventName =
  | "page_view"
  | "generate_lead"
  | "click_whatsapp_header"
  | "click_whatsapp_floating"
  | "view_portfolio_item"
  | "click_niche_card"
  | "cta_primary_click"
  | "form_start";

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

// Map internal events to platform-specific events
const eventMapping: Record<EventName, { ga4: string; meta: string; tiktok: string }> = {
  page_view: { ga4: "page_view", meta: "PageView", tiktok: "PageView" },
  generate_lead: { ga4: "generate_lead", meta: "Lead", tiktok: "SubmitForm" },
  click_whatsapp_header: { ga4: "click_whatsapp_header", meta: "Contact", tiktok: "ClickButton" },
  click_whatsapp_floating: { ga4: "click_whatsapp_floating", meta: "Contact", tiktok: "ClickButton" },
  view_portfolio_item: { ga4: "view_content", meta: "ViewContent", tiktok: "ViewContent" },
  click_niche_card: { ga4: "click_niche_card", meta: "ViewContent", tiktok: "ViewContent" },
  cta_primary_click: { ga4: "cta_click", meta: "Lead", tiktok: "ClickButton" },
  form_start: { ga4: "form_start", meta: "InitiateCheckout", tiktok: "AddToCart" },
};

export function useTracking() {
  const { data: config } = useTrackingConfig();

  const trackEvent = useCallback(
    (eventName: EventName, params?: EventParams) => {
      if (!config) return;

      const mapping = eventMapping[eventName];

      // GA4
      if (config.ga4.enabled && config.ga4.measurement_id && window.gtag) {
        window.gtag("event", mapping.ga4, {
          ...params,
          send_to: config.ga4.measurement_id,
        });
        if (config.ga4.debug_mode) {
          console.log(`[GA4] Event: ${mapping.ga4}`, params);
        }
      }

      // Meta Pixel
      if (config.meta.enabled && config.meta.pixel_id && window.fbq) {
        window.fbq("track", mapping.meta, params);
        console.log(`[Meta] Event: ${mapping.meta}`, params);
      }

      // TikTok Pixel
      if (config.tiktok.enabled && config.tiktok.pixel_id && window.ttq) {
        window.ttq.track(mapping.tiktok, params);
        console.log(`[TikTok] Event: ${mapping.tiktok}`, params);
      }
    },
    [config]
  );

  const trackPageView = useCallback(
    (pagePath?: string) => {
      trackEvent("page_view", { page_path: pagePath || window.location.pathname });
    },
    [trackEvent]
  );

  return { trackEvent, trackPageView, config };
}
