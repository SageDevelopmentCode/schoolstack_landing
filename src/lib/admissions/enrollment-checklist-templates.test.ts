import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  publicEnrollmentChecklistPath,
  schoolAdminEnrollmentChecklistPreviewPath,
} from "./enrollment-checklist-templates";

describe("schoolAdminEnrollmentChecklistPreviewPath", () => {
  it("builds the base preview path", () => {
    assert.equal(
      schoolAdminEnrollmentChecklistPreviewPath("rooted-meadows", "abc-123"),
      "/school/rooted-meadows/admin/enrollment-checklist-preview/abc-123",
    );
  });

  it("appends item query param when provided", () => {
    assert.equal(
      schoolAdminEnrollmentChecklistPreviewPath("rooted-meadows", "abc-123", {
        itemId: "item/1",
      }),
      "/school/rooted-meadows/admin/enrollment-checklist-preview/abc-123?item=item%2F1",
    );
  });
});

describe("publicEnrollmentChecklistPath", () => {
  it("builds the public enrollment path", () => {
    assert.equal(
      publicEnrollmentChecklistPath("rooted-meadows"),
      "/school/rooted-meadows/forms/enrollment",
    );
  });
});
