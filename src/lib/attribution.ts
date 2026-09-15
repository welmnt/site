/**
 * Capture ad attribution at first touch and hold it until the form is submitted.
 *
 * Catalyst learned this the hard way: `leads.fbc`/`fbp` were null before 2026-08-01
 * and only became stable mid-August, which left months of spend unattributable.
 * Capture on landing, not on submit — by the time the parent fills the form the
 * query string is usually long gone.
 *
 * `fbp` is a first-party cookie Meta's pixel sets on ANY visitor. It never proves
 * Facebook origin. Only `fbc` (from the `fbclid` parameter) does.
 */
const KEY = "welmnt.attribution.v1";

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbc: string | null;
  fbp: string | null;
  landing_path: string | null;
  captured_at: string;
}

const readCookie = (name: string): string | null => {
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
};

export function captureAttribution(): void {
  try {
    if (localStorage.getItem(KEY)) return; // first touch wins
    const p = new URLSearchParams(window.location.search);
    const fbclid = p.get("fbclid");
    const data: Attribution = {
      utm_source: p.get("utm_source"),
      utm_medium: p.get("utm_medium"),
      utm_campaign: p.get("utm_campaign"),
      utm_content: p.get("utm_content"),
      utm_term: p.get("utm_term"),
      fbc: fbclid ? `fb.1.${Date.now()}.${fbclid}` : readCookie("_fbc"),
      fbp: readCookie("_fbp"),
      landing_path: window.location.pathname,
      captured_at: new Date().toISOString(),
    };
    const anySignal = Object.entries(data).some(
      ([k, v]) => v && !["landing_path", "captured_at"].includes(k)
    );
    if (anySignal) localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* private mode, blocked storage — attribution is nice to have, never a blocker */
  }
}

export function getAttribution(): Partial<Attribution> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
