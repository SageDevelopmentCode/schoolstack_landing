import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "./catalog";
import {
  isParentHomeFridayBranchEnabled,
  isParentNavFridayBranchEnabled,
} from "./parent-home-features";
import { mergeFeatures } from "./merge";

describe("parent-home friday branch pause", () => {
  const features = mergeFeatures({
    parent: { ...DEFAULT_FEATURES.parent, friday_branch: true },
    parent_home: { friday_branch: true },
  });

  it("hides home and nav when paused", () => {
    const paused = { parent_portal_paused: true };
    assert.equal(isParentHomeFridayBranchEnabled(features, paused), false);
    assert.equal(isParentNavFridayBranchEnabled(features, paused), false);
  });

  it("shows when not paused and flags on", () => {
    assert.equal(isParentHomeFridayBranchEnabled(features), true);
    assert.equal(isParentNavFridayBranchEnabled(features), true);
  });
});
