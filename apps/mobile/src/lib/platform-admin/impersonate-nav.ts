import type { AdminOrganization } from '@/lib/organizations';
import type { PortalPreviewPortal } from '@/lib/platform-admin/preview-session-types';
import { platformAdminTabRoute } from '@/lib/platform-admin/platform-admin-nav';

export type ImpersonatePortalTab = PortalPreviewPortal;

export function impersonateSchoolListRoute(): string {
  return `${platformAdminTabRoute('impersonate')}` as string;
}

export function impersonateSubjectRoute(organizationId: string): string {
  return `${impersonateSchoolListRoute()}/${organizationId}` as string;
}

export function impersonatePreviewHomeRoute(
  portal: ImpersonatePortalTab,
  slug: string,
): string {
  switch (portal) {
    case 'school_admin':
      return `/school-admin/${slug}/dashboard`;
    case 'teacher':
      return `/teacher/${slug}/home`;
    case 'parent':
      return `/parent/${slug}/home`;
  }
}

export function impersonateBackRoute(): string {
  return impersonateSchoolListRoute();
}

export function organizationDisplayLabel(organization: AdminOrganization): string {
  return organization.name;
}
