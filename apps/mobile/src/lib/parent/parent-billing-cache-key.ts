import { getActivePreviewSession } from '@/lib/platform-admin/preview-session-store';

export type ParentBillingCacheScope = {
  familyId?: string;
  guardianId?: string;
};

export function resolveParentBillingCacheScope(): ParentBillingCacheScope | undefined {
  const session = getActivePreviewSession();
  if (session?.portal !== 'parent' || !session.familyId) {
    return undefined;
  }

  return {
    familyId: session.familyId,
    ...(session.guardianId ? { guardianId: session.guardianId } : {}),
  };
}

export function parentBillingCacheKey(
  organizationId: string,
  slug: string,
  scope?: ParentBillingCacheScope,
): string {
  const parts = [organizationId, slug];
  if (scope?.familyId) {
    parts.push(scope.familyId);
  }
  if (scope?.guardianId) {
    parts.push(scope.guardianId);
  }
  return parts.join(':');
}
