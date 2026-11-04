import {
  parentBillingCacheKey,
  resolveParentBillingCacheScope,
} from '@/lib/parent/parent-billing-cache-key';
import {
  getActivePreviewSession,
  setActivePreviewSession,
} from '@/lib/platform-admin/preview-session-store';

describe('parentBillingCacheKey', () => {
  afterEach(() => {
    setActivePreviewSession(null);
  });

  it('includes family and guardian scope when preview session is active', () => {
    setActivePreviewSession({
      portal: 'parent',
      organizationId: 'org-1',
      slug: 'rooted-meadows',
      subjectLabel: 'Andrew Sparhawk',
      familyId: 'family-1',
      guardianId: 'guardian-1',
    });

    expect(resolveParentBillingCacheScope()).toEqual({
      familyId: 'family-1',
      guardianId: 'guardian-1',
    });
    expect(
      parentBillingCacheKey('org-1', 'rooted-meadows', resolveParentBillingCacheScope()),
    ).toBe('org-1:rooted-meadows:family-1:guardian-1');
    expect(getActivePreviewSession()?.guardianId).toBe('guardian-1');
  });

  it('falls back to org and slug for live parent sessions', () => {
    setActivePreviewSession(null);
    expect(parentBillingCacheKey('org-1', 'rooted-meadows')).toBe('org-1:rooted-meadows');
    expect(getActivePreviewSession()).toBeNull();
  });
});
