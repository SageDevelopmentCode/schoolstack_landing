import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collectFridayBranchFlyerPaths,
  diffRemovedFridayBranchFlyerPaths,
} from "./friday-branch-flyer-paths";
import { createEmptyBlock } from "./friday-branch-mock";

describe("friday-branch-flyer-paths", () => {
  it("collects flyer storage paths from blocks", () => {
    const block = createEmptyBlock(1);
    block.slots[0].classes[0].flyerStoragePath = "org/classes/a/flyer.pdf";
    block.slots[0].classes.push({
      id: "class-b",
      name: "Music",
      location: "",
      ageGroup: "",
      teacher: "",
      familyVisible: true,
      flyerStoragePath: "org/classes/b/flyer.pdf",
    });

    const paths = collectFridayBranchFlyerPaths([block]);

    assert.equal(paths.size, 2);
    assert.ok(paths.has("org/classes/a/flyer.pdf"));
    assert.ok(paths.has("org/classes/b/flyer.pdf"));
  });

  it("diffs removed flyer paths between saved and next blocks", () => {
    const before = createEmptyBlock(1);
    before.slots[0].classes[0].flyerStoragePath = "org/classes/a/flyer.pdf";

    const after = createEmptyBlock(1);
    after.slots[0].classes[0].flyerStoragePath = null;

    const removed = diffRemovedFridayBranchFlyerPaths([before], [after]);

    assert.deepEqual(removed, ["org/classes/a/flyer.pdf"]);
  });
});
