import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validatePublishInput } from "./publish-parent-form-core";
import type { PublishTeacherParentFormInput } from "./types";
import { formatAudienceLabel } from "./utils";

function baseInput(
  overrides: Partial<PublishTeacherParentFormInput> = {},
): PublishTeacherParentFormInput {
  return {
    title: "Field trip form",
    description: "",
    formType: "upload",
    audienceType: "classrooms",
    classroomIds: ["classroom-1"],
    familyIds: [],
    dueDate: null,
    requireSignature: true,
    uploadFormat: "pdf",
    uploadFileName: "trip.pdf",
    uploadFileSize: "1024",
    fields: [],
    status: "draft",
    ...overrides,
  };
}

describe("validatePublishInput", () => {
  it("allows unassigned drafts without audience", () => {
    validatePublishInput(
      baseInput({
        audienceType: "unassigned",
        classroomIds: [],
        status: "draft",
      }),
    );
  });

  it("requires classrooms when audience type is classrooms", () => {
    assert.throws(
      () =>
        validatePublishInput(
          baseInput({
            audienceType: "classrooms",
            classroomIds: [],
            status: "draft",
          }),
        ),
      /Select at least one classroom/,
    );
  });

  it("requires families when audience type is families", () => {
    assert.throws(
      () =>
        validatePublishInput(
          baseInput({
            audienceType: "families",
            classroomIds: [],
            familyIds: [],
            status: "draft",
          }),
        ),
      /Select at least one family/,
    );
  });

  it("rejects active forms without audience", () => {
    assert.throws(
      () =>
        validatePublishInput(
          baseInput({
            audienceType: "unassigned",
            classroomIds: [],
            status: "active",
          }),
        ),
      /Choose who should receive this form/,
    );
  });
});

describe("formatAudienceLabel", () => {
  it("shows saved for later for unassigned forms", () => {
    const label = formatAudienceLabel({
      id: "form-1",
      title: "Trip",
      description: "",
      formType: "upload",
      status: "draft",
      audienceType: "unassigned",
      classroomIds: [],
      classroomNames: [],
      familyIds: [],
      familyNames: [],
      dueDate: null,
      requireSignature: true,
      totalFamilies: 0,
      signedFamilies: 0,
      createdAt: "2026-09-16T00:00:00.000Z",
      updatedAt: "2026-09-16T00:00:00.000Z",
    });

    assert.equal(label, "Saved for later");
  });
});
