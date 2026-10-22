import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inferPortalSignInDiscordFromLoginHref } from "./portal-sign-in-discord";

describe("inferPortalSignInDiscordFromLoginHref", () => {
  const slug = "rooted-meadows";

  it("maps school admin home", () => {
    assert.deepEqual(
      inferPortalSignInDiscordFromLoginHref(`/school/${slug}/admin`, slug),
      { surface: "school_admin", actorType: "school_admin" },
    );
  });

  it("maps nested school admin paths", () => {
    assert.deepEqual(
      inferPortalSignInDiscordFromLoginHref(
        `/school/${slug}/admin/admissions`,
        slug,
      ),
      { surface: "school_admin", actorType: "school_admin" },
    );
  });

  it("maps teacher portal paths", () => {
    assert.deepEqual(
      inferPortalSignInDiscordFromLoginHref(`/school/${slug}/teacher`, slug),
      { surface: "teacher_portal", actorType: "teacher" },
    );
  });

  it("maps parent apply and portal paths", () => {
    assert.deepEqual(
      inferPortalSignInDiscordFromLoginHref(`/school/${slug}/apply`, slug),
      { surface: "parent_portal", actorType: "parent" },
    );
    assert.deepEqual(
      inferPortalSignInDiscordFromLoginHref(`/school/${slug}/parent`, slug),
      { surface: "parent_portal", actorType: "parent" },
    );
  });
});
