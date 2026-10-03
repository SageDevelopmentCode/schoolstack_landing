import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import {
  detectMobilePortalContextFromPathname,
  resolveMobileMoreMenuFeatureKeys,
  resolveMobileParentTabBar,
  resolveMobilePortalEntryPath,
} from "./mobile-parent-portal-nav";
import { resolveMainParentOrganizationFeatures } from "@/lib/organization-settings/resolve-program-parent-features";

describe("mobile-parent-portal-nav", () => {
  it("detects program portal from pathname", () => {
    assert.deepEqual(
      detectMobilePortalContextFromPathname(
        "/parent/rooted-meadows-demo/p/kindergarten-co-op/home",
      ),
      { mode: "program", portalSlug: "kindergarten-co-op" },
    );
    assert.deepEqual(
      detectMobilePortalContextFromPathname("/parent/rooted-meadows-demo/home"),
      { mode: "main" },
    );
  });

  it("builds mobile entry paths for main and program contexts", () => {
    assert.equal(
      resolveMobilePortalEntryPath("rooted-meadows-demo", { id: "main" }),
      "/parent/rooted-meadows-demo/home",
    );
    assert.equal(
      resolveMobilePortalEntryPath("rooted-meadows-demo", {
        id: "program:abc",
        portalSlug: "kindergarten-co-op",
      }),
      "/parent/rooted-meadows-demo/p/kindergarten-co-op/home",
    );
  });

  it("keeps main portal on the default five-tab bar", () => {
    const tabs = resolveMobileParentTabBar({
      mode: "main",
      parentFeatures: {
        ...DEFAULT_FEATURES.parent,
        portal: true,
        billing: true,
        messages: true,
        calendar: true,
      },
    });

    assert.deepEqual(
      tabs.map((tab) => tab.tabId),
      ["home", "billing", "messages", "calendar", "more"],
    );
  });

  it("omits co-op-only keys from main portal tab bar", () => {
    const mainFeatures = resolveMainParentOrganizationFeatures({
      ...DEFAULT_FEATURES,
      parent: {
        ...DEFAULT_FEATURES.parent,
        portal: true,
        billing: true,
        messages: true,
        calendar: true,
        curriculum: true,
        supply_list: true,
        teaching_schedule: true,
      },
    }).parent;

    const tabs = resolveMobileParentTabBar({
      mode: "main",
      parentFeatures: mainFeatures,
    });

    assert.equal(tabs.some((tab) => tab.featureKey === "curriculum"), false);
    assert.equal(tabs.some((tab) => tab.featureKey === "supply_list"), false);
    assert.equal(tabs.some((tab) => tab.featureKey === "teaching_schedule"), false);
  });

  it("caps program primary tabs at four plus More in co-op mode", () => {
    const tabs = resolveMobileParentTabBar({
      mode: "program",
      coopMode: true,
      parentFeatures: {
        ...DEFAULT_FEATURES.parent,
        portal: true,
        billing: true,
        messages: true,
        calendar: true,
        children: true,
        committees: true,
        curriculum: true,
        supply_list: true,
        teaching_schedule: true,
        attendance: true,
      },
    });

    assert.equal(tabs.length, 5);
    assert.equal(tabs.at(-1)?.tabId, "more");
    assert.equal(tabs.some((tab) => tab.featureKey === "teaching_schedule"), true);
    assert.equal(tabs.filter((tab) => tab.tabId !== "more").length, 4);
  });

  it("includes children and committees in main portal More menu when enabled", () => {
    const moreKeys = resolveMobileMoreMenuFeatureKeys({
      mode: "main",
      parentFeatures: {
        ...DEFAULT_FEATURES.parent,
        portal: true,
        billing: true,
        messages: true,
        calendar: true,
        attendance: true,
        children: true,
        committees: true,
        classroom_signups: true,
        forms_documents: true,
      },
    });

    assert.equal(moreKeys.includes("children"), true);
    assert.equal(moreKeys.includes("committees"), true);
    assert.equal(moreKeys.includes("attendance"), true);
    assert.equal(moreKeys.includes("notifications"), true);
  });

  it("always includes notifications in More menu without a parent feature flag", () => {
    const moreKeys = resolveMobileMoreMenuFeatureKeys({
      mode: "main",
      parentFeatures: {
        ...DEFAULT_FEATURES.parent,
        portal: true,
      },
    });

    assert.equal(moreKeys.includes("notifications"), true);
    assert.equal(moreKeys.includes("children"), true);
  });

  it("includes children, committees, and notifications in program More menu when enabled (non-co-op)", () => {
    const moreKeys = resolveMobileMoreMenuFeatureKeys({
      mode: "program",
      coopMode: false,
      parentFeatures: {
        ...DEFAULT_FEATURES.parent,
        portal: true,
        billing: true,
        messages: true,
        calendar: true,
        children: true,
        committees: true,
        notifications: true,
      } as typeof DEFAULT_FEATURES.parent & { notifications: boolean },
    });

    assert.equal(moreKeys.includes("children"), true);
    assert.equal(moreKeys.includes("committees"), true);
    assert.equal(moreKeys.includes("notifications"), true);
  });

  it("routes committees and children to More menu in co-op mode", () => {
    const moreKeys = resolveMobileMoreMenuFeatureKeys({
      coopMode: true,
      parentFeatures: {
        ...DEFAULT_FEATURES.parent,
        portal: true,
        billing: true,
        messages: true,
        calendar: true,
        children: true,
        committees: true,
        curriculum: true,
        supply_list: true,
        teaching_schedule: true,
        attendance: true,
      },
    });

    assert.equal(moreKeys.includes("committees"), true);
    assert.equal(moreKeys.includes("children"), true);
  });
});
