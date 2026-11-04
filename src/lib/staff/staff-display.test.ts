import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { staffShortDisplayNameFromFullName } from "./staff-display";

describe("staffShortDisplayNameFromFullName", () => {
  it("formats first name and last initial", () => {
    assert.equal(staffShortDisplayNameFromFullName("Sabrina Obnamia"), "Sabrina O.");
  });

  it("leaves a single token unchanged", () => {
    assert.equal(staffShortDisplayNameFromFullName("Madonna"), "Madonna");
  });

  it("handles extra whitespace", () => {
    assert.equal(staffShortDisplayNameFromFullName("  Nina   Thompson  "), "Nina T.");
  });
});
