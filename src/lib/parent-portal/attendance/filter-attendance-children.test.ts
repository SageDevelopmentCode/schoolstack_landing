import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import { filterAttendanceChildren } from "./filter-attendance-children";

const ATTENDANCE_PROGRAM_ID = "attendance-program";
const OTHER_PROGRAM_ID = "other-program";

function child(
  overrides: Partial<FamilyChildOverview> & { applicationId: string },
): FamilyChildOverview {
  return {
    applicationId: overrides.applicationId,
    studentId:
      overrides.studentId !== undefined
        ? overrides.studentId
        : `${overrides.applicationId}-student`,
    studentName: overrides.studentName ?? "Test Child",
    profilePhotoUrl: overrides.profilePhotoUrl ?? null,
    grade: overrides.grade ?? "1st Grade",
    status: overrides.status ?? "enrolled",
    statusLabel: overrides.statusLabel ?? "Enrolled",
    isEnrolled: overrides.isEnrolled ?? true,
    checklistProgress: overrides.checklistProgress ?? null,
    enrolledPrograms: overrides.enrolledPrograms ?? [
      {
        programId: ATTENDANCE_PROGRAM_ID,
        programName: "School Year",
        portalSlug: null,
        isIsolatedPortal: false,
        portalLabel: "School Year",
      },
    ],
  };
}

describe("filterAttendanceChildren", () => {
  const programAttendanceEnabled = new Map<string, boolean>([
    [ATTENDANCE_PROGRAM_ID, true],
    [OTHER_PROGRAM_ID, false],
  ]);

  it("returns enrolled children in attendance-enabled programs", () => {
    const children = [
      child({ applicationId: "app-1" }),
      child({
        applicationId: "app-2",
        enrolledPrograms: [
          {
            programId: OTHER_PROGRAM_ID,
            programName: "Other",
            portalSlug: null,
            isIsolatedPortal: false,
            portalLabel: "Other",
          },
        ],
      }),
    ];

    const filtered = filterAttendanceChildren(children, programAttendanceEnabled);

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.applicationId, "app-1");
  });

  it("excludes children without a student id", () => {
    const children = [child({ applicationId: "app-1", studentId: null })];

    assert.deepEqual(filterAttendanceChildren(children, programAttendanceEnabled), []);
  });

  it("excludes children who are not enrolled", () => {
    const children = [child({ applicationId: "app-1", isEnrolled: false })];

    assert.deepEqual(filterAttendanceChildren(children, programAttendanceEnabled), []);
  });
});
