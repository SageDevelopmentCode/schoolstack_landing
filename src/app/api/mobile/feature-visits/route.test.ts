import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isExcludedMobileFeatureVisitKey,
  normalizeMobileFeatureKey,
  shouldRecordMobileFeatureVisit,
} from "@/lib/mobile-feature-visit-policy";

describe("normalizeMobileFeatureKey", () => {
  it("accepts non-empty keys", () => {
    assert.equal(normalizeMobileFeatureKey("billing"), "billing");
  });

  it("rejects empty keys", () => {
    assert.equal(normalizeMobileFeatureKey(""), null);
    assert.equal(normalizeMobileFeatureKey("   "), null);
  });
});

describe("isExcludedMobileFeatureVisitKey", () => {
  it("excludes parent/teacher landing keys", () => {
    assert.equal(isExcludedMobileFeatureVisitKey("home"), true);
    assert.equal(isExcludedMobileFeatureVisitKey("portal"), true);
  });

  it("allows real features", () => {
    assert.equal(isExcludedMobileFeatureVisitKey("billing"), false);
  });
});

describe("shouldRecordMobileFeatureVisit", () => {
  it("records school portal actors", () => {
    assert.equal(
      shouldRecordMobileFeatureVisit({
        isPreview: false,
        actorType: "parent",
      }),
      true,
    );
  });

  it("skips platform admin actors", () => {
    assert.equal(
      shouldRecordMobileFeatureVisit({
        isPreview: false,
        actorType: "platform_admin",
      }),
      false,
    );
  });

  it("skips preview sessions", () => {
    assert.equal(
      shouldRecordMobileFeatureVisit({
        isPreview: true,
        actorType: "parent",
      }),
      false,
    );
  });
});
