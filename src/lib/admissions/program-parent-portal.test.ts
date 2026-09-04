import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultIsolatedProgramParentFeatures,
  deriveProgramPortalSettingsFromEditor,
  expandProgramPortalSettingsForEditor,
  getDefaultProgramPortalFeatureToggles,
  getOrgEnabledParentCatalogKeys,
  parseProgramParentPortalSettings,
  programPortalEditorStatesEqual,
  programPortalSettingsMatchOrg,
  suggestProgramPortalSlug,
  wouldUseIsolatedProgramPortal,
} from "./program-parent-portal";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import { resolveProgramParentFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import {
  getProgramParentPortalPreviewBillingInitialData,
  getProgramParentPortalPreviewBillingPageMeta,
  getProgramParentPortalPreviewChildProfiles,
  getProgramParentPortalPreviewChildren,
  getProgramParentPortalPreviewCommitteesInitialData,
  getProgramParentPortalPreviewMessageThreads,
  getProgramParentPortalPreviewUserProfile,
  isProgramParentPortalPreviewFamilyId,
  PROGRAM_PARENT_PORTAL_PREVIEW_FAMILY_ID,
} from "./program-parent-portal-preview-data";

const orgFeatures = {
  ...DEFAULT_FEATURES,
  parent: {
    ...DEFAULT_FEATURES.parent,
    messages: true,
    calendar: true,
    feed: true,
    billing: true,
  },
};

const orgFeaturesNoFeed = {
  ...orgFeatures,
  parent: { ...orgFeatures.parent, feed: false },
};

describe("suggestProgramPortalSlug", () => {
  it("slugifies program names", () => {
    assert.equal(
      suggestProgramPortalSlug("Kindergarten Co-op"),
      "kindergarten-co-op",
    );
  });
});

describe("parseProgramParentPortalSettings", () => {
  it("defaults to inherit mode", () => {
    assert.deepEqual(parseProgramParentPortalSettings(null), { mode: "inherit" });
  });

  it("parses isolated settings", () => {
    const parsed = parseProgramParentPortalSettings({
      mode: "isolated",
      label: "Co-op",
      features: { calendar: true, messages: true, feed: true },
      feature_nav: {
        parent: {
          items: { feed: { label: "Photos" } },
        },
      },
    });

    assert.equal(parsed.mode, "isolated");
    assert.equal(parsed.label, "Co-op");
    assert.equal(parsed.features?.calendar, true);
    assert.equal(parsed.feature_nav?.parent?.items?.feed?.label, "Photos");
  });
});

describe("resolveProgramParentFeatures", () => {
  it("uses org features for inherit mode", () => {
    const resolved = resolveProgramParentFeatures(orgFeatures, { mode: "inherit" });
    assert.equal(resolved.messages, true);
    assert.equal(resolved.billing, true);
  });

  it("applies org ceiling AND program subset for isolated mode", () => {
    const resolved = resolveProgramParentFeatures(orgFeatures, {
      mode: "isolated",
      features: {
        portal: true,
        calendar: true,
        messages: true,
        feed: false,
        billing: true,
      },
    });

    assert.equal(resolved.calendar, true);
    assert.equal(resolved.messages, true);
    assert.equal(resolved.feed, false);
    assert.equal(resolved.billing, true);
  });

  it("blocks program features disabled at org level", () => {
    const orgWithMessagesOff = {
      ...orgFeatures,
      parent: { ...orgFeatures.parent, messages: false },
    };

    const resolved = resolveProgramParentFeatures(orgWithMessagesOff, {
      mode: "isolated",
      features: { portal: true, messages: true, calendar: true },
    });

    assert.equal(resolved.messages, false);
    assert.equal(resolved.calendar, true);
  });
});

describe("getOrgEnabledParentCatalogKeys", () => {
  it("omits org-disabled features", () => {
    const keys = getOrgEnabledParentCatalogKeys(orgFeaturesNoFeed.parent);
    assert.equal(keys.includes("feed"), false);
    assert.equal(keys.includes("billing"), true);
  });

  it("excludes always-on home from configurable keys", () => {
    const keys = getOrgEnabledParentCatalogKeys(orgFeatures.parent);
    assert.equal(keys.includes("portal"), false);
  });
});

describe("defaultIsolatedProgramParentFeatures", () => {
  it("mirrors org-enabled parent features", () => {
    const defaults = defaultIsolatedProgramParentFeatures(orgFeatures.parent);
    assert.equal(defaults.billing, true);
    assert.equal(defaults.children, true);
    assert.equal(defaults.messages, true);
  });
});

describe("getDefaultProgramPortalFeatureToggles", () => {
  it("enables org-enabled catalog features by default", () => {
    const toggles = getDefaultProgramPortalFeatureToggles(orgFeatures.parent);
    assert.equal(toggles.messages, true);
    assert.equal(toggles.calendar, true);
    assert.equal(toggles.billing, true);
  });

  it("omits always-on home from editor defaults", () => {
    const toggles = getDefaultProgramPortalFeatureToggles(orgFeatures.parent);
    assert.equal(toggles.portal, undefined);
  });

  it("omits org-disabled features", () => {
    const toggles = getDefaultProgramPortalFeatureToggles(orgFeaturesNoFeed.parent);
    assert.equal(toggles.feed, undefined);
    assert.equal(toggles.messages, true);
  });
});

describe("deriveProgramPortalSettingsFromEditor", () => {
  it("derives inherit when toggles match org mirror", () => {
    const editor = expandProgramPortalSettingsForEditor(
      { mode: "inherit" },
      orgFeatures.parent,
    );
    assert.equal(programPortalSettingsMatchOrg(editor, orgFeatures.parent), true);
    assert.deepEqual(
      deriveProgramPortalSettingsFromEditor(editor, orgFeatures),
      { mode: "inherit" },
    );
  });

  it("derives isolated when a toggle is turned off", () => {
    const editor = expandProgramPortalSettingsForEditor(
      { mode: "inherit" },
      orgFeatures.parent,
    );
    editor.features.messages = false;

    assert.equal(wouldUseIsolatedProgramPortal(editor, orgFeatures), true);
    const derived = deriveProgramPortalSettingsFromEditor(editor, orgFeatures);
    assert.equal(derived.mode, "isolated");
    assert.equal(derived.features?.messages, false);
    assert.equal(derived.features?.calendar, true);
    assert.equal(derived.features?.portal, true);
  });

  it("always persists portal when org home is enabled", () => {
    const editor = expandProgramPortalSettingsForEditor(
      { mode: "inherit" },
      orgFeatures.parent,
    );
    editor.features.messages = false;

    const derived = deriveProgramPortalSettingsFromEditor(editor, orgFeatures);
    assert.equal(derived.features?.portal, true);
  });

  it("derives isolated when feed label is customized", () => {
    const editor = expandProgramPortalSettingsForEditor(
      { mode: "inherit" },
      orgFeatures.parent,
    );
    editor.feature_nav = {
      parent: { items: { feed: { label: "Photos" } } },
    };

    const derived = deriveProgramPortalSettingsFromEditor(editor, orgFeatures);
    assert.equal(derived.mode, "isolated");
    assert.equal(derived.feature_nav?.parent?.items?.feed?.label, "Photos");
  });

  it("does not include org-disabled features in derived output", () => {
    const editor = expandProgramPortalSettingsForEditor(
      { mode: "inherit" },
      orgFeaturesNoFeed.parent,
    );
    editor.features.messages = false;

    const derived = deriveProgramPortalSettingsFromEditor(editor, orgFeaturesNoFeed);
    assert.equal(derived.mode, "isolated");
    assert.equal(derived.features?.feed, undefined);
    assert.equal(derived.features?.messages, false);
  });
});

describe("programPortalEditorStatesEqual", () => {
  it("treats inherit and matching expanded editor as equal", () => {
    const fromInherit = expandProgramPortalSettingsForEditor(
      { mode: "inherit" },
      orgFeatures.parent,
    );
    const fromExpanded = expandProgramPortalSettingsForEditor(
      deriveProgramPortalSettingsFromEditor(fromInherit, orgFeatures),
      orgFeatures.parent,
    );
    assert.equal(
      programPortalEditorStatesEqual(fromInherit, fromExpanded, orgFeatures),
      true,
    );
  });
});

describe("programParentPortalPreviewData", () => {
  it("returns sample profile and content", () => {
    assert.equal(getProgramParentPortalPreviewUserProfile().displayName, "Alex Morgan");
    assert.ok(getProgramParentPortalPreviewChildren().length >= 1);
    assert.ok(getProgramParentPortalPreviewMessageThreads().length >= 1);
  });

  it("returns valid billing preview data", () => {
    const meta = getProgramParentPortalPreviewBillingPageMeta();
    assert.ok(meta.balanceDueCents > 0);
    assert.ok(meta.openChargeCount >= 1);

    const billing = getProgramParentPortalPreviewBillingInitialData("org-preview");
    assert.equal(billing.readiness.state, "ready");
    assert.ok(billing.charges.length >= 1);
    assert.ok(billing.familySummary.children.length >= 1);
    assert.equal(billing.familySummary.balanceDueCents, meta.balanceDueCents);
  });

  it("returns fallback committees preview data", () => {
    const committees = getProgramParentPortalPreviewCommitteesInitialData();
    assert.ok(committees.browseCommittees.length >= 1);
    assert.equal(committees.myCommittees.length, 0);
  });

  it("returns mock child profiles for preview application ids", () => {
    const profiles = getProgramParentPortalPreviewChildProfiles();
    assert.equal(profiles["preview-app-1"]?.application.status, "enrolled");
    assert.equal(profiles["preview-app-2"]?.application.status, "enrolled");
    assert.ok(profiles["preview-app-1"]?.assignedTeachers.length >= 1);
  });

  it("identifies program portal preview family ids", () => {
    assert.equal(
      isProgramParentPortalPreviewFamilyId(PROGRAM_PARENT_PORTAL_PREVIEW_FAMILY_ID),
      true,
    );
    assert.equal(isProgramParentPortalPreviewFamilyId("real-family-uuid"), false);
  });
});
