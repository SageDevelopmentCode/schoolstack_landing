import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  freePlanLockedUpgradeLabel,
  freePlanUpgradePath,
  isFreePlanAdminPathOpen,
  resolveFreePlanUpgradeTarget,
} from "./free-plan-upgrade";
import { buildAdminNavGroups } from "@/lib/organization-settings/admin-nav";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import {
  FREE_PLAN_FALLBACK_PITCH,
  FREE_PLAN_REPLACED_TOOLS,
  getFreePlanPitch,
  listFreePlanPitches,
} from "./free-plan-upgrade-pitches";

function words(text: string): number {
  return text.trim().split(/\s+/).length;
}

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

describe("free plan upgrade pitches", () => {
  const navGroups = buildAdminNavGroups(DEFAULT_FEATURES.admin);

  it("maps sidebar labels to pitch keys", () => {
    assert.equal(resolveFreePlanUpgradeTarget(navGroups, "Photos"), "photos");
    assert.equal(resolveFreePlanUpgradeTarget(navGroups, "Dashboard"), "dashboard");
    assert.equal(resolveFreePlanUpgradeTarget(navGroups, "Alerts"), "notifications");
    assert.equal(resolveFreePlanUpgradeTarget(navGroups, "Payments"), "admissions:payments");
    assert.equal(resolveFreePlanUpgradeTarget(navGroups, "My Students"), "my_school:students");
    assert.equal(resolveFreePlanUpgradeTarget(navGroups, "Messages"), "messages");
    assert.equal(
      resolveFreePlanUpgradeTarget(navGroups, "MudKitchen Account"),
      "mudkitchen_account",
    );
    assert.equal(resolveFreePlanUpgradeTarget(navGroups, "Full plan"), null);
    assert.equal(resolveFreePlanUpgradeTarget(navGroups, "Shadow days"), "schedule:shadow");
    assert.equal(resolveFreePlanUpgradeTarget(navGroups, "School events"), "schedule:events");
  });

  it("falls back from a child to its feature, then to the generic pitch", () => {
    assert.equal(getFreePlanPitch("my_school:friday_branch"), getFreePlanPitch("my_school"));
    assert.equal(getFreePlanPitch(null), FREE_PLAN_FALLBACK_PITCH);
    assert.equal(getFreePlanPitch("not-a-feature"), FREE_PLAN_FALLBACK_PITCH);
    assert.notEqual(getFreePlanPitch("photos"), FREE_PLAN_FALLBACK_PITCH);
  });

  it("keeps every popup light enough to scan", () => {
    for (const [key, pitch] of listFreePlanPitches()) {
      assert.equal(pitch.highlights.length, 3, key);
      for (const { text } of pitch.highlights) {
        assert.ok(words(text) <= 6, `${key} highlight: ${text}`);
      }
      assert.ok(words(pitch.scenario.moment) <= 4, `${key} moment`);
      assert.ok(words(pitch.scenario.before) <= 14, `${key} before`);
      assert.ok(words(pitch.scenario.after) <= 16, `${key} after`);
      for (const tool of pitch.replaces ?? []) {
        assert.ok(tool in FREE_PLAN_REPLACED_TOOLS, `${key} replaces ${tool}`);
      }
    }
  });
});
