import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = path.join(__dirname, "../..");

function readRoute(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("mobile bearer auth route wiring", () => {
  it("parent classroom signup detail route uses createClientFromRequest for all handlers", () => {
    const source = readRoute(
      "app/api/parent-portal/classroom-signups/[signupId]/route.ts",
    );

    // The wrapper resolves the bearer-aware client (see with-parent-portal-route.test.ts).
    assert.equal(
      (source.match(/withParentPortalRoute/g) ?? []).length >= 3,
      true,
      "GET, POST, and DELETE should each use withParentPortalRoute",
    );
    assert.doesNotMatch(source, /createClient\(cookieStore\)/);
    assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
  });

  it("school admin support-requests route uses bearer-aware auth", () => {
    const source = readRoute("app/api/school-admin/support-requests/route.ts");

    assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
    assert.match(
      source,
      /requireSchoolAdminUser\(supabase, organizationId, request\)/,
    );
    assert.doesNotMatch(source, /createClient\(cookieStore\)/);
  });

  it("parent portal support-requests route uses bearer-aware auth", () => {
    const source = readRoute("app/api/parent-portal/support-requests/route.ts");

    assert.match(source, /withParentPortalRoute/);
    assert.doesNotMatch(source, /createClient\(cookieStore\)/);
    assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
  });

  it("teacher portal support-requests route uses bearer-aware auth", () => {
    const source = readRoute("app/api/teacher-portal/support-requests/route.ts");

    assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
    assert.match(source, /userHasTeacherPortalAccess\(/);
    assert.doesNotMatch(source, /createClient\(cookieStore\)/);
  });

  it("enrollment checklist item route uses createClientFromRequest", () => {
    const source = readRoute("app/api/admissions/enrollment-checklist-items/[id]/route.ts");

    assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
    assert.doesNotMatch(source, /createClient\(cookieStore\)/);
  });

  it("enrollment checklist checkout route uses createClientFromRequest", () => {
    const source = readRoute(
      "app/api/admissions/enrollment-checklist-items/[id]/checkout/route.ts",
    );

    assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
    assert.doesNotMatch(source, /createClient\(cookieStore\)/);
  });

  const activityNotificationRoutes = [
    "app/api/school-admin/activity-notifications/route.ts",
    "app/api/school-admin/activity-notifications/unread-count/route.ts",
    "app/api/school-admin/activity-notifications/mark-read/route.ts",
  ];

  for (const routePath of activityNotificationRoutes) {
    it(`${routePath} uses createClientFromRequest`, () => {
      const source = readRoute(routePath);

      assert.match(
        source,
        /import \{ createClientFromRequest \} from "@\/lib\/supabase\/request-client"/,
      );
      assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
      assert.match(
        source,
        /requireSchoolAdminUser\(supabase, organizationId, request\)/,
      );
      assert.doesNotMatch(source, /createClient\(cookieStore\)/);
      assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
    });
  }

  const teacherActivityNotificationRoutes = [
    "app/api/teacher-portal/activity-notifications/route.ts",
    "app/api/teacher-portal/activity-notifications/unread-count/route.ts",
    "app/api/teacher-portal/activity-notifications/mark-read/route.ts",
  ];

  for (const routePath of teacherActivityNotificationRoutes) {
    it(`${routePath} uses createClientFromRequest`, () => {
      const source = readRoute(routePath);

      assert.match(
        source,
        /import \{ createClientFromRequest \} from "@\/lib\/supabase\/request-client"/,
      );
      assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
      assert.doesNotMatch(source, /createClient\(cookieStore\)/);
      assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
    });
  }

  const attendanceRoutes = [
    "app/api/teacher-portal/attendance/route.ts",
    "app/api/teacher-portal/attendance/records/route.ts",
    "app/api/teacher-portal/attendance/history/route.ts",
    "app/api/teacher-portal/attendance/pickup-contacts/route.ts",
    "app/api/school-admin/attendance/route.ts",
    "app/api/school-admin/attendance/records/route.ts",
    "app/api/school-admin/attendance/history/route.ts",
    "app/api/school-admin/attendance/pickup-contacts/route.ts",
  ];

  for (const routePath of attendanceRoutes) {
    it(`${routePath} uses createClientFromRequest`, () => {
      const source = readRoute(routePath);

      assert.match(
        source,
        /import \{ createClientFromRequest \} from "@\/lib\/supabase\/request-client"/,
      );
      assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
      assert.doesNotMatch(source, /createClient\(cookieStore\)/);
      assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
    });
  }

  const staffHoursRoutes = ["app/api/school-admin/staff-hours/route.ts"];

  for (const routePath of staffHoursRoutes) {
    it(`${routePath} uses createClientFromRequest`, () => {
      const source = readRoute(routePath);

      assert.match(
        source,
        /import \{ createClientFromRequest \} from "@\/lib\/supabase\/request-client"/,
      );
      assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
    });
  }

  const myHoursRoutes = [
    "app/api/teacher-portal/my-hours/route.ts",
    "app/api/teacher-portal/my-hours/clock-in/route.ts",
    "app/api/teacher-portal/my-hours/clock-out/route.ts",
  ];

  for (const routePath of myHoursRoutes) {
    it(`${routePath} uses createClientFromRequest`, () => {
      const source = readRoute(routePath);

      assert.match(
        source,
        /import \{ createClientFromRequest \} from "@\/lib\/supabase\/request-client"/,
      );
      assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
      assert.doesNotMatch(source, /createClient\(cookieStore\)/);
      assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
    });
  }

  it("application form save activity route uses createClientFromRequest", () => {
    const source = readRoute(
      "app/api/school-admin/application-forms/record-save-activity/route.ts",
    );

    assert.match(
      source,
      /import \{ createClientFromRequest \} from "@\/lib\/supabase\/request-client"/,
    );
    assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
    assert.match(
      source,
      /requireSchoolAdminUser\(supabase, organizationId, request\)/,
    );
    assert.doesNotMatch(source, /createClient\(cookieStore\)/);
    assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
  });

  const fridayBranchRoutes = [
    "app/api/school-admin/friday-branch/schedule/route.ts",
    "app/api/school-admin/friday-branch/enrollment-counts/route.ts",
    "app/api/school-admin/friday-branch/recent-activity/route.ts",
    "app/api/school-admin/friday-branch/classes/[classId]/route.ts",
    "app/api/school-admin/friday-branch/classes/[classId]/roster-email-preview/route.ts",
    "app/api/school-admin/friday-branch/classes/[classId]/send-roster/route.ts",
  ];

  for (const routePath of fridayBranchRoutes) {
    it(`${routePath} uses createClientFromRequest`, () => {
      const source = readRoute(routePath);

      assert.match(
        source,
        /import \{ createClientFromRequest \} from "@\/lib\/supabase\/request-client"/,
      );
      assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
      assert.match(
        source,
        /requireSchoolAdminUser\(supabase, organizationId, request\)/,
      );
      assert.doesNotMatch(source, /createClient\(cookieStore\)/);
      assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
    });
  }

  const platformAdminOrganizationRoutes = [
    "app/api/admin/organizations/[id]/memberships/route.ts",
    "app/api/admin/organizations/[id]/parent-login-status/route.ts",
    "app/api/admin/organizations/[id]/staff-login-status/route.ts",
  ];

  for (const routePath of platformAdminOrganizationRoutes) {
    it(`${routePath} uses createClientFromRequest`, () => {
      const source = readRoute(routePath);

      assert.match(
        source,
        /import \{ createClientFromRequest \} from "@\/lib\/supabase\/request-client"/,
      );
      assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
      assert.match(source, /requirePlatformAdminUser\(supabase, request\)/);
      assert.doesNotMatch(source, /createClient\(cookieStore\)/);
      assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
    });
  }

  const mobileAccountRoutes = [
    "app/api/mobile/activity-events/route.ts",
    "app/api/mobile/operational-errors/route.ts",
    "app/api/account/expo-push/register/route.ts",
  ];

  for (const routePath of mobileAccountRoutes) {
    it(`${routePath} uses getUserFromRequest for bearer auth`, () => {
      const source = readRoute(routePath);

      assert.match(source, /createClientFromRequest/);
      assert.match(source, /getUserFromRequest\(supabase, request\)/);
      assert.doesNotMatch(source, /await supabase\.auth\.getUser\(\)/);
    });
  }

  const parentTuitionRoutes = [
    "app/api/tuition/autopay/route.ts",
    "app/api/tuition/charges/[id]/checkout/route.ts",
    "app/api/tuition/charges/combined-checkout/route.ts",
    "app/api/tuition/payment-method/setup/route.ts",
    "app/api/tuition/enrollments/[enrollmentId]/payment-plan/route.ts",
    "app/api/admissions/enrollment-checklist-items/[id]/route.ts",
    "app/api/admissions/enrollment-checklist-items/[id]/checkout/route.ts",
    "app/api/admissions/enrollment-checklists/[id]/route.ts",
    "app/api/admissions/checkout-sessions/[sessionId]/confirm/route.ts",
    "app/api/stripe/connect/status/route.ts",
  ];

  for (const routePath of parentTuitionRoutes) {
    it(`${routePath} passes request into requireAuthenticatedUser`, () => {
      const source = readRoute(routePath);

      assert.match(source, /createClientFromRequest/);
      assert.match(source, /requireAuthenticatedUser\(supabase, request\)/);
      assert.doesNotMatch(source, /await supabase\.auth\.getUser\(\)/);
    });
  }

  it("portal-options route uses createClientFromRequest", () => {
    const source = readRoute("app/api/portal-options/route.ts");

    assert.match(source, /createClientFromRequest/);
    assert.match(source, /getUserFromRequest/);
    assert.match(source, /signedInErrorForRequest/);
    assert.match(source, /from "@\/lib\/supabase\/request-client"/);
    assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
    assert.doesNotMatch(source, /createClient\(cookieStore\)/);
    assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
  });

  const bearerMigratedPortalRoutes = [
    "app/api/school-admin/operational-errors/route.ts",
    "app/api/teacher-portal/operational-errors/route.ts",
    "app/api/teacher-portal/profile-photo/route.ts",
    "app/api/school-admin/profile-photo/route.ts",
    "app/api/school-admin/photo-media-consents/route.ts",
    "app/api/parent-portal/students/[studentId]/health/route.ts",
    "app/api/parent-portal/photo-media-consents/route.ts",
    "app/api/parent-portal/students/[studentId]/photo-media-consent/route.ts",
    "app/api/teacher-portal/forms-documents/route.ts",
    "app/api/parent-portal/committees/[committeeId]/mark-read/route.ts",
    "app/api/teacher-portal/committees/[committeeId]/mark-read/route.ts",
  ];

  it("withParentPortalRoute builds its client and user from the request (bearer-aware)", () => {
    const source = readRoute("lib/parent-portal/with-parent-portal-route.ts");

    assert.match(source, /createClient: createClientFromRequest/);
    assert.match(source, /getUser: getUserFromRequest/);
    assert.match(source, /signedInErrorForRequest/);
    assert.doesNotMatch(source, /createClient\(cookieStore\)/);
    assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
  });

  for (const routePath of bearerMigratedPortalRoutes) {
    it(`${routePath} uses createClientFromRequest instead of cookie client`, () => {
      const source = readRoute(routePath);

      // Parent portal routes get the bearer-aware client from withParentPortalRoute.
      assert.match(source, /createClientFromRequest|withParentPortalRoute/);
      assert.doesNotMatch(source, /createClient\(cookieStore\)/);
      assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
    });
  }

  it("school admin admissions visit book route scopes application booking to organizationId", () => {
    const source = readRoute("app/api/school-admin/admissions/visits/book/route.ts");
    const bookCallIndex = source.indexOf("bookAdmissionsVisit(");
    const contextLoadIndex = source.indexOf("loadPostSubmitActionForApplication(");
    const orgGuardIndex = source.indexOf(
      "schedulingContext.organizationId !== organizationId",
    );

    assert.ok(contextLoadIndex >= 0, "expected loadPostSubmitActionForApplication");
    assert.ok(orgGuardIndex >= 0, "expected organizationId mismatch guard");
    assert.ok(
      contextLoadIndex < bookCallIndex && orgGuardIndex < bookCallIndex,
      "org boundary check should run before bookAdmissionsVisit",
    );
  });
});
