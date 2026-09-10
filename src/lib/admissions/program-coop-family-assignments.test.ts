import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAddCoopAssignedFamily,
  formatCoopAssignedFamilyLabels,
  isCoopFamilyAssigned,
} from "./program-coop-family-assignment-helpers";

describe("program-coop-family-assignments", () => {
  it("matches family assignment by exact family id", () => {
    const familyIds = ["family-a", "family-b"];
    assert.equal(isCoopFamilyAssigned(familyIds, "family-a"), true);
    assert.equal(isCoopFamilyAssigned(familyIds, "family-c"), false);
  });

  it("prevents duplicate family ids and enforces max", () => {
    const familyIds = ["family-a", "family-b", "family-c", "family-d", "family-e"];
    assert.equal(canAddCoopAssignedFamily(familyIds, "family-a", 5), false);
    assert.equal(canAddCoopAssignedFamily(familyIds, "family-f", 5), false);
    assert.equal(canAddCoopAssignedFamily(["family-a"], "family-b", 5), true);
  });

  it("formats assigned family labels from a name map", () => {
    const labels = formatCoopAssignedFamilyLabels(
      ["family-a", "family-b"],
      new Map([
        ["family-a", "The Chen family"],
        ["family-b", "The Rivera family"],
      ]),
    );
    assert.equal(labels, "The Chen family, The Rivera family");
  });

  it("uses unknown-family fallback for missing map entries", () => {
    const labels = formatCoopAssignedFamilyLabels(
      ["missing-family"],
      new Map(),
    );
    assert.equal(labels, "Unknown family");
  });
});
