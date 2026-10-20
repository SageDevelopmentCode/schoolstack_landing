import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_SCHOOL_PROFILE_PHOTOS } from "./constants";
import { buildSchoolProfilePhotoStoragePath } from "./storage";
import {
  assertCanAddSchoolProfilePhotos,
  SchoolProfilePhotoError,
} from "./photos";
import {
  getDefaultFeatureChildren,
  mergePortalFeatureNav,
} from "@/lib/organization-settings/feature-nav";

describe("school profile photos storage", () => {
  it("builds school-profile storage paths", () => {
    const path = buildSchoolProfilePhotoStoragePath(
      "org-1",
      "photo-1",
      "campus/hall.jpg",
    );
    assert.equal(path, "org-1/school-profile/photo-1/campus_hall.jpg");
  });
});

describe("school profile photos limits", () => {
  it("allows uploads within the max", () => {
    assertCanAddSchoolProfilePhotos(3, 2);
  });

  it("rejects uploads over the max", () => {
    assert.throws(
      () => assertCanAddSchoolProfilePhotos(4, 2),
      (error: unknown) => {
        assert.ok(error instanceof SchoolProfilePhotoError);
        assert.equal(error.code, "max_photos");
        return true;
      },
    );
  });

  it("defines max of 5", () => {
    assert.equal(MAX_SCHOOL_PROFILE_PHOTOS, 5);
  });
});

describe("school photos nav defaults", () => {
  it("includes school_photos after school_profile", () => {
    const children = getDefaultFeatureChildren("my_school");
    const keys = children.map((child) => child.key);
    assert.equal(keys[0], "school_profile");
    assert.equal(keys[1], "school_photos");
  });

  it("merges school_photos into stored nav that predates the tab", () => {
    const merged = mergePortalFeatureNav("admin", {
      groups: ["Main"],
      items: {
        my_school: {
          group: "Main",
          icon: "school",
          children: [{ key: "students", label: "My Students", icon: "users" }],
        },
      },
      order: ["my_school"],
    });
    const keys =
      merged.items.my_school?.children?.map((child) => child.key) ?? [];
    assert.ok(keys.includes("school_photos"));
    assert.ok(keys.includes("school_profile"));
  });
});
