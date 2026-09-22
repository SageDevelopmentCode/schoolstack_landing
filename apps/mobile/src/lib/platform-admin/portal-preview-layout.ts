import type { PortalPreviewSession } from '@/lib/platform-admin/preview-session-types';
import type { PortalType } from '@/lib/auth/resolve-portal';

export function isPortalPreviewAllowed(
  previewSession: PortalPreviewSession | null,
  portal: PortalPreviewSession['portal'],
  slug: string | undefined,
): boolean {
  return Boolean(
    previewSession &&
      previewSession.portal === portal &&
      slug &&
      previewSession.slug === slug,
  );
}

export function isPortalSessionAllowed(
  portalType: PortalType | null,
  selectedSchoolSlug: string | undefined,
  expectedPortal: PortalType,
  slug: string | undefined,
  previewSession: PortalPreviewSession | null,
): boolean {
  if (isPortalPreviewAllowed(previewSession, expectedPortal as PortalPreviewSession['portal'], slug)) {
    return true;
  }
  return portalType === expectedPortal && selectedSchoolSlug === slug;
}
