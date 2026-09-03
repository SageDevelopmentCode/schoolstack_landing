import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  listProgramsWithoutEnrollmentChecklist,
  publicEnrollmentChecklistPath,
  schoolAdminEnrollmentChecklistPreviewPath,
  type EnrollmentChecklistTemplate,
} from "./enrollment-checklist-templates";

function checklist(
  overrides: Partial<EnrollmentChecklistTemplate> = {},
): EnrollmentChecklistTemplate {
  return {
    id: "checklist-1",
    organizationId: "org-1",
    programId: "program-1",
    name: "School Year 2026–27 enrollment",
    enrollmentPath: "enrollment",
    status: "published",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("listProgramsWithoutEnrollmentChecklist", () => {
  it("returns only programs without an active enrollment checklist", () => {
    const programs = [
      { id: "p1", name: "School Year 2026–27" },
      { id: "p2", name: "Kindergarten Co-op" },
    ];
    const checklists = [checklist({ programId: "p1" })];

    assert.deepEqual(listProgramsWithoutEnrollmentChecklist(programs, checklists), [
      { id: "p2", name: "Kindergarten Co-op" },
    ]);
  });

  it("ignores archived checklists when checking coverage", () => {
    const programs = [{ id: "p2", name: "Kindergarten Co-op" }];
    const checklists = [
      checklist({
        programId: "p2",
        status: "archived",
      }),
    ];

    assert.deepEqual(listProgramsWithoutEnrollmentChecklist(programs, checklists), programs);
  });
});

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
