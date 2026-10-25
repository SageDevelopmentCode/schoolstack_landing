import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mobileFeatureLabel } from "./mobile-feature-analytics";

describe("mobileFeatureLabel", () => {
  it("maps known keys", () => {
    assert.equal(mobileFeatureLabel("billing"), "Billing / tuition");
    assert.equal(mobileFeatureLabel("home"), "Home");
  });

  it("title-cases unknown keys", () => {
    assert.equal(mobileFeatureLabel("custom_feature"), "Custom Feature");
  });
});
