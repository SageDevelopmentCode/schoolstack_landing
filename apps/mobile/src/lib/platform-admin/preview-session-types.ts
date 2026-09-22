import type { PortalType } from '@/lib/auth/resolve-portal';

export type PortalPreviewPortal = Extract<PortalType, 'school_admin' | 'teacher' | 'parent'>;

export type PortalPreviewSession = {
  portal: PortalPreviewPortal;
  organizationId: string;
  slug: string;
  subjectLabel: string;
  membershipId?: string;
  staffMemberId?: string;
  familyId?: string;
};

export type StartPortalPreviewInput = PortalPreviewSession & {
  school: import('@/lib/organizations').LiveOrganization;
};
