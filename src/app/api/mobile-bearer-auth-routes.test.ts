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

    assert.match(source, /import \{ createClientFromRequest \} from "@\/lib\/supabase\/request-client"/);
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
});
