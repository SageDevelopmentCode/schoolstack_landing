import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultIsolatedProgramParentFeatures,
  deriveProgramPortalSettingsFromEditor,
  expandProgramPortalSettingsForEditor,
  getDefaultProgramPortalFeatureToggles,
  getOrgEnabledParentCatalogKeys,
  getProgramPortalFeatureScopeBadgeLabel,
  getProgramPortalFeatureScopeTooltip,
  isProgramParentPortalCoopMode,
  parseProgramParentPortalSettings,
  programPortalEditorStatesEqual,
  programPortalSettingsMatchOrg,
  suggestProgramPortalSlug,
  wouldUseIsolatedProgramPortal,
} from "./program-parent-portal";
import {
  buildInitialIsolatedProgramPortalSettings,
  isProgramIsolationAllowed,
  isProgramParentPortalEnabled,
  parseProgramParentPortalOrgConfig,
} from "./program-parent-portal-governance";
import { parseAdmissionsOrgSettings } from "./admissions-org-settings";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import { describeParentPortalCalendarScope } from "@/lib/school-events/event-audience";
import { describeParentPortalMessagesScope } from "@/lib/messages/message-audience";
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

describe("getProgramPortalFeatureScopeTooltip", () => {
  it("returns isolation tooltips for scoped features", () => {
    const calendar = getProgramPortalFeatureScopeTooltip("calendar");
    assert.equal(calendar?.variant, "isolation");
    assert.equal(calendar?.content, describeParentPortalCalendarScope(true));

    const portal = getProgramPortalFeatureScopeTooltip("portal");
    assert.equal(portal?.variant, "isolation");
    assert.equal(portal?.content, describeParentPortalCalendarScope(true));

    const messages = getProgramPortalFeatureScopeTooltip("messages");
    assert.equal(messages?.variant, "isolation");
    assert.equal(messages?.content, describeParentPortalMessagesScope(true));

    const children = getProgramPortalFeatureScopeTooltip("children");
    assert.equal(children?.variant, "isolation");
    assert.match(children?.content ?? "", /enrolled in this program/i);
  });

  it("returns shared tooltips for org-wide features", () => {
    const billing = getProgramPortalFeatureScopeTooltip("billing");
    assert.equal(billing?.variant, "shared");
    assert.match(billing?.content ?? "", /org-wide/i);

    const feed = getProgramPortalFeatureScopeTooltip("feed");
    assert.equal(feed?.variant, "shared");
    assert.match(feed?.content ?? "", /org-wide/i);
  });

  it("returns null for features without special scope copy", () => {
    assert.equal(getProgramPortalFeatureScopeTooltip("attendance"), null);
    assert.equal(getProgramPortalFeatureScopeTooltip("classroom_signups"), null);
    assert.equal(getProgramPortalFeatureScopeTooltip("committees"), null);
  });
});

describe("getProgramPortalFeatureScopeBadgeLabel", () => {
  it("returns plain per-feature badge labels", () => {
    assert.equal(getProgramPortalFeatureScopeBadgeLabel("portal"), "This program only");
    assert.equal(getProgramPortalFeatureScopeBadgeLabel("calendar"), "This program only");
    assert.equal(
      getProgramPortalFeatureScopeBadgeLabel("messages"),
      "This program + school office",
    );
    assert.equal(getProgramPortalFeatureScopeBadgeLabel("children"), "This program only");
  });

  it("returns null for shared and unbadged features", () => {
    assert.equal(getProgramPortalFeatureScopeBadgeLabel("billing"), null);
    assert.equal(getProgramPortalFeatureScopeBadgeLabel("feed"), null);
    assert.equal(getProgramPortalFeatureScopeBadgeLabel("attendance"), null);
  });
});

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

  it("parses coop_mode when enabled on isolated programs", () => {
    const parsed = parseProgramParentPortalSettings({
      mode: "isolated",
      coop_mode: true,
    });

    assert.equal(parsed.coop_mode, true);
  });
});

describe("isProgramParentPortalCoopMode", () => {
  it("is true only for isolated programs with coop_mode enabled", () => {
    assert.equal(
      isProgramParentPortalCoopMode({
        mode: "isolated",
        coop_mode: true,
      }),
      true,
    );
    assert.equal(
      isProgramParentPortalCoopMode({
        mode: "isolated",
      }),
      false,
    );
    assert.equal(
      isProgramParentPortalCoopMode({
        mode: "inherit",
        coop_mode: true,
      }),
      false,
    );
  });
});

