const SITE_URL =
  process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

export function schoolApplyPath(slug: string): string {
  return `/school/${slug}/apply`;
}

export function schoolApplyUrl(slug: string, siteUrl: string = SITE_URL): string {
  const base = siteUrl.replace(/\/$/, '');
  return `${base}${schoolApplyPath(slug)}`;
}

export function getSiteUrl(): string {
  return SITE_URL;
}

export function schoolApplicationPath(
  slug: string,
  applicationId: string,
  options?: { enrollment?: boolean },
): string {
  if (options?.enrollment) {
    return `/school/${slug}/apply/${applicationId}/enrollment`;
  }
  return `/school/${slug}/apply/${applicationId}`;
}

export function schoolApplicationUrl(
  slug: string,
  applicationId: string,
  options?: { enrollment?: boolean; siteUrl?: string },
): string {
  const base = (options?.siteUrl ?? SITE_URL).replace(/\/$/, '');
  return `${base}${schoolApplicationPath(slug, applicationId, options)}`;
}

export function resolveWebUrl(href: string, siteUrl: string = SITE_URL): string {
  const trimmed = href.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const base = siteUrl.replace(/\/$/, '');
  return `${base}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}
