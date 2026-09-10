import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mergeAssignedFamiliesOnAdminSave,
  stringArraysEqual,
} from "./program-coop-storage-errors";

describe("program coop storage merge helpers", () => {
  it("detects equal string arrays", () => {
    assert.equal(stringArraysEqual(["A", "B"], ["A", "B"]), true);
    assert.equal(stringArraysEqual(["A"], ["B"]), false);
  });

  it("keeps server families when admin did not edit assignments", () => {
    const merged = mergeAssignedFamiliesOnAdminSave(
      ["Parent A"],
      [],
      [],
    );
    assert.deepEqual(merged, ["Parent A"]);
  });

  it("uses draft families when admin edited assignments", () => {
    const merged = mergeAssignedFamiliesOnAdminSave(
      ["Parent A"],
      [],
      ["Parent B"],
    );
    assert.deepEqual(merged, ["Parent B"]);
  });
});