describe("coop_mode editor round-trip", () => {
  it("derives and expands coop_mode on isolated programs", () => {
    const editor = expandProgramPortalSettingsForEditor(
      {
        mode: "isolated",
        coop_mode: true,
        features: { calendar: true, messages: true },
      },
      orgFeatures.parent,
    );

    assert.equal(editor.coop_mode, true);

    const derived = deriveProgramPortalSettingsFromEditor(
      editor,
      orgFeatures,
      { isolationAllowed: true },
    );

    assert.equal(derived.mode, "isolated");
    assert.equal(derived.coop_mode, true);
  });
});

describe("resolveProgramParentFeatures", () => {
  it("uses org features for inherit mode", () => {
    const resolved = resolveProgramParentFeatures(orgFeatures, { mode: "inherit" });
    assert.equal(resolved.messages, true);
    assert.equal(resolved.billing, true);
    assert.equal(resolved.curriculum, false);
  });

  it("enables curriculum only for co-op isolated programs", () => {
    const orgWithCurriculum = {
      ...orgFeatures,
      parent: { ...orgFeatures.parent, curriculum: true },
    };

    const enabled = resolveProgramParentFeatures(orgWithCurriculum, {
      mode: "isolated",
      coop_mode: true,
      features: { portal: true, curriculum: true },
    });
    assert.equal(enabled.curriculum, true);

    const coopOff = resolveProgramParentFeatures(orgWithCurriculum, {
      mode: "isolated",
      features: { portal: true, curriculum: true },
    });
    assert.equal(coopOff.curriculum, false);

    const orgOff = resolveProgramParentFeatures(orgFeatures, {
      mode: "isolated",
      coop_mode: true,
      features: { portal: true, curriculum: true },
    });
    assert.equal(orgOff.curriculum, false);
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

describe("program parent portal governance", () => {
  const coopProgramId = "program-coop-id";
  const enabledConfig = {
    enabled: true,
    isolated_program_ids: [coopProgramId],
  };

  it("parses org config with defaults", () => {
    assert.deepEqual(parseProgramParentPortalOrgConfig(undefined), {
      enabled: false,
      isolated_program_ids: [],
    });
  });

  it("parses admissions org settings", () => {
    const parsed = parseAdmissionsOrgSettings({
      program_parent_portal: {
        enabled: true,
        isolated_program_ids: [coopProgramId, coopProgramId, ""],
      },
    });
    assert.deepEqual(parseProgramParentPortalOrgConfig(parsed), {
      enabled: true,
      isolated_program_ids: [coopProgramId],
    });
  });

  it("checks allowlist membership", () => {
    assert.equal(isProgramParentPortalEnabled(enabledConfig), true);
    assert.equal(
      isProgramIsolationAllowed(coopProgramId, enabledConfig),
      true,
    );
    assert.equal(
      isProgramIsolationAllowed("other-program", enabledConfig),
      false,
    );
    assert.equal(
      isProgramIsolationAllowed(coopProgramId, {
        enabled: false,
        isolated_program_ids: [coopProgramId],
      }),
      false,
    );
  });

  it("builds initial isolated settings from org parent features", () => {
    const settings = buildInitialIsolatedProgramPortalSettings(orgFeatures.parent);
    assert.equal(settings.mode, "isolated");
    assert.equal(settings.features?.messages, true);
    assert.equal(settings.features?.portal, true);
  });

  it("derive returns inherit when isolation is not allowed", () => {
    const editor = expandProgramPortalSettingsForEditor(
      { mode: "inherit" },
      orgFeatures.parent,
    );
    editor.features.messages = false;

    assert.deepEqual(
      deriveProgramPortalSettingsFromEditor(editor, orgFeatures, {
        isolationAllowed: false,
      }),
      { mode: "inherit" },
    );
    assert.equal(
      wouldUseIsolatedProgramPortal(editor, orgFeatures, {
        isolationAllowed: false,
      }),
      false,
    );
  });

  it("derive returns isolated when isolation is allowed", () => {
    const editor = expandProgramPortalSettingsForEditor(
      { mode: "inherit" },
      orgFeatures.parent,
    );

    const derived = deriveProgramPortalSettingsFromEditor(editor, orgFeatures, {
      isolationAllowed: true,
    });
    assert.equal(derived.mode, "isolated");
    assert.equal(derived.features?.messages, true);
    assert.equal(
      wouldUseIsolatedProgramPortal(editor, orgFeatures, {
        isolationAllowed: true,
      }),
      true,
    );
  });

  it("derive returns isolated for allowlisted program even when toggles match org", () => {
    const editor = expandProgramPortalSettingsForEditor(
      { mode: "inherit" },
      orgFeatures.parent,
    );

    assert.equal(programPortalSettingsMatchOrg(editor, orgFeatures.parent), true);
    assert.equal(
      deriveProgramPortalSettingsFromEditor(editor, orgFeatures, {
        isolationAllowed: true,
      }).mode,
      "isolated",
    );
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
