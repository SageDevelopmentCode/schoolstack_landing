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
});
