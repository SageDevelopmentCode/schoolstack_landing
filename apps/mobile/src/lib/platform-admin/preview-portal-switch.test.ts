import { fetchMobilePreviewApi } from '@/lib/platform-admin/mobile-preview-api';
import {
  accountPortalIdToPreviewPortal,
  fetchPreviewPortalOptions,
  resolvePreviewTargetForOption,
} from '@/lib/platform-admin/preview-portal-switch';
import type { PortalPreviewSession } from '@/lib/platform-admin/preview-session-types';

jest.mock('@/lib/platform-admin/mobile-preview-api', () => ({
  fetchMobilePreviewApi: jest.fn(),
}));

const session: PortalPreviewSession = {
  portal: 'school_admin',
  organizationId: 'org-123',
  slug: 'rooted-meadows',
  subjectLabel: 'admin@rootedmeadowswaldorf.org',
  membershipId: 'mem-456',
};

describe('fetchPreviewPortalOptions', () => {
  beforeEach(() => {
    jest.mocked(fetchMobilePreviewApi).mockReset();
  });

  it('requests portal-options with preview identity params and filters applications', async () => {
    jest.mocked(fetchMobilePreviewApi).mockResolvedValue({
      options: [
        { id: 'admin', label: 'School admin', href: '/school/x/admin' },
        { id: 'family_apply', label: 'My applications', href: '/school/x/apply' },
        { id: 'family_parent', label: 'Parent portal', href: '/school/x/parent' },
      ],
      targets: {
        admin: {
          portal: 'school_admin',
          membershipId: 'mem-456',
          subjectLabel: 'admin@rootedmeadowswaldorf.org',
        },
        family_parent: {
          portal: 'parent',
          familyId: 'family-1',
          subjectLabel: 'admin@rootedmeadowswaldorf.org',
        },
      },
    });

    const payload = await fetchPreviewPortalOptions(session);

    expect(fetchMobilePreviewApi).toHaveBeenCalledWith(
      '/api/admin/mobile-preview/school-admin/portal-options?organizationId=org-123&slug=rooted-meadows&membershipId=mem-456',
    );
    expect(payload.options.map((o) => o.id)).toEqual(['admin', 'family_parent']);
    expect(payload.targets.admin?.membershipId).toBe('mem-456');
  });
});

describe('resolvePreviewTargetForOption', () => {
  it('returns mapped target when present', () => {
    const target = {
      portal: 'teacher' as const,
      staffMemberId: 'staff-1',
      subjectLabel: 'teacher@school.test',
    };
    expect(
      resolvePreviewTargetForOption('teacher', { teacher: target }),
    ).toEqual(target);
    expect(resolvePreviewTargetForOption('admin', { teacher: target })).toBeNull();
  });
});

describe('accountPortalIdToPreviewPortal', () => {
  it('maps mobile account ids to preview portal types', () => {
    expect(accountPortalIdToPreviewPortal('admin')).toBe('school_admin');
    expect(accountPortalIdToPreviewPortal('teacher')).toBe('teacher');
    expect(accountPortalIdToPreviewPortal('family_parent')).toBe('parent');
    expect(accountPortalIdToPreviewPortal('family_apply')).toBeNull();
  });
});
