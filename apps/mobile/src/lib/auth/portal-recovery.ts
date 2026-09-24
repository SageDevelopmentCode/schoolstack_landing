import type { PortalType } from '@/lib/auth/resolve-portal';

export type PortalRecoveryDecision =
  | { action: 'wait' }
  | { action: 'restore' }
  | { action: 'login' }
  | { action: 'recovery_route' }
  | { action: 'navigate'; route: string };

type PortalRecoveryInput = {
  isLoading: boolean;
  restoringPortal: boolean;
  user: { id: string } | null;
  portalType: PortalType | null;
  selectedSchool: { slug: string } | null;
  restoreAttempted: boolean;
};

function portalTypeRequiresSchool(portalType: PortalType): boolean {
  return portalType === 'parent' || portalType === 'teacher' || portalType === 'school_admin';
}

export function resolvePortalRecovery(input: PortalRecoveryInput): PortalRecoveryDecision {
  if (input.isLoading || input.restoringPortal) {
    return { action: 'wait' };
  }

  if (!input.user) {
    return { action: 'recovery_route' };
  }

  if (!input.portalType) {
    if (input.restoreAttempted) {
      return { action: 'login' };
    }
    return { action: 'restore' };
  }

  if (portalTypeRequiresSchool(input.portalType) && !input.selectedSchool) {
    return { action: 'login' };
  }

  if (input.portalType === 'platform_admin') {
    return { action: 'navigate', route: '/platform-admin/organizations' };
  }

  if (input.portalType === 'school_admin' && input.selectedSchool) {
    return { action: 'navigate', route: `/school-admin/${input.selectedSchool.slug}/dashboard` };
  }

  if (input.portalType === 'parent_apply') {
    return { action: 'navigate', route: '/parent-apply-gate' };
  }

  if (input.portalType === 'parent' && input.selectedSchool) {
    return { action: 'navigate', route: `/parent/${input.selectedSchool.slug}/home` };
  }

  if (input.portalType === 'teacher' && input.selectedSchool) {
    return { action: 'navigate', route: `/teacher/${input.selectedSchool.slug}/home` };
  }

  return { action: 'login' };
}

export function shouldShowPortalLoadingSpinner(decision: PortalRecoveryDecision): boolean {
  return (
    decision.action === 'wait' ||
    decision.action === 'restore' ||
    decision.action === 'recovery_route' ||
    decision.action === 'login' ||
    decision.action === 'navigate'
  );
}
