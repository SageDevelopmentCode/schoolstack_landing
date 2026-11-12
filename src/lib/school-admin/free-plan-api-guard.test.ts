import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { classifySchoolAdminApiPath } from "./free-plan-api-guard";

function walk(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...walk(full));
    } else if (entry === "route.ts") {
      found.push(full);
    }
  }
  return found;
}

function routeUrl(file: string): string {
  const rel = path.relative(
    path.join(process.cwd(), "src/app"),
    file,
  );
  return `/${rel.replace(/\/route\.ts$/, "").split(path.sep).join("/")}`;
}

describe("school admin API plan gates", () => {
  it("classifies every school-admin route as open or a feature", () => {
    const root = path.join(process.cwd(), "src/app/api/school-admin");
    const urls = walk(root).map(routeUrl);
    assert.ok(urls.length > 0);

    for (const url of urls) {
      const gate = classifySchoolAdminApiPath(url);
      assert.notEqual(gate, null, `${url} is not classified`);
    }
  });

  it("classifies every slug-scoped school admin route as open or a feature", () => {
    const root = path.join(process.cwd(), "src/app/api/school");
    const urls = walk(root).map(routeUrl);
    assert.ok(urls.length > 0);

    for (const url of urls) {
      const gate = classifySchoolAdminApiPath(url);
      assert.notEqual(gate, null, `${url} is not classified`);
    }
  });

  it("keeps dashboard chrome open and gates paid prefixes", () => {
    assert.equal(
      classifySchoolAdminApiPath("/api/school-admin/dashboard-summary"),
      "open",
    );
    assert.equal(
      classifySchoolAdminApiPath("/api/school-admin/support-requests"),
      "open",
    );
    assert.deepEqual(
      classifySchoolAdminApiPath(
        "/api/school-admin/friday-branch/classes/[classId]/send-roster",
      ),
      { feature: "my_school" },
    );
    assert.deepEqual(
      classifySchoolAdminApiPath("/api/school-admin/messages/broadcast"),
      { feature: "messages" },
    );
    assert.equal(classifySchoolAdminApiPath("/api/admissions/applications"), null);
  });

  it("maps slug-scoped my_school, photos, bulletin, and open newsletters paths", () => {
    assert.deepEqual(
      classifySchoolAdminApiPath("/api/school/demo/staff"),
      { feature: "my_school" },
    );
    assert.deepEqual(
      classifySchoolAdminApiPath("/api/school/demo/staff/[staffMemberId]"),
      { feature: "my_school" },
    );
    assert.deepEqual(
      classifySchoolAdminApiPath("/api/school/demo/classrooms"),
      { feature: "my_school" },
    );
    assert.deepEqual(
      classifySchoolAdminApiPath("/api/school/demo/students/[studentId]/health"),
      { feature: "my_school" },
    );
    assert.deepEqual(
      classifySchoolAdminApiPath("/api/school/demo/gallery"),
      { feature: "photos" },
    );
    assert.deepEqual(
      classifySchoolAdminApiPath("/api/school/demo/gallery/[photoId]"),
      { feature: "photos" },
    );
    assert.deepEqual(
      classifySchoolAdminApiPath("/api/school/demo/bulletin"),
      { feature: "bulletin" },
    );
    assert.equal(
      classifySchoolAdminApiPath("/api/school/demo/newsletters/template"),
      "open",
    );
    assert.equal(
      classifySchoolAdminApiPath("/api/school/demo/newsletters/editions/[editionId]/publish"),
      "open",
    );
  });
});
