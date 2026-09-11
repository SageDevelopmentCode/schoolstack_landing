import {
  resolveSchoolAdminNativeRoute,
  schoolAdminMessagesRoute,
  schoolAdminSubmissionsRoute,
} from '@/lib/school-admin/school-admin-nav';

const slug = 'rooted-meadows';

describe('resolveSchoolAdminNativeRoute', () => {
  it('maps submissions list', () => {
    expect(resolveSchoolAdminNativeRoute(slug, `/school/${slug}/admin/admissions/submissions`)).toBe(
      `/school-admin/${slug}/admissions/submissions`,
    );
  });

  it('maps submissions with applicationId query', () => {
    expect(
      resolveSchoolAdminNativeRoute(
        slug,
        `/school/${slug}/admin/admissions/submissions?applicationId=app-1`,
      ),
    ).toBe(`/school-admin/${slug}/admissions/submissions/app-1`);
  });

  it('maps submissions with application query', () => {
    expect(
      resolveSchoolAdminNativeRoute(
        slug,
        `/school/${slug}/admin/admissions/submissions?application=app-2`,
      ),
    ).toBe(`/school-admin/${slug}/admissions/submissions/app-2`);
  });

  it('maps messages and schedule', () => {
    expect(resolveSchoolAdminNativeRoute(slug, `/school/${slug}/admin/messages`)).toBe(
      schoolAdminMessagesRoute(slug),
    );
    expect(resolveSchoolAdminNativeRoute(slug, `/school/${slug}/admin/schedule`)).toBe(
      `/school-admin/${slug}/more/schedule`,
    );
  });

  it('maps students routes', () => {
    expect(resolveSchoolAdminNativeRoute(slug, `/school/${slug}/admin/students`)).toBe(
      `/school-admin/${slug}/students`,
    );
    expect(resolveSchoolAdminNativeRoute(slug, `/school/${slug}/admin/my_school/students`)).toBe(
      `/school-admin/${slug}/students`,
    );
    expect(resolveSchoolAdminNativeRoute(slug, `/school/${slug}/admin/students/stu-1`)).toBe(
      `/school-admin/${slug}/students/stu-1`,
    );
  });

  it('returns null for web-only destinations', () => {
    expect(resolveSchoolAdminNativeRoute(slug, `/school/${slug}/admin/admissions/programs`)).toBeNull();
    expect(resolveSchoolAdminNativeRoute(slug, `/school/${slug}/admin/admissions/payments`)).toBeNull();
    expect(resolveSchoolAdminNativeRoute(slug, `/school/${slug}/admin/tuition`)).toBeNull();
  });
});

describe('schoolAdminSubmissionsRoute', () => {
  it('builds the native submissions route', () => {
    expect(schoolAdminSubmissionsRoute(slug)).toBe(`/school-admin/${slug}/admissions/submissions`);
  });
});
