import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_SCHOOL_PROFILE_PHOTOS } from "./constants";
import { buildSchoolProfilePhotoStoragePath } from "./storage";
import {
  assertCanAddSchoolProfilePhotos,
  SchoolProfilePhotoError,
} from "./photos";
import { SCHOOL_PROFILE_SECTIONS } from "@/components/school-admin/school-profile/school-profile-sections";

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

describe("school profile photos section", () => {
  it("includes photos in school profile pill sections", () => {
    const ids = SCHOOL_PROFILE_SECTIONS.map((section) => section.id);
    assert.ok(ids.includes("photos"));
    assert.equal(ids[ids.length - 1], "photos");
  });
});
