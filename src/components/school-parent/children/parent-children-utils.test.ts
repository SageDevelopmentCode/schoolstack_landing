import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import {
  filterFamilyChildrenForProgramPortal,
  programPortalChildrenEmptyMessage,
} from "./parent-children-utils";

const COOP_PROGRAM_ID = "0e4d91d2-9f42-41d5-9b6f-a651cb46bd78";
const SCHOOL_YEAR_PROGRAM_ID = "school-year-program-id";

function child(
  name: string,
  programIds: string[],
): FamilyChildOverview {
  return {
    applicationId: `${name}-app`,
    studentId: `${name}-student`,
    studentName: name,
    profilePhotoUrl: null,
    grade: "K",
    status: "enrolled",
    statusLabel: "Enrolled",
    isEnrolled: true,
    checklistProgress: null,
    enrolledPrograms: programIds.map((programId) => ({
      programId,
      programName: programId === COOP_PROGRAM_ID ? "Kindergarten Co-op" : "School Year 2026–27",
      portalSlug: programId === COOP_PROGRAM_ID ? "kindergarten-co-op" : null,
      isIsolatedPortal: programId === COOP_PROGRAM_ID,
      portalLabel: programId === COOP_PROGRAM_ID ? "Kindergarten Co-op" : "School Year 2026–27",
    })),
  };
}

describe("filterFamilyChildrenForProgramPortal", () => {
  it("returns only children enrolled in the requested program", () => {
    const children = [
      child("Julia Cecilia", [COOP_PROGRAM_ID, SCHOOL_YEAR_PROGRAM_ID]),
      child("Other Child", [SCHOOL_YEAR_PROGRAM_ID]),
    ];

    const filtered = filterFamilyChildrenForProgramPortal(children, COOP_PROGRAM_ID);

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.studentName, "Julia Cecilia");
  });

  it("returns all children when program id is blank", () => {
    const children = [child("Julia Cecilia", [COOP_PROGRAM_ID])];

    assert.deepEqual(filterFamilyChildrenForProgramPortal(children, "  "), children);
  });

  it("returns an empty list when no child matches the program", () => {
    const children = [child("Other Child", [SCHOOL_YEAR_PROGRAM_ID])];

    assert.deepEqual(
      filterFamilyChildrenForProgramPortal(children, COOP_PROGRAM_ID),
      [],
    );
  });
});

describe("programPortalChildrenEmptyMessage", () => {
  it("includes the portal label", () => {
    assert.equal(
      programPortalChildrenEmptyMessage("Kindergarten Co-op"),
      "No learners enrolled in Kindergarten Co-op yet.",
    );
  });
});
