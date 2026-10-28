import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mobileFeatureKeyFromActivityRow,
  mobileFeatureLabel,
} from "./mobile-feature-analytics";

describe("mobileFeatureKeyFromActivityRow", () => {
  it("reads featureKey from metadata", () => {
    assert.equal(
      mobileFeatureKeyFromActivityRow({
        entity_id: null,
        metadata: { featureKey: "billing" },
      }),
      "billing",
    );
  });

  it("falls back to non-uuid entity_id", () => {
    assert.equal(
      mobileFeatureKeyFromActivityRow({
        entity_id: "messages",
        metadata: {},
      }),
      "messages",
    );
  });

  it("ignores uuid entity_id without metadata", () => {
    assert.equal(
      mobileFeatureKeyFromActivityRow({
        entity_id: "1085332b-aef4-4910-a35d-ccb2611d9b11",
        metadata: {},
      }),
      null,
    );
  });
});

describe("mobileFeatureLabel", () => {
  it("maps known keys", () => {
    assert.equal(mobileFeatureLabel("billing"), "Billing / tuition");
    assert.equal(mobileFeatureLabel("home"), "Home");
  });

  it("title-cases unknown keys", () => {
    assert.equal(mobileFeatureLabel("custom_feature"), "Custom Feature");
  });
});
