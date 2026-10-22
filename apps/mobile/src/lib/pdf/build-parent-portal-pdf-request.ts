import { getApiAuthHeaders } from '@/lib/auth/auth-session';
import { resolveParentPreviewPath } from '@/lib/platform-admin/mobile-preview-api';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

export function buildParentCoopCurriculumPdfApiPath(
  organizationId: string,
  programId: string,
  curriculumId: string,
): string {
  const query = new URLSearchParams({
    organizationId,
    programId,
    curriculumId,
  }).toString();
  return `/api/parent-portal/curriculum/pdf?${query}`;
}

/** Resolved path (preview or live) and full download URL for parent-portal PDF routes. */
export function resolveParentPortalPdfDownloadUrl(apiPath: string): {
  requestPath: string;
  downloadUrl: string;
} {
  const previewPath = resolveParentPreviewPath(apiPath);
  const requestPath = previewPath ?? apiPath;
  return {
    requestPath,
    downloadUrl: `${siteUrl}${requestPath}`,
  };
}

export async function getParentPortalPdfDownloadHeaders(
  apiPath: string,
): Promise<Record<string, string>> {
  const headers = await getApiAuthHeaders();
  const previewPath = resolveParentPreviewPath(apiPath);
  if (previewPath) {
    const { MOBILE_PREVIEW_HEADER } = await import('@/lib/platform-admin/preview-session-store');
    headers[MOBILE_PREVIEW_HEADER] = '1';
  }
  return headers;
}
