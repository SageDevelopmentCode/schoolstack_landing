import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canManageGalleryPhoto } from "@/lib/school-gallery/gallery-access";

describe("canManageGalleryPhoto", () => {
  const photo = { uploadedBy: "teacher-user-id" };

  it("allows org admins to manage any photo", () => {
    assert.equal(
      canManageGalleryPhoto({
        isOrgAdmin: true,
        userId: "other-user",
        photo,
      }),
      true,
    );
  });

  it("allows teachers to manage only their own uploads", () => {
    assert.equal(
      canManageGalleryPhoto({
        isOrgAdmin: false,
        userId: "teacher-user-id",
        photo,
      }),
      true,
    );
    assert.equal(
      canManageGalleryPhoto({
        isOrgAdmin: false,
        userId: "another-teacher",
        photo,
      }),
      false,
    );
  });
});
