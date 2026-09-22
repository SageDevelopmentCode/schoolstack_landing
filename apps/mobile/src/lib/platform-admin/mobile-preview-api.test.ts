import {
  mapParentPortalPathToPreview,
  mapTeacherPortalPathToPreview,
  resolveParentPreviewPath,
  resolveTeacherPreviewPath,
} from '@/lib/platform-admin/mobile-preview-api';
import {
  setActivePreviewSession,
} from '@/lib/platform-admin/preview-session-store';
import type { PortalPreviewSession } from '@/lib/platform-admin/preview-session-types';

const parentSession: PortalPreviewSession = {
  portal: 'parent',
  organizationId: 'org-123',
  slug: 'rooted-meadows',
  subjectLabel: 'Smith Family',
  familyId: 'family-456',
};

const teacherSession: PortalPreviewSession = {
  portal: 'teacher',
  organizationId: 'org-123',
  slug: 'rooted-meadows',
  subjectLabel: 'Jane Teacher',
  staffMemberId: 'staff-789',
};

describe('resolveParentPreviewPath', () => {
  afterEach(() => {
    setActivePreviewSession(null);
  });

  it('maps parent home to mobile preview route with familyId', () => {
    setActivePreviewSession(parentSession);

    const path = resolveParentPreviewPath(
      '/api/parent-portal/home?organizationId=org-123&slug=rooted-meadows',
    );

    expect(path).toBe(
      '/api/admin/mobile-preview/parent/home?organizationId=org-123&slug=rooted-meadows&familyId=family-456',
    );
  });

  it('returns null when preview session is inactive', () => {
    expect(
      resolveParentPreviewPath('/api/parent-portal/home?organizationId=org-123&slug=rooted-meadows'),
    ).toBeNull();
  });

  it('returns null when session is teacher portal', () => {
    setActivePreviewSession(teacherSession);

    expect(
      resolveParentPreviewPath('/api/parent-portal/home?organizationId=org-123&slug=rooted-meadows'),
    ).toBeNull();
  });
});

describe('resolveTeacherPreviewPath', () => {
  afterEach(() => {
    setActivePreviewSession(null);
  });

  it('maps teacher home to mobile preview route with staffMemberId', () => {
    setActivePreviewSession(teacherSession);

    const path = resolveTeacherPreviewPath(
      '/api/teacher-portal/home?organizationId=org-123&slug=rooted-meadows',
    );

    expect(path).toBe(
      '/api/admin/mobile-preview/teacher/home?organizationId=org-123&slug=rooted-meadows&staffMemberId=staff-789',
    );
  });

  it('returns null when preview session is inactive', () => {
    expect(
      resolveTeacherPreviewPath('/api/teacher-portal/home?organizationId=org-123&slug=rooted-meadows'),
    ).toBeNull();
  });

  it('returns null when session is parent portal', () => {
    setActivePreviewSession(parentSession);

    expect(
      resolveTeacherPreviewPath('/api/teacher-portal/home?organizationId=org-123&slug=rooted-meadows'),
    ).toBeNull();
  });
});

describe('mapParentPortalPathToPreview', () => {
  it('preserves nested path segments and query params from the live route', () => {
    const mapped = mapParentPortalPathToPreview(
      '/api/parent-portal/calendar?organizationId=org-123&slug=rooted-meadows&month=2026-09',
      parentSession,
    );

    expect(mapped).toBe(
      '/api/admin/mobile-preview/parent/calendar?organizationId=org-123&slug=rooted-meadows&month=2026-09&familyId=family-456',
    );
  });
});

describe('mapTeacherPortalPathToPreview', () => {
  it('preserves nested path segments and query params from the live route', () => {
    const mapped = mapTeacherPortalPathToPreview(
      '/api/teacher-portal/calendar?organizationId=org-123&slug=rooted-meadows&month=2026-09',
      teacherSession,
    );

    expect(mapped).toBe(
      '/api/admin/mobile-preview/teacher/calendar?organizationId=org-123&slug=rooted-meadows&month=2026-09&staffMemberId=staff-789',
    );
  });
});
