import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEMO_ROUTES } from "../demo-routes";
import { getStepGuide } from "./step-guides";

const MAX_LINE = 80;

describe("demo step guides", () => {
  for (const [route, demo] of Object.entries(DEMO_ROUTES)) {
    it(`${route}: every step but contact has a short guide`, () => {
      const labels = { navCta: demo.config.hero.navCta, submitLabel: demo.config.form.submitLabel };
      for (const step of demo.steps) {
        const guide = getStepGuide(step, labels);
        if (step.preview === "contact") {
          assert.equal(guide, null, `${step.id}: contact step should have no guide`);
          continue;
        }
        assert.ok(guide, `${step.id}: missing a guide`);
        assert.ok(guide.what.length <= MAX_LINE, `${step.id}: "what" is too long: ${guide.what}`);
        if (guide.tryThis) {
          assert.ok(guide.tryThis.length <= MAX_LINE, `${step.id}: "try" is too long: ${guide.tryThis}`);
        }
      }
    });
  }

  it("returns null for unknown steps", () => {
    const labels = { navCta: "Book a tour", submitLabel: "Send" };
    assert.equal(getStepGuide({ id: "constructor", title: "", description: "", icon: "globe", preview: "admin" }, labels), null);
    assert.equal(getStepGuide(undefined, labels), null);
  });
});
