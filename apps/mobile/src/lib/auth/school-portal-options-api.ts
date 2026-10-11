import { assertApiAuthenticated, getApiAuthHeaders } from '@/lib/auth/auth-session';
import type { SchoolPortalOption } from '@/lib/auth/school-portal-options-types';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

export async function fetchSchoolPortalOptions(
  organizationId: string,
  slug: string,
): Promise<SchoolPortalOption[]> {
  const params = new URLSearchParams({
    organizationId,
    slug,
  });

  const response = await fetch(`${siteUrl}/api/portal-options?${params.toString()}`, {
    method: 'GET',
    headers: await getApiAuthHeaders(false),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    options?: SchoolPortalOption[];
    error?: string;
    message?: string;
  };

  await assertApiAuthenticated(response);

  if (!response.ok) {
    throw new Error(
      typeof payload.message === 'string'
        ? payload.message
        : typeof payload.error === 'string'
          ? payload.error
          : 'Failed to load portal options.',
    );
  }

  return payload.options ?? [];
}
