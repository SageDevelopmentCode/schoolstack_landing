import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeFeatures } from "./merge";

describe("mergeFeatures parent committees sync", () => {
  it("enables parent committees when admin committees is on and parent did not opt out", () => {
    const merged = mergeFeatures({
      admin: { committees: true },
      parent: { portal: true },
    });

    assert.equal(merged.parent.committees, true);
  });

  it("keeps parent committees off when explicitly disabled in stored settings", () => {
    const merged = mergeFeatures({
      admin: { committees: true },
      parent: { committees: false },
    });

    assert.equal(merged.parent.committees, false);
  });

  it("does not enable parent committees when admin committees is off", () => {
    const merged = mergeFeatures({
      admin: { committees: false },
      parent: {},
    });

    assert.equal(merged.parent.committees, false);
  });
});
