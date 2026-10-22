import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatPortalSignInDiscordRoleLabel } from "./discord";

describe("formatPortalSignInDiscordRoleLabel", () => {
  it("maps parent portal sign-ins", () => {
    assert.equal(
      formatPortalSignInDiscordRoleLabel("parent_portal", "parent"),
      "Parent",
    );
  });

  it("maps public apply sign-ins as parent", () => {
    assert.equal(
      formatPortalSignInDiscordRoleLabel("public_apply", "parent"),
      "Parent",
    );
  });

  it("maps teacher portal sign-ins", () => {
    assert.equal(
      formatPortalSignInDiscordRoleLabel("teacher_portal", "teacher"),
      "Teacher",
    );
  });

  it("maps school admin sign-ins", () => {
    assert.equal(
      formatPortalSignInDiscordRoleLabel("school_admin", "school_admin"),
      "School admin",
    );
  });

  it("maps platform admin surface and actor", () => {
    assert.equal(
      formatPortalSignInDiscordRoleLabel("platform_admin", "platform_admin"),
      "Platform admin",
    );
  });

  it("labels platform admins on school admin surface", () => {
    assert.equal(
      formatPortalSignInDiscordRoleLabel("school_admin", "platform_admin"),
      "Platform admin",
    );
  });
});
