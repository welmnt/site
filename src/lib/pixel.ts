/**
 * Meta pixel — Welmnt (4355673077912294).
 *
 * ⚠️ COMPLIANCE, and it is about the DATA, not the copy.
 * Meta's Business Tools Terms (2025-11-03) bar sending data "based on, directly or
 * otherwise" on health information — and that reaches EVENT NAMES and URL PATHS, not
 * just what a human typed. Since 2026-01-06 audiences flagged as health-derived
 * hard-fail on update. Welmnt sells children's mental-health education, so:
 *
 *   ✅ content_category: "programme", content_name: "Ages 10–13"
 *   ❌ anything naming a condition, symptom, or a child's state
 *
 * Keep it describing a PRODUCT, never a person. The same rule governs the copy:
 * name the service, never address the reader's condition.
 *
 * Every event carries an eventID so a Conversions API send can deduplicate against
 * it rather than double-count.
 */

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };
declare global {
  interface Window { fbq?: Fbq; _fbq?: Fbq }
}

let started = false;

/**
 * Loads the pixel. Called from main.tsx before React renders — a pixel that
 * initialises late is one of the highest-ROI leaks there is: the ad gets the click,
 * the landing view never lands, and it reads as a creative problem for weeks.
 */
export function initPixel(): void {
  if (started || !PIXEL_ID || typeof window === "undefined") return;
  started = true;

  /* eslint-disable */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true; t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  window.fbq?.("init", PIXEL_ID);
}

export const newEventId = () =>
  (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

function track(event: string, params?: Record<string, unknown>, eventId?: string) {
  if (!PIXEL_ID) return;
  window.fbq?.("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
}

/** Fire on every route change — an SPA gets one real page load, not one per view. */
export const trackPageView = () => track("PageView");

/** A parent looking at a specific programme. Product language only. */
export const trackViewContent = (programmeTitle: string, ageBand: string) =>
  track("ViewContent", {
    content_type: "product",
    content_category: "programme",
    content_name: programmeTitle,
    content_ids: [ageBand],
  });

/** Someone started the booking form. */
export const trackInitiateCheckout = () =>
  track("InitiateCheckout", { content_category: "programme" });

/**
 * The terminal event — a parent asked for a place. This is what the campaign
 * optimises toward, so nothing else may be named Lead.
 */
export function trackLead(valueEgp: number, eventId: string) {
  track("Lead", { content_category: "programme", value: valueEgp, currency: "EGP" }, eventId);
}
