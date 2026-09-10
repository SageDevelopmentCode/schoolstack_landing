import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAddSupplyAssignedFamily,
  isSupplyFamilyAssigned,
  normalizeSupplyFamilyName,
} from "./program-coop-supply-list-mock";

describe("program coop supply list claim helpers", () => {
  it("normalizes parent names for sign-up", () => {
    assert.equal(normalizeSupplyFamilyName("  Rachael  Smith  "), "Rachael Smith");
  });

  it("prevents duplicate sign-ups case-insensitively", () => {
    const families = ["Rachael"];
    assert.equal(canAddSupplyAssignedFamily(families, "rachael"), false);
    assert.equal(isSupplyFamilyAssigned(families, "Rachael"), true);
  });

  it("respects the five-family limit", () => {
    const families = ["A", "B", "C", "D", "E"];
    assert.equal(canAddSupplyAssignedFamily(families, "F"), false);
  });
});
