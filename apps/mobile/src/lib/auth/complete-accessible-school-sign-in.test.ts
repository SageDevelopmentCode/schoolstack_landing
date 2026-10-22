import type { SupabaseClient } from '@supabase/supabase-js';

import { completeAccessibleSchoolSignIn, shouldSignOutAfterAccessibleSchoolResult } from '@/lib/auth/complete-accessible-school-sign-in';

const USER_ID = 'teacher-user-id';
const ORG_ID = 'org-demo';

jest.mock('@/lib/auth/list-accessible-organizations', () => ({
  listAccessibleLiveOrganizations: jest.fn(),
}));

jest.mock('@/lib/auth/resolve-portal', () => {
  const actual = jest.requireActual('@/lib/auth/resolve-portal');
  return {
    ...actual,
    resolvePlatformAdmin: jest.fn(),
    resolvePortalForSchool: jest.fn(),
  };
});

import { listAccessibleLiveOrganizations } from '@/lib/auth/list-accessible-organizations';
import { PortalAccessError, resolvePlatformAdmin, resolvePortalForSchool } from '@/lib/auth/resolve-portal';

const mockListAccessibleLiveOrganizations =
  listAccessibleLiveOrganizations as jest.MockedFunction<
    typeof listAccessibleLiveOrganizations
  >;
const mockResolvePlatformAdmin = resolvePlatformAdmin as jest.MockedFunction<
  typeof resolvePlatformAdmin
>;
const mockResolvePortalForSchool = resolvePortalForSchool as jest.MockedFunction<
  typeof resolvePortalForSchool
>;

const demoOrg = {
  id: ORG_ID,
  slug: 'rooted-meadows-demo',
  name: 'Demo',
  branding: {
    colors: {
      primary: '#000',
      secondary: '#000',
      accent: '#000',
      background: '#fff',
      text: '#000',
    },
    logoSrc: '',
    logoAlt: '',
  },
};

describe('completeAccessibleSchoolSignIn', () => {
  const supabase = {} as SupabaseClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResolvePlatformAdmin.mockRejectedValue(
      new PortalAccessError('You do not have platform admin access.'),
    );
  });

  it('returns completed with platform_admin when the user is a platform admin', async () => {
    const secondOrg = { ...demoOrg, id: 'org-2', slug: 'school-b', name: 'School B' };
    mockResolvePlatformAdmin.mockResolvedValue({
      portalType: 'platform_admin',
      school: null,
    });
    mockListAccessibleLiveOrganizations.mockResolvedValue([demoOrg, secondOrg]);

    const result = await completeAccessibleSchoolSignIn(supabase, USER_ID);

    expect(result).toEqual({
      kind: 'completed',
      portal: { portalType: 'platform_admin', school: null },
    });
    expect(mockListAccessibleLiveOrganizations).not.toHaveBeenCalled();
  });

  it('returns no_access when the user has no schools', async () => {
    mockListAccessibleLiveOrganizations.mockResolvedValue([]);

    const result = await completeAccessibleSchoolSignIn(supabase, USER_ID);

    expect(result).toEqual({ kind: 'no_access' });
    expect(mockResolvePortalForSchool).not.toHaveBeenCalled();
  });

  it('returns completed with teacher portal for a single school', async () => {
    mockListAccessibleLiveOrganizations.mockResolvedValue([demoOrg]);
    mockResolvePortalForSchool.mockResolvedValue({
      portalType: 'teacher',
      school: demoOrg,
    });

    const result = await completeAccessibleSchoolSignIn(supabase, USER_ID);

    expect(result.kind).toBe('completed');
    if (result.kind === 'completed') {
      expect(result.portal.portalType).toBe('teacher');
    }
    expect(mockResolvePortalForSchool).toHaveBeenCalledWith(supabase, USER_ID, demoOrg);
  });

  it('returns needs_school_picker when the user has multiple schools', async () => {
    const secondOrg = { ...demoOrg, id: 'org-2', slug: 'school-b', name: 'School B' };
    mockListAccessibleLiveOrganizations.mockResolvedValue([demoOrg, secondOrg]);

    const result = await completeAccessibleSchoolSignIn(supabase, USER_ID);

    expect(result).toEqual({
      kind: 'needs_school_picker',
      slugs: ['rooted-meadows-demo', 'school-b'],
      organizations: [demoOrg, secondOrg],
    });
  });
});

describe('shouldSignOutAfterAccessibleSchoolResult', () => {
  it('signs out only when the account has no schools', () => {
    expect(shouldSignOutAfterAccessibleSchoolResult('no_access')).toBe(true);
    expect(shouldSignOutAfterAccessibleSchoolResult('error')).toBe(false);
    expect(shouldSignOutAfterAccessibleSchoolResult('completed')).toBe(false);
    expect(shouldSignOutAfterAccessibleSchoolResult('needs_school_picker')).toBe(false);
  });
});
