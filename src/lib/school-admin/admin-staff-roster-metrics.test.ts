import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deriveStaffRosterMetrics,
  filterStaffByRosterFilter,
  firstStaffNeedingReview,
  matchesStaffSearch,
  staffProfileNeedsReview,
} from "./admin-staff-roster-metrics";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";

function member(
  overrides: Partial<StaffMemberRecord> = {},
): StaffMemberRecord {
  return {
    id: "staff-1",
    organizationId: "org-1",
    userId: "user-1",
    firstName: "Jordin",
    lastName: "Ross",
    email: "jordin@example.com",
    roleTitle: "Main Lesson Teacher",
    employmentStatus: "active",
    portalRole: "teacher",
    membershipStatus: "active",
    isLinked: true,
    hasEverSignedIn: true,
    lastSignInAt: "2026-08-30T12:00:00.000Z",
    assignedStudentCount: 3,
    profilePhotoUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("admin-staff-roster-metrics", () => {
  it("derives staff roster metrics", () => {
    const metrics = deriveStaffRosterMetrics([
      member(),
      member({
        id: "staff-2",
        firstName: "Jazmin",
        email: "",
        roleTitle: "",
        hasEverSignedIn: false,
        assignedStudentCount: 0,
      }),
    ]);

    assert.equal(metrics.totalCount, 2);
    assert.equal(metrics.activeCount, 2);
    assert.equal(metrics.portalSignedInCount, 1);
    assert.equal(metrics.withLearnersCount, 1);
    assert.equal(metrics.needsReviewCount, 1);
    assert.equal(metrics.teacherCount, 2);
    assert.equal(metrics.portalActiveCount, 1);
  });

  it("filters teachers, portal active, and review rows", () => {
    const rows = [
      member(),
      member({
        id: "staff-2",
        portalRole: "staff",
        hasEverSignedIn: false,
        email: "",
        roleTitle: "",
      }),
    ];

    assert.equal(filterStaffByRosterFilter(rows, "teachers").length, 1);
    assert.equal(filterStaffByRosterFilter(rows, "portal_active").length, 1);
    assert.equal(filterStaffByRosterFilter(rows, "review").length, 1);
  });

  it("matches search by name and role", () => {
    assert.equal(matchesStaffSearch(member(), "main lesson"), true);
    assert.equal(matchesStaffSearch(member(), "missing"), false);
  });

  it("detects profile review needs", () => {
    assert.equal(staffProfileNeedsReview(member()), false);
    assert.equal(
      staffProfileNeedsReview(member({ roleTitle: "" })),
      true,
    );
  });

  it("finds first staff needing review", () => {
    const rows = [
      member(),
      member({ id: "staff-2", roleTitle: "" }),
    ];
    assert.equal(firstStaffNeedingReview(rows)?.id, "staff-2");
  });
});
