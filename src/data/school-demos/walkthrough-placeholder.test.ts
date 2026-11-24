import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as walkthroughs from "./walkthrough-placeholder";
import type { DemoWalkthroughStep } from "./walkthrough-placeholder";

const entries = Object.entries(walkthroughs).filter(
  (entry): entry is [string, DemoWalkthroughStep[]] =>
    entry[0].endsWith("WalkthroughPlaceholder") && Array.isArray(entry[1]),
);

describe("demo walkthroughs", () => {
  it("exports walkthroughs to check", () => {
    assert.ok(entries.length > 40, `expected every demo walkthrough, found ${entries.length}`);
  });

  for (const [name, steps] of entries) {
    it(`${name} shows the mobile app step right before the contact step`, () => {
      const mobile = steps.filter((step) => step.preview === "mobile");
      assert.equal(mobile.length, 1, "needs exactly one createMobileAppWalkthroughStep()");

      const mobileIndex = steps.indexOf(mobile[0]);
      const contactIndex = steps.findIndex((step) => step.preview === "contact");
      assert.equal(contactIndex, steps.length - 1, "contact should be the last step");
      assert.equal(mobileIndex, contactIndex - 1, "mobile step should sit just before contact");
    });

    it(`${name} has unique step ids`, () => {
      const ids = steps.map((step) => step.id);
      assert.equal(new Set(ids).size, ids.length, `duplicate ids: ${ids.join(", ")}`);
    });
  }
});
