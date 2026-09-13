import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userCanManageOrganizationEvents } from "./schedule-settings";

const grantedStaffId = "34031c4e-5584-4c67-8208-4e91242255ec";

describe("userCanManageOrganizationEvents", () => {
  const permissions = {
    roles: { teacher: false, staff: false },
    staff_member_ids: [grantedStaffId],
  };

  it("allows an individually granted teacher", () => {
    assert.equal(
      userCanManageOrganizationEvents(permissions, {
        membershipRole: "teacher",
        staffMemberId: grantedStaffId,
        membershipStatus: "active",
      }),
      true,
    );
  });

  it("rejects a teacher who is not granted", () => {
    assert.equal(
      userCanManageOrganizationEvents(permissions, {
        membershipRole: "teacher",
        staffMemberId: "11111111-1111-4111-8111-111111111111",
        membershipStatus: "active",
      }),
      false,
    );
  });

  it("allows org admins", () => {
    assert.equal(
      userCanManageOrganizationEvents(permissions, {
        isOrgAdmin: true,
        membershipRole: "teacher",
        staffMemberId: null,
      }),
      true,
    );
  });

  it("allows all teachers when the role toggle is on", () => {
    assert.equal(
      userCanManageOrganizationEvents(
        {
          roles: { teacher: true, staff: false },
          staff_member_ids: [],
        },
        {
          membershipRole: "teacher",
          staffMemberId: "11111111-1111-4111-8111-111111111111",
          membershipStatus: "active",
        },
      ),
      true,
    );
  });
});
