import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ParentPortalAccess } from "./parent-portal-access-rpc";
import { parentPortalHomeAccessFromSnapshot } from "./resolve-parent-portal-home-access";

function snapshot(overrides: Partial<ParentPortalAccess> = {}): ParentPortalAccess {
  return {
    link: { groupId: null, primaryUserId: "u1", memberUserIds: ["u1"], isPrimaryLogin: true },
    guardianIds: ["g1"],
    familyIds: ["fam-first", "fam-second"],
    studentIds: ["s1", "s2"],
    enrolledPrograms: [],
    hasEnrolledAccess: true,
    ...overrides,
  };
}

describe("parentPortalHomeAccessFromSnapshot", () => {
  it("uses the first family from the RPC as the home family", () => {
    const access = parentPortalHomeAccessFromSnapshot(snapshot());
    assert.equal(access.familyId, "fam-first");
    assert.deepEqual(access.familyIds, ["fam-first", "fam-second"]);
    assert.deepEqual(access.studentIds, ["s1", "s2"]);
    assert.equal(access.hasEnrolledAccess, true);
  });

  it("has no family and no access for a user with no guardian rows", () => {
    const access = parentPortalHomeAccessFromSnapshot(
      snapshot({ familyIds: [], studentIds: [], hasEnrolledAccess: false }),
    );
    assert.equal(access.familyId, undefined);
    assert.equal(access.hasEnrolledAccess, false);
    assert.equal(access.hasMainPortalEnrollment, false);
  });

  it("only counts non-isolated programs as main portal enrollment", () => {
    const isolatedOnly = parentPortalHomeAccessFromSnapshot(
      snapshot({
        enrolledPrograms: [
          {
            id: "p1",
            name: "Co-op",
            portal_slug: "coop",
            parent_portal_settings: { mode: "isolated" } as never,
          },
        ],
      }),
    );
    const withMain = parentPortalHomeAccessFromSnapshot(
      snapshot({
        enrolledPrograms: [
          {
            id: "p2",
            name: "Main",
            portal_slug: "main",
            parent_portal_settings: { mode: "main" } as never,
          },
        ],
      }),
    );
    assert.equal(withMain.hasMainPortalEnrollment, true);
    assert.equal(
      isolatedOnly.hasMainPortalEnrollment,
      false,
      "isolated program alone should not open the main portal",
    );
  });
});
