import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { StaffMemberRecord } from "./staff-members";
import { summarizeStaffPortalLoginStatus } from "./staff-portal-login-status";

function staffMember(
  overrides: Partial<StaffMemberRecord> & Pick<StaffMemberRecord, "id">,
): StaffMemberRecord {
  return {
    organizationId: "org-1",
    userId: null,
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    roleTitle: "Teacher",
    employmentStatus: "active",
    portalRole: null,
    membershipStatus: null,
    isLinked: false,
    profilePhotoUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("summarizeStaffPortalLoginStatus", () => {
  it("counts portal staff by sign-in state and ignores non-portal members", () => {
    const members: StaffMemberRecord[] = [
      staffMember({
        id: "s-1",
        userId: "u-1",
        isLinked: true,
        portalRole: "teacher",
        membershipStatus: "active",
        hasEverSignedIn: true,
        lastSignInAt: "2026-07-22T12:00:00.000Z",
      }),
      staffMember({
        id: "s-2",
        userId: "u-2",
        isLinked: true,
        portalRole: "staff",
        membershipStatus: "active",
        hasEverSignedIn: false,
        lastSignInAt: null,
      }),
      staffMember({
        id: "s-3",
        userId: null,
        isLinked: false,
        portalRole: "teacher",
        membershipStatus: "active",
      }),
      staffMember({
        id: "s-4",
        portalRole: "teacher",
        membershipStatus: "invited",
        isLinked: true,
        hasEverSignedIn: true,
        lastSignInAt: "2026-07-22T12:00:00.000Z",
      }),
      staffMember({
        id: "s-5",
        employmentStatus: "inactive",
      }),
    ];

    assert.deepEqual(summarizeStaffPortalLoginStatus(members), {
      total: 5,
      withPortalAccess: 4,
      signedIn: 2,
      neverSignedIn: 1,
      noAccount: 1,
    });
  });
});
