export type CookieConsentLevel = "essential" | "all";

export type CookieConsent = {
  level: CookieConsentLevel;
  updatedAt: string;
};

const STORAGE_KEY = "mudkitchen-cookie-consent";

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.level !== "essential" && parsed.level !== "all") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function setCookieConsent(level: CookieConsentLevel): CookieConsent {
  const consent: CookieConsent = {
    level,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new CustomEvent("mudkitchen-cookie-consent-change", { detail: consent }));
  }

  return consent;
}

export function hasCookieConsent(): boolean {
  return getCookieConsent() !== null;
}

export function allowsAnalyticsCookies(): boolean {
  return getCookieConsent()?.level === "all";
}

const MARKETING_ROUTE_PREFIXES = [
  "/",
  "/customers",
  "/get-started",
  "/privacy",
  "/terms",
  "/demo-school",
  "/login",
];

export function isMarketingRoute(pathname: string): boolean {
  if (pathname.startsWith("/school/") || pathname.startsWith("/admin/")) {
    return false;
  }

  if (pathname === "/") return true;

  return MARKETING_ROUTE_PREFIXES.some(
    (prefix) => prefix !== "/" && (pathname === prefix || pathname.startsWith(`${prefix}/`)),
  );
}
