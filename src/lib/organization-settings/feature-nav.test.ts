import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "./catalog";
import { buildAdminNavGroups } from "./admin-nav";
import { resolveAdminNavChildHref } from "./admin-routes";
import {
  getDefaultFeatureChildren,
  mergePortalFeatureNav,
} from "./feature-nav";

describe("admin communication nav defaults", () => {
  it("keeps communication off My School defaults", () => {
    const children = getDefaultFeatureChildren("my_school");
    const keys = children.map((child) => child.key);
    assert.ok(!keys.includes("newsletters"));
    assert.ok(!keys.includes("communication"));
  });

  it("defines top-level communication children with cross-feature routes", () => {
    const children = getDefaultFeatureChildren("communication");
    const newsletters = children.find((child) => child.key === "newsletters");
    assert.equal(newsletters?.routeFeature, "my_school");
    assert.equal(newsletters?.routeSubtab, "newsletters");
    assert.equal(children[1]?.routeFeature, "committees");
    assert.equal(children[2]?.routeFeature, "messages");
  });

  it("resolves newsletters href under my_school", () => {
    const href = resolveAdminNavChildHref("rooted-meadows", "communication", {
      key: "newsletters",
      routeFeature: "my_school",
      routeSubtab: "newsletters",
    });
    assert.equal(
      href,
      "/school/rooted-meadows/admin/my_school/newsletters",
    );
  });

  it("hoists my_school nested communication into root communication on merge", () => {
    const merged = mergePortalFeatureNav("admin", {
      groups: ["Main"],
      items: {
        my_school: {
          group: "Main",
          icon: "school",
          children: [
            { key: "students", label: "My Students", icon: "users" },
            {
              key: "communication",
              label: "Communication",
              icon: "message-square",
              children: [
                { key: "newsletters", label: "Newsletters", icon: "mail" },
              ],
            },
          ],
        },
      },
      order: ["my_school"],
    });

    const mySchoolChildren = merged.items.my_school?.children ?? [];
    assert.ok(!mySchoolChildren.some((child) => child.key === "communication"));
    assert.ok(!mySchoolChildren.some((child) => child.key === "newsletters"));

    const commChildren = merged.items.communication?.children ?? [];
    assert.ok(commChildren.some((child) => child.key === "newsletters"));
    assert.equal(commChildren[0]?.routeFeature, "my_school");
    assert.equal(commChildren[0]?.routeSubtab, "newsletters");
  });

  it("shows communication at root after my_school and hides committees/messages", () => {
    const groups = buildAdminNavGroups(DEFAULT_FEATURES.admin, undefined);
    const mainItems = groups.find((group) => group.label === "Main")?.items ?? [];
    const rootKeys = mainItems.map((item) => item.key);

    const mySchoolIndex = rootKeys.indexOf("my_school");
    const communicationIndex = rootKeys.indexOf("communication");
    assert.ok(mySchoolIndex >= 0);
    assert.ok(communicationIndex > mySchoolIndex);
    assert.ok(!rootKeys.includes("committees"));
    assert.ok(!rootKeys.includes("messages"));
    assert.ok(rootKeys.includes("notifications"));

    const communication = mainItems.find((item) => item.key === "communication");
    assert.ok(communication?.children?.some((child) => child.key === "messages"));
    assert.ok(communication?.children?.some((child) => child.key === "committees"));
  });
});
