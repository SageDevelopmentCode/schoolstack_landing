import {
  mapParentPortalPathToPreview,
  mapSchoolAdminPathToPreview,
  mapTeacherPortalPathToPreview,
  resolveParentPreviewPath,
  resolveSchoolAdminPreviewPath,
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

const schoolAdminSession: PortalPreviewSession = {
  portal: 'school_admin',
  organizationId: 'org-123',
  slug: 'rooted-meadows',
  subjectLabel: 'admin@rootedmeadowswaldorf.org',
  membershipId: 'mem-456',
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

  it('maps parent portal-contexts to mobile preview route with familyId', () => {
    setActivePreviewSession(parentSession);

    const path = resolveParentPreviewPath(
      '/api/parent-portal/portal-contexts?organizationId=org-123&slug=rooted-meadows',
    );

    expect(path).toBe(
      '/api/admin/mobile-preview/parent/portal-contexts?organizationId=org-123&slug=rooted-meadows&familyId=family-456',
    );
  });

  it('preserves programSlug on parent home preview mapping', () => {
    setActivePreviewSession(parentSession);

    const path = resolveParentPreviewPath(
      '/api/parent-portal/home?organizationId=org-123&slug=rooted-meadows&programSlug=kindergarten-coop',
    );

    expect(path).toBe(
      '/api/admin/mobile-preview/parent/home?organizationId=org-123&slug=rooted-meadows&programSlug=kindergarten-coop&familyId=family-456',
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

  it('preserves programId on calendar preview mapping', () => {
    const mapped = mapParentPortalPathToPreview(
      '/api/parent-portal/calendar?organizationId=org-123&slug=rooted-meadows&programId=prog-coop',
      parentSession,
    );

    expect(mapped).toContain('programId=prog-coop');
    expect(mapped).toContain('familyId=family-456');
  });
});

describe('resolveSchoolAdminPreviewPath', () => {
  afterEach(() => {
    setActivePreviewSession(null);
  });

  it('maps school-admin dashboard-summary to mobile preview route with membershipId', () => {
    setActivePreviewSession(schoolAdminSession);

    const path = resolveSchoolAdminPreviewPath(
      '/api/school-admin/dashboard-summary?organizationId=org-123&slug=rooted-meadows',
    );

    expect(path).toBe(
      '/api/admin/mobile-preview/school-admin/dashboard-summary?organizationId=org-123&slug=rooted-meadows&membershipId=mem-456',
    );
  });

  it('returns null for non school-admin paths', () => {
    setActivePreviewSession(schoolAdminSession);

    expect(
      resolveSchoolAdminPreviewPath('/api/school/rooted-meadows/students/stu-1'),
    ).toBeNull();
  });

  it('returns null when session is teacher portal', () => {
    setActivePreviewSession(teacherSession);

    expect(
      resolveSchoolAdminPreviewPath('/api/school-admin/dashboard-summary?organizationId=org-123'),
    ).toBeNull();
  });
});

describe('mapSchoolAdminPathToPreview', () => {
  it('preserves nested path segments and query params', () => {
    const mapped = mapSchoolAdminPathToPreview(
      '/api/school-admin/messages/threads?organizationId=org-123&schoolName=Rooted',
      schoolAdminSession,
    );

    expect(mapped).toBe(
      '/api/admin/mobile-preview/school-admin/messages/threads?organizationId=org-123&schoolName=Rooted&slug=rooted-meadows&membershipId=mem-456',
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

  it('maps teacher attendance roster to mobile preview route with staffMemberId', () => {
    const mapped = mapTeacherPortalPathToPreview(
      '/api/teacher-portal/attendance?organizationId=org-123&date=2026-10-09',
      teacherSession,
    );

    expect(mapped).toBe(
      '/api/admin/mobile-preview/teacher/attendance?organizationId=org-123&date=2026-10-09&slug=rooted-meadows&staffMemberId=staff-789',
    );
  });
});
