import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  freePlanLockedUpgradeLabel,
  freePlanUpgradePath,
} from "./free-plan-upgrade";

describe("free plan upgrade redirects", () => {
  it("sends a locked default feature back to the dashboard popup", () => {
    assert.equal(
      freePlanLockedUpgradeLabel("free", "admissions"),
      "Admissions",
    );
    assert.equal(
      freePlanUpgradePath("oak", "free", "admissions"),
      "/school/oak/admin/dashboard?upgrade=Admissions",
    );
  });

  it("names a locked child tab", () => {
    assert.equal(
      freePlanLockedUpgradeLabel("free", "my_school", "students"),
      "My Students",
    );
  });

  it("leaves the dashboard, paid schools, and features that default off alone", () => {
    assert.equal(freePlanLockedUpgradeLabel("free", "dashboard"), null);
    assert.equal(freePlanLockedUpgradeLabel("custom", "admissions"), null);
    assert.equal(freePlanLockedUpgradeLabel("free", "bulletin"), null);
    assert.equal(freePlanLockedUpgradeLabel("free", "not-a-feature"), null);
    assert.equal(freePlanUpgradePath("oak", "custom", "messages"), null);
  });
});
