import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTrackingConfig } from "@/hooks/useTrackingConfig";

export function TrackingScripts() {
  const { data: config, isLoading } = useTrackingConfig();
  const location = useLocation();

  // Inject GA4 script
  useEffect(() => {
    if (isLoading || !config?.ga4.enabled || !config.ga4.measurement_id) return;

    const measurementId = config.ga4.measurement_id;

    // Check if script already exists
    if (document.querySelector(`script[src*="gtag/js?id=${measurementId}"]`)) return;

    // Add gtag script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    const initScript = document.createElement("script");
    initScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      
      ${config.lgpd.consent_mode ? `
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'analytics_storage': 'granted',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
      ` : ''}
      
      gtag('config', '${measurementId}', {
        send_page_view: false,
        ${config.lgpd.anonymize_ip ? "anonymize_ip: true," : ""}
        ${config.ga4.debug_mode ? "debug_mode: true," : ""}
      });
    `;
    document.head.appendChild(initScript);

    return () => {
      script.remove();
      initScript.remove();
    };
  }, [config, isLoading]);

  // Inject Meta Pixel script
  useEffect(() => {
    if (isLoading || !config?.meta.enabled || !config.meta.pixel_id) return;

    const pixelId = config.meta.pixel_id;

    // Check if script already exists
    if (document.querySelector('script[src*="connect.facebook.net"]')) return;

    const script = document.createElement("script");
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      
      ${config.lgpd.consent_mode ? "fbq('consent', 'revoke');" : ""}
      fbq('init', '${pixelId}');
    `;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [config, isLoading]);

  // Inject TikTok Pixel script
  useEffect(() => {
    if (isLoading || !config?.tiktok.enabled || !config.tiktok.pixel_id) return;

    const pixelId = config.tiktok.pixel_id;

    // Check if script already exists
    if (document.querySelector('script[src*="analytics.tiktok.com"]')) return;

    const script = document.createElement("script");
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${pixelId}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [config, isLoading]);

  // Track page views on route change
  useEffect(() => {
    if (isLoading || !config) return;

    // GA4 page view
    if (config.ga4.enabled && config.ga4.measurement_id && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: location.pathname,
        page_title: document.title,
        send_to: config.ga4.measurement_id,
      });
    }

    // Meta page view
    if (config.meta.enabled && config.meta.pixel_id && window.fbq) {
      window.fbq("track", "PageView");
    }

    // TikTok page view
    if (config.tiktok.enabled && config.tiktok.pixel_id && window.ttq) {
      window.ttq.page();
    }
  }, [location.pathname, config, isLoading]);

  return null;
}
