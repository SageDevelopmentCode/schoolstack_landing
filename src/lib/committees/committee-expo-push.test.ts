import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveCommitteeMemberPushPortal,
} from "./committee-expo-push";

describe("resolveCommitteeMemberPushPortal", () => {
  it("uses teacher portal when member has staff_member_id even with user_id", () => {
    const portal = resolveCommitteeMemberPushPortal({
      id: "m-1",
      staff_member_id: "staff-1",
      user_id: "user-1",
      guardian_id: null,
      email: null,
    });

    assert.equal(portal, "teacher");
  });

  it("uses parent portal when member has user_id only", () => {
    const portal = resolveCommitteeMemberPushPortal({
      id: "m-1",
      user_id: "user-1",
      guardian_id: null,
      staff_member_id: null,
      email: null,
    });

    assert.equal(portal, "parent");
  });

  it("uses parent portal when member has guardian_id only", () => {
    const portal = resolveCommitteeMemberPushPortal({
      id: "m-1",
      guardian_id: "guardian-1",
      user_id: null,
      staff_member_id: null,
      email: null,
    });

    assert.equal(portal, "parent");
  });

  it("uses admin portal for email-only committee contacts", () => {
    const portal = resolveCommitteeMemberPushPortal({
      id: "m-1",
      user_id: null,
      guardian_id: null,
      staff_member_id: null,
      email: "volunteer@example.com",
    });

    assert.equal(portal, "admin");
  });
});
