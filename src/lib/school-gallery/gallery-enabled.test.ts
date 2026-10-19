import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import { isSchoolGalleryEnabled } from "./gallery-enabled";

describe("isSchoolGalleryEnabled", () => {
  it("is true when admin photos feature is enabled", () => {
    assert.equal(isSchoolGalleryEnabled(DEFAULT_FEATURES), true);
  });

  it("is false when admin photos is disabled", () => {
    assert.equal(
      isSchoolGalleryEnabled({
        ...DEFAULT_FEATURES,
        admin: { ...DEFAULT_FEATURES.admin, photos: false },
      }),
      false,
    );
  });
});
