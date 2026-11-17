import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPublicTourEnabled, parsePublicTourPageSettings } from "./public-tour-settings";

describe("public tour page default", () => {
  it("is on when nothing was ever set", () => {
    assert.equal(isPublicTourEnabled(parsePublicTourPageSettings(undefined)), true);
    assert.equal(isPublicTourEnabled(parsePublicTourPageSettings({})), true);
  });

  it("stays off when a platform admin turned it off", () => {
    assert.equal(isPublicTourEnabled(parsePublicTourPageSettings({ enabled: false })), false);
  });

  it("is on when turned on", () => {
    assert.equal(isPublicTourEnabled(parsePublicTourPageSettings({ enabled: true })), true);
  });
});
