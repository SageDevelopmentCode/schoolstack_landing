import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getDefaultFridayBranchSettings,
  isFridayBranchParentPortalAvailable,
  isFridayBranchParentPortalPaused,
  parseOrganizationFridayBranchSettings,
} from "./friday-branch-org-settings";
import { mergeFeatures } from "@/lib/organization-settings/merge";

describe("friday-branch-org-settings", () => {
  it("defaults to parent portal open", () => {
    assert.deepEqual(getDefaultFridayBranchSettings(), {
      parent_portal_paused: false,
    });
    assert.equal(parseOrganizationFridayBranchSettings(null).parent_portal_paused, false);
    assert.equal(parseOrganizationFridayBranchSettings({}).parent_portal_paused, false);
  });

  it("parses parent_portal_paused when true", () => {
    assert.equal(
      parseOrganizationFridayBranchSettings({ parent_portal_paused: true })
        .parent_portal_paused,
      true,
    );
    assert.equal(
      parseOrganizationFridayBranchSettings({ parent_portal_paused: "yes" })
        .parent_portal_paused,
      false,
    );
  });

  it("isFridayBranchParentPortalAvailable respects feature flag and pause", () => {
    const features = mergeFeatures({
      parent: { friday_branch: true },
    });

    assert.equal(
      isFridayBranchParentPortalAvailable(features, getDefaultFridayBranchSettings()),
      true,
    );
    assert.equal(
      isFridayBranchParentPortalAvailable(features, { parent_portal_paused: true }),
      false,
    );
    assert.equal(
      isFridayBranchParentPortalAvailable(
        mergeFeatures({ parent: { friday_branch: false } }),
        getDefaultFridayBranchSettings(),
      ),
      false,
    );
  });

  it("isFridayBranchParentPortalPaused", () => {
    assert.equal(isFridayBranchParentPortalPaused(undefined), false);
    assert.equal(isFridayBranchParentPortalPaused({ parent_portal_paused: true }), true);
  });
});
