import { resolvePortalRecovery } from '@/lib/auth/portal-recovery';

const school = { slug: 'mud-school' };

describe('resolvePortalRecovery', () => {
  it('waits while auth or portal restore is loading', () => {
    expect(
      resolvePortalRecovery({
        isLoading: true,
        restoringPortal: false,
        user: null,
        portalType: null,
        selectedSchool: null,
        restoreAttempted: false,
      }),
    ).toEqual({ action: 'wait' });

    expect(
      resolvePortalRecovery({
        isLoading: false,
        restoringPortal: true,
        user: { id: 'user-1' },
        portalType: null,
        selectedSchool: null,
        restoreAttempted: true,
      }),
    ).toEqual({ action: 'wait' });
  });

  it('requests recovery route when signed out', () => {
    expect(
      resolvePortalRecovery({
        isLoading: false,
        restoringPortal: false,
        user: null,
        portalType: null,
        selectedSchool: null,
        restoreAttempted: false,
      }),
    ).toEqual({ action: 'recovery_route' });
  });

  it('restores portal metadata once when session exists without portal type', () => {
    expect(
      resolvePortalRecovery({
        isLoading: false,
        restoringPortal: false,
        user: { id: 'user-1' },
        portalType: null,
        selectedSchool: null,
        restoreAttempted: false,
      }),
    ).toEqual({ action: 'restore' });
  });

  it('sends orphaned sessions to login after restore attempt', () => {
    expect(
      resolvePortalRecovery({
        isLoading: false,
        restoringPortal: false,
        user: { id: 'user-1' },
        portalType: null,
        selectedSchool: null,
        restoreAttempted: true,
      }),
    ).toEqual({ action: 'login' });
  });

  it('sends incomplete school portals to login', () => {
    expect(
      resolvePortalRecovery({
        isLoading: false,
        restoringPortal: false,
        user: { id: 'user-1' },
        portalType: 'parent',
        selectedSchool: null,
        restoreAttempted: true,
      }),
    ).toEqual({ action: 'login' });
  });

  it('navigates parent portals with a selected school', () => {
    expect(
      resolvePortalRecovery({
        isLoading: false,
        restoringPortal: false,
        user: { id: 'user-1' },
        portalType: 'parent',
        selectedSchool: school,
        restoreAttempted: true,
      }),
    ).toEqual({ action: 'navigate', route: '/parent/mud-school/home' });
  });
});
