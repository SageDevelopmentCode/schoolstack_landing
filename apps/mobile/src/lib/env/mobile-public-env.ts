/**
 * Helpers for EXPO_PUBLIC_* env used by the mobile app.
 * Copy production values from the web app `.env.local` when testing real accounts.
 */

const PRODUCTION_SITE_HOST = 'trymudkitchen.com';

export function getSupabaseUrlHost(): string | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function getSiteUrlHost(): string | null {
  const url = process.env.EXPO_PUBLIC_SITE_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function isLikelyLocalSupabaseHost(host: string | null): boolean {
  if (!host) return false;
  return (
    host === '127.0.0.1' ||
    host === '10.0.2.2' ||
    host === 'localhost' ||
    host.endsWith('.local')
  );
}

export function isLikelyProductionMobileBackend(): boolean {
  const siteHost = getSiteUrlHost();
  return siteHost === PRODUCTION_SITE_HOST || siteHost === `www.${PRODUCTION_SITE_HOST}`;
}

export function describeMobilePublicEnv(): {
  supabaseHost: string | null;
  siteHost: string | null;
  likelyLocalSupabase: boolean;
  likelyProductionSite: boolean;
} {
  const supabaseHost = getSupabaseUrlHost();
  return {
    supabaseHost,
    siteHost: getSiteUrlHost(),
    likelyLocalSupabase: isLikelyLocalSupabaseHost(supabaseHost),
    likelyProductionSite: isLikelyProductionMobileBackend(),
  };
}
