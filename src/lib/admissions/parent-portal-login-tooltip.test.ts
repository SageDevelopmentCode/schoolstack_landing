import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getParentPortalLoginTooltip } from "@/components/admissions/ParentPortalLoginBadge";

describe("getParentPortalLoginTooltip", () => {
  it("returns null when status is missing", () => {
    assert.equal(getParentPortalLoginTooltip(null), null);
  });

  it("describes missing parent account", () => {
    const tooltip = getParentPortalLoginTooltip({
      accountLinked: false,
      hasEverSignedIn: false,
      lastSignInAt: null,
    });
    assert.equal(tooltip?.title, "No parent account");
  });

  it("describes linked account that never signed in", () => {
    const tooltip = getParentPortalLoginTooltip({
      accountLinked: true,
      hasEverSignedIn: false,
      lastSignInAt: null,
    });
    assert.equal(tooltip?.title, "Account linked");
    assert.match(tooltip?.body ?? "", /haven't signed in/i);
  });

  it("describes signed-in contact with last sign-in time", () => {
    const tooltip = getParentPortalLoginTooltip({
      accountLinked: true,
      hasEverSignedIn: true,
      lastSignInAt: "2026-08-21T14:30:00.000Z",
    });
    assert.equal(tooltip?.title, "Signed in");
    assert.match(tooltip?.body ?? "", /Last signed in/i);
  });
});
