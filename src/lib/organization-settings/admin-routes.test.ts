import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "./catalog";
import { isAdminNavPathEnabled } from "./admin-routes";

describe("isAdminNavPathEnabled", () => {
  it("allows cross-feature subtabs linked from communication nav", () => {
    assert.equal(
      isAdminNavPathEnabled(DEFAULT_FEATURES, "my_school", "newsletters"),
      true,
    );
  });

  it("still allows direct my_school subtabs", () => {
    assert.equal(
      isAdminNavPathEnabled(DEFAULT_FEATURES, "my_school", "students"),
      true,
    );
  });

  it("blocks cross-feature subtabs when the owning nav feature is disabled", () => {
    const features = {
      ...DEFAULT_FEATURES,
      admin: {
        ...DEFAULT_FEATURES.admin,
        communication: false,
      },
    };
    assert.equal(
      isAdminNavPathEnabled(features, "my_school", "newsletters"),
      false,
    );
  });
});
