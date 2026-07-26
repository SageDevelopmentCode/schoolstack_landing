import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getGuardianRoleLabel,
  guardianRoleLabelText,
} from "./guardian-role-label";

describe("getGuardianRoleLabel", () => {
  it("returns null when there is only one guardian", () => {
    assert.equal(
      getGuardianRoleLabel({
        guardianId: "g-1",
        primaryGuardianId: "g-1",
        guardianIndex: 0,
        totalGuardians: 1,
      }),
      null,
    );
  });

  it("labels the matching primary guardian when primaryGuardianId is set", () => {
    assert.equal(
      getGuardianRoleLabel({
        guardianId: "g-1",
        primaryGuardianId: "g-1",
        guardianIndex: 0,
        totalGuardians: 2,
      }),
      "primary",
    );
    assert.equal(
      getGuardianRoleLabel({
        guardianId: "g-2",
        primaryGuardianId: "g-1",
        guardianIndex: 1,
        totalGuardians: 2,
      }),
      "added",
    );
  });

  it("falls back to the first guardian when primaryGuardianId is missing", () => {
    assert.equal(
      getGuardianRoleLabel({
        guardianId: "g-1",
        primaryGuardianId: null,
        guardianIndex: 0,
        totalGuardians: 2,
      }),
      "primary",
    );
    assert.equal(
      getGuardianRoleLabel({
        guardianId: "g-2",
        primaryGuardianId: null,
        guardianIndex: 1,
        totalGuardians: 2,
      }),
      "added",
    );
  });
});

describe("guardianRoleLabelText", () => {
  it("returns readable labels for each role", () => {
    assert.equal(guardianRoleLabelText("primary"), "Primary contact");
    assert.equal(guardianRoleLabelText("added"), "Added parent");
  });
});
