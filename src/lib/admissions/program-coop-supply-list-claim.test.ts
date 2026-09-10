import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAddSupplyAssignedFamily,
  isSupplyFamilyAssigned,
} from "./program-coop-supply-list-mock";

describe("program coop supply list claim helpers", () => {
  it("prevents duplicate sign-ups by family id", () => {
    const familyIds = ["family-a"];
    assert.equal(canAddSupplyAssignedFamily(familyIds, "family-a"), false);
    assert.equal(isSupplyFamilyAssigned(familyIds, "family-a"), true);
  });

  it("respects the five-family limit", () => {
    const familyIds = ["a", "b", "c", "d", "e"];
    assert.equal(canAddSupplyAssignedFamily(familyIds, "f"), false);
  });
});
