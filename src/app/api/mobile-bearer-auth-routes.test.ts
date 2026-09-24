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

    assert.match(
      source,
      /import \{ createClientFromRequest(?:, getUserFromRequest)? \} from "@\/lib\/supabase\/request-client"/,
    );
    assert.equal(
      (source.match(/await createClientFromRequest\(request\)/g) ?? []).length,
      3,
      "GET, POST, and DELETE should each call createClientFromRequest",
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

    assert.match(source, /const supabase = await createClientFromRequest\(request\)/);
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

  const bearerMigratedPortalRoutes = [
    "app/api/school-admin/operational-errors/route.ts",
    "app/api/teacher-portal/operational-errors/route.ts",
    "app/api/teacher-portal/profile-photo/route.ts",
    "app/api/parent-portal/students/[studentId]/health/route.ts",
    "app/api/teacher-portal/forms-documents/route.ts",
  ];

  for (const routePath of bearerMigratedPortalRoutes) {
    it(`${routePath} uses createClientFromRequest instead of cookie client`, () => {
      const source = readRoute(routePath);

      assert.match(source, /createClientFromRequest/);
      assert.doesNotMatch(source, /createClient\(cookieStore\)/);
      assert.doesNotMatch(source, /from "@\/utils\/supabase\/server"/);
    });
  }
});
