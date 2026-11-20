import { allowsAnalyticsCookies } from "@/lib/cookie-consent";

/**
 * First-touch attribution for marketing lead forms: the UTMs, ad click ids, referrer and
 * landing page from the visitor's first page view. It is only sent when the visitor submits
 * a form.
 *
 * Storage follows the cookie banner. The data always lives in sessionStorage, which lasts for
 * this visit only. It is also kept in localStorage, so it survives later visits, only once
 * the visitor has accepted all cookies.
 */
export type LeadAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  firstLandingPath?: string;
};

const STORAGE_KEY = "mk-first-touch";

const PARAM_KEYS: Array<[keyof LeadAttribution, string]> = [
  ["utmSource", "utm_source"],
  ["utmMedium", "utm_medium"],
  ["utmCampaign", "utm_campaign"],
  ["utmContent", "utm_content"],
  ["utmTerm", "utm_term"],
  ["gclid", "gclid"],
  ["fbclid", "fbclid"],
];

const FIELD_MAX: Record<keyof LeadAttribution, number> = {
  utmSource: 200,
  utmMedium: 200,
  utmCampaign: 200,
  utmContent: 200,
  utmTerm: 200,
  referrer: 500,
  gclid: 300,
  fbclid: 300,
  firstLandingPath: 500,
};

function safeGet(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: () => Storage, key: string, value: string) {
  try {
    storage().setItem(key, value);
  } catch {
    // Private mode or blocked storage: attribution is best-effort.
  }
}

/** Build attribution from the current URL and referrer (client only). */
export function attributionFromLocation(loc: Location, referrer: string): LeadAttribution {
  const params = new URLSearchParams(loc.search);
  const result: LeadAttribution = {};
  for (const [field, param] of PARAM_KEYS) {
    const value = params.get(param)?.trim();
    if (value) result[field] = value;
  }
  if (referrer) {
    try {
      const ref = new URL(referrer);
      // Same-site navigation is not a referrer worth keeping.
      if (ref.host !== loc.host) result.referrer = `${ref.origin}${ref.pathname}`;
    } catch {
      // Ignore malformed referrers.
    }
  }
  result.firstLandingPath = loc.pathname;
  return sanitizeAttribution(result);
}

/** Store the first touch once per visit (and per browser once all cookies are accepted). */
export function captureFirstTouch(): void {
  if (typeof window === "undefined") return;
  const persisted = safeGet(() => window.localStorage, STORAGE_KEY);
  const session = safeGet(() => window.sessionStorage, STORAGE_KEY);
  const persistAllowed = allowsAnalyticsCookies();
  const current = attributionFromLocation(window.location, document.referrer);

  // A campaign or ad click outranks an earlier direct visit with nothing to attribute.
  const stored = persisted ?? session;
  if (stored && hasAttribution(current) && !hasAttribution(parseStored(stored))) {
    const value = JSON.stringify(current);
    safeSet(() => window.sessionStorage, STORAGE_KEY, value);
    if (persistAllowed || persisted) safeSet(() => window.localStorage, STORAGE_KEY, value);
    return;
  }

  if (persisted) return;
  if (session) {
    // Visitor accepted cookies after landing: promote this visit's first touch.
    if (persistAllowed) safeSet(() => window.localStorage, STORAGE_KEY, session);
    return;
  }

  const value = JSON.stringify(current);
  safeSet(() => window.sessionStorage, STORAGE_KEY, value);
  if (persistAllowed) safeSet(() => window.localStorage, STORAGE_KEY, value);
}

function parseStored(raw: string): LeadAttribution {
  try {
    return sanitizeAttribution(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function readFirstTouch(): LeadAttribution {
  if (typeof window === "undefined") return {};
  const raw =
    safeGet(() => window.localStorage, STORAGE_KEY) ??
    safeGet(() => window.sessionStorage, STORAGE_KEY);
  return raw ? parseStored(raw) : {};
}

/** Trim, cap and drop unknown keys. Safe to run on untrusted request bodies. */
export function sanitizeAttribution(raw: unknown): LeadAttribution {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, unknown>;
  const result: LeadAttribution = {};
  for (const key of Object.keys(FIELD_MAX) as Array<keyof LeadAttribution>) {
    const value = source[key];
    if (typeof value !== "string") continue;
    const trimmed = value.trim().slice(0, FIELD_MAX[key]);
    if (trimmed) result[key] = trimmed;
  }
  return result;
}

export function hasAttribution(a: LeadAttribution): boolean {
  return Object.keys(a).some((k) => k !== "firstLandingPath");
}
