import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  badgesToRolePillars,
  formatPortalAccessSummary,
  formatPortalPillarSummary,
  guardianContactEmailsForDisplay,
  listCrossRoleSingleLoginIdentities,
  mergeSchoolPortalOptionsById,
  unionPortalBadges,
  unionRolePillars,
} from "@/lib/auth/organization-portal-account-links";
import type { SchoolPortalOption } from "@/lib/auth/portal-switcher-types";

describe("mergeSchoolPortalOptionsById", () => {
  it("dedupes portal options by id and preserves canonical order", () => {
    const adminOption: SchoolPortalOption = {
      id: "admin",
      label: "School admin",
      href: "/school/demo/admin",
    };
    const teacherOption: SchoolPortalOption = {
      id: "teacher",
      label: "Staff portal",
      href: "/school/demo/teacher",
    };
    const applyOption: SchoolPortalOption = {
      id: "family_apply",
      label: "My applications",
      href: "/school/demo/apply",
    };

    const merged = mergeSchoolPortalOptionsById([
      [adminOption, applyOption],
      [teacherOption, applyOption],
    ]);

    assert.deepEqual(merged, [adminOption, teacherOption, applyOption]);
  });
});

describe("unionPortalBadges", () => {
  it("unions portal flags across badge sets", () => {
    const merged = unionPortalBadges([
      { schoolAdmin: true, teacherPortal: false, familyApply: true, parentPortal: false },
      { schoolAdmin: false, teacherPortal: true, familyApply: false, parentPortal: true },
    ]);

    assert.equal(merged.schoolAdmin, true);
    assert.equal(merged.teacherPortal, true);
    assert.equal(merged.familyApply, true);
    assert.equal(merged.parentPortal, true);
  });
});

describe("formatPortalAccessSummary", () => {
  it("lists active portal labels in product order", () => {
    const summary = formatPortalAccessSummary({
      schoolAdmin: true,
      teacherPortal: false,
      familyApply: true,
      parentPortal: true,
    });

    assert.equal(
      summary,
      "School admin, Applications, Parent portal",
    );
  });

  it("returns a fallback when no portals apply", () => {
    assert.equal(
      formatPortalAccessSummary({
        schoolAdmin: false,
        teacherPortal: false,
        familyApply: false,
        parentPortal: false,
      }),
      "No portal access",
    );
  });
});

describe("badgesToRolePillars", () => {
  it("collapses applications and parent portal into one family pillar", () => {
    const pillars = badgesToRolePillars({
      schoolAdmin: false,
      teacherPortal: false,
      familyApply: true,
      parentPortal: true,
    });

    assert.equal(pillars.familyPortal, true);
    assert.equal(pillars.schoolAdmin, false);
  });
});

describe("formatPortalPillarSummary", () => {
  it("lists role pillars in product order", () => {
    const summary = formatPortalPillarSummary({
      schoolAdmin: true,
      staffPortal: false,
      familyPortal: true,
    });

    assert.equal(summary, "School admin, Family portal");
  });
});

describe("listCrossRoleSingleLoginIdentities", () => {
  it("includes admin plus family on one login", () => {
    const result = listCrossRoleSingleLoginIdentities([
      {
        userId: "a",
        email: "admin@school.org",
        sources: ["membership", "guardian"],
        badges: {
          schoolAdmin: true,
          teacherPortal: false,
          familyApply: true,
          parentPortal: true,
        },
      },
      {
        userId: "b",
        email: "parent@school.org",
        sources: ["membership"],
        badges: {
          schoolAdmin: false,
          teacherPortal: false,
          familyApply: true,
          parentPortal: true,
        },
      },
    ]);

    assert.equal(result.length, 1);
    assert.equal(result[0]?.email, "admin@school.org");
  });
});

describe("unionRolePillars", () => {
  it("unions pillars across accounts for link preview", () => {
    const merged = unionRolePillars([
      { schoolAdmin: true, staffPortal: false, familyPortal: true },
      { schoolAdmin: false, staffPortal: true, familyPortal: false },
    ]);

    assert.equal(merged.schoolAdmin, true);
    assert.equal(merged.staffPortal, true);
    assert.equal(merged.familyPortal, true);
  });
});

describe("guardianContactEmailsForDisplay", () => {
  it("omits contacts that match the login email", () => {
    const contacts = guardianContactEmailsForDisplay(
      "admin@school.org",
      ["rakel@example.com", "admin@school.org"],
    );

    assert.deepEqual(contacts, ["rakel@example.com"]);
  });
});
