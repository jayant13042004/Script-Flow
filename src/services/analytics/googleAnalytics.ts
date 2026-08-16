/**
 * Google Analytics 4 (GA4) & Google Ads Integration Service
 * Compliant with Google Tag (gtag.js) specifications and GDPR best practices.
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || '';

/**
 * Initialize Google Tag (gtag.js) script into the document head
 */
export function initGoogleAnalytics() {
  const trackingId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;
  if (!trackingId || typeof window === 'undefined') return;

  // Prevent duplicate script injection
  if (document.getElementById('google-gtag-script')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());

  // Configure GA4 Measurement ID
  if (GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, // Handled dynamically on route change
      cookie_flags: 'SameSite=None;Secure',
    });
  }

  // Configure Google Ads ID
  if (GOOGLE_ADS_ID) {
    window.gtag('config', GOOGLE_ADS_ID);
  }

  // Inject script
  const script = document.createElement('script');
  script.id = 'google-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  document.head.appendChild(script);
}

/**
 * Track Page Views dynamically across SPA route changes
 */
export function trackPageView(pagePath: string, pageTitle: string) {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href,
  });
}

/**
 * Track custom conversion and engagement events (GA4 & Google Ads)
 */
export function trackEvent(
  eventName:
    | 'sign_up'
    | 'login'
    | 'script_created'
    | 'script_exported'
    | 'teleprompter_opened'
    | 'voice_dictation_used'
    | 'ai_generated'
    | 'share_link_created'
    | 'contact_form_submitted',
  eventParams?: Record<string, any>
) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, {
    ...eventParams,
    send_to: [GA_MEASUREMENT_ID, GOOGLE_ADS_ID].filter(Boolean),
  });
}

/**
 * Track Google Ads Conversion Event
 */
export function trackGoogleAdsConversion(conversionLabel: string, value: number = 1.0, currency: string = 'USD') {
  if (typeof window === 'undefined' || !window.gtag || !GOOGLE_ADS_ID) return;

  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
    value: value,
    currency: currency,
  });
}
