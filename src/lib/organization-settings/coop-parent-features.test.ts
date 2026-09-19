import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "./catalog";
import {
  COOP_ONLY_PARENT_FEATURE_BADGE,
  getCoopParentFeatureAdminHint,
  isCoopAutoEnabledParentFeature,
  isCoopOnlyParentFeature,
  resolveCoopAutoEnabledOrgParentFlags,
} from "./coop-parent-features";
import { resolveMainParentOrganizationFeatures, resolveProgramParentFeatures } from "./resolve-program-parent-features";

describe("coop-parent-features", () => {
  it("identifies co-op-only and auto-enabled parent features", () => {
    assert.equal(isCoopOnlyParentFeature("curriculum"), true);
    assert.equal(isCoopOnlyParentFeature("supply_list"), true);
    assert.equal(isCoopOnlyParentFeature("teaching_schedule"), true);
    assert.equal(isCoopOnlyParentFeature("committees"), false);

    assert.equal(isCoopAutoEnabledParentFeature("supply_list"), true);
    assert.equal(isCoopAutoEnabledParentFeature("teaching_schedule"), true);
    assert.equal(isCoopAutoEnabledParentFeature("curriculum"), false);
  });

  it("returns admin hints for co-op features", () => {
    assert.match(
      getCoopParentFeatureAdminHint("curriculum"),
      /Co-op program portal only/,
    );
    assert.match(
      getCoopParentFeatureAdminHint("teaching_schedule"),
      /auto-enabled with co-op mode/,
    );
    assert.equal(COOP_ONLY_PARENT_FEATURE_BADGE, "Co-op program only");
  });

  it("normalizes auto-enabled org flags when co-op programs exist", () => {
    const normalized = resolveCoopAutoEnabledOrgParentFlags(
      {
        ...DEFAULT_FEATURES.parent,
        supply_list: false,
        teaching_schedule: false,
      },
      true,
    );

    assert.equal(normalized.supply_list, true);
    assert.equal(normalized.teaching_schedule, true);
    assert.equal(normalized.curriculum, false);
  });

  it("leaves org flags unchanged when no co-op programs exist", () => {
    const normalized = resolveCoopAutoEnabledOrgParentFlags(
      {
        ...DEFAULT_FEATURES.parent,
        supply_list: false,
        teaching_schedule: false,
      },
      false,
    );

    assert.equal(normalized.supply_list, false);
    assert.equal(normalized.teaching_schedule, false);
  });
});

describe("resolveProgramParentFeatures co-op behavior", () => {
  const orgFeatures = {
    ...DEFAULT_FEATURES,
    parent: {
      ...DEFAULT_FEATURES.parent,
      curriculum: false,
      supply_list: false,
      teaching_schedule: false,
    },
  };

  it("auto-enables supply_list and teaching_schedule when coop_mode is true", () => {
    const resolved = resolveProgramParentFeatures(orgFeatures, {
      mode: "isolated",
      coop_mode: true,
      features: { portal: true },
    });

    assert.equal(resolved.supply_list, true);
    assert.equal(resolved.teaching_schedule, true);
    assert.equal(resolved.curriculum, false);
  });

  it("strips co-op features from the main parent portal", () => {
    const mainFeatures = resolveMainParentOrganizationFeatures({
      ...DEFAULT_FEATURES,
      parent: {
        ...DEFAULT_FEATURES.parent,
        curriculum: true,
        supply_list: true,
        teaching_schedule: true,
      },
    });

    assert.equal(mainFeatures.parent?.curriculum, false);
    assert.equal(mainFeatures.parent?.supply_list, false);
    assert.equal(mainFeatures.parent?.teaching_schedule, false);
  });

  it("requires org and program flags for friday_branch in co-op portals", () => {
    const orgWithFridayBranch = {
      ...orgFeatures,
      parent: {
        ...orgFeatures.parent,
        friday_branch: true,
      },
    };

    const enabled = resolveProgramParentFeatures(orgWithFridayBranch, {
      mode: "isolated",
      coop_mode: true,
      features: { portal: true, friday_branch: true },
    });
    assert.equal(enabled.friday_branch, true);

    const programOff = resolveProgramParentFeatures(orgWithFridayBranch, {
      mode: "isolated",
      coop_mode: true,
      features: { portal: true },
    });
    assert.equal(programOff.friday_branch, false);

    const orgOff = resolveProgramParentFeatures(orgFeatures, {
      mode: "isolated",
      coop_mode: true,
      features: { portal: true, friday_branch: true },
    });
    assert.equal(orgOff.friday_branch, false);
  });
});
