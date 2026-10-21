import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatMobileSignInDiscordRoleLabel } from "./discord";

describe("formatMobileSignInDiscordRoleLabel", () => {
  it("maps parent portal sign-ins", () => {
    assert.equal(
      formatMobileSignInDiscordRoleLabel("parent_portal", "parent"),
      "Parent",
    );
  });

  it("maps teacher portal sign-ins", () => {
    assert.equal(
      formatMobileSignInDiscordRoleLabel("teacher_portal", "teacher"),
      "Teacher",
    );
  });

  it("maps school admin sign-ins", () => {
    assert.equal(
      formatMobileSignInDiscordRoleLabel("school_admin", "school_admin"),
      "School admin",
    );
  });

  it("maps platform admin surface and actor", () => {
    assert.equal(
      formatMobileSignInDiscordRoleLabel("platform_admin", "platform_admin"),
      "Platform admin",
    );
  });

  it("labels platform admins on school admin surface", () => {
    assert.equal(
      formatMobileSignInDiscordRoleLabel("school_admin", "platform_admin"),
      "Platform admin",
    );
  });
});
