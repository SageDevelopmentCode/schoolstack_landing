import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  freePlanLockedUpgradeLabel,
  freePlanUpgradePath,
  isFreePlanAdminPathOpen,
} from "./free-plan-upgrade";

describe("free plan upgrade redirects", () => {
  it("sends a locked default feature back to the home popup", () => {
    assert.equal(freePlanLockedUpgradeLabel("free", "messages"), "Messages");
    assert.equal(
      freePlanUpgradePath("oak", "free", "messages"),
      "/school/oak/admin/home?upgrade=Messages",
    );
  });

  it("locks the dashboard and opens its upgrade popup on home", () => {
    assert.equal(freePlanLockedUpgradeLabel("free", "dashboard"), "Dashboard");
    assert.equal(
      freePlanUpgradePath("oak", "free", "dashboard"),
      "/school/oak/admin/home?upgrade=Dashboard",
    );
  });

  it("names a locked child tab", () => {
    assert.equal(
      freePlanLockedUpgradeLabel("free", "my_school", "students"),
      "My Students",
    );
  });

  it("opens schedule, three admissions tabs, and newsletters", () => {
    assert.equal(isFreePlanAdminPathOpen("schedule"), true);
    assert.equal(freePlanLockedUpgradeLabel("free", "schedule"), null);
    assert.equal(freePlanLockedUpgradeLabel("free", "admissions"), null);
    assert.equal(
      freePlanLockedUpgradeLabel("free", "admissions", "programs"),
      null,
    );
    assert.equal(
      freePlanLockedUpgradeLabel("free", "admissions", "flows"),
      null,
    );
    assert.equal(
      freePlanLockedUpgradeLabel("free", "admissions", "submissions"),
      null,
    );
    assert.equal(
      freePlanLockedUpgradeLabel("free", "my_school", "newsletters"),
      null,
    );
    assert.equal(
      freePlanLockedUpgradeLabel("free", "admissions", "payments"),
      "Payments",
    );
    assert.equal(freePlanUpgradePath("oak", "free", "my_school"), "/school/oak/admin/home?upgrade=My+School");
  });

  it("leaves paid schools and features that default off alone", () => {
    assert.equal(freePlanLockedUpgradeLabel("custom", "dashboard"), null);
    assert.equal(freePlanLockedUpgradeLabel("custom", "admissions"), null);
    assert.equal(freePlanLockedUpgradeLabel("free", "bulletin"), null);
    assert.equal(freePlanLockedUpgradeLabel("free", "not-a-feature"), null);
    assert.equal(freePlanUpgradePath("oak", "custom", "messages"), null);
  });
});
