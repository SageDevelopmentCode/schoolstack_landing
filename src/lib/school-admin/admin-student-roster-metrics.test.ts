import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deriveStudentRosterMetrics,
  filterStudentsByRosterFilter,
  isRecentEnrollment,
  isStudentUnassigned,
  matchesStudentSearch,
} from "./admin-student-roster-metrics";
import type { AdminEnrolledStudentSummary } from "./enrolled-students";

function student(
  overrides: Partial<AdminEnrolledStudentSummary> = {},
): AdminEnrolledStudentSummary {
  return {
    id: "student-1",
    firstName: "Arrow",
    lastName: "Calvert",
    grade: "1",
    dateOfBirth: "2019-10-23",
    status: "active",
    familyId: "family-1",
    familyName: "Calvert Family",
    primaryContactName: "Hayley Calvert",
    primaryContactEmail: "parent@example.com",
    programNames: ["School Year 2026–27"],
    classroomNames: ["Meadow Room"],
    enrolledAt: "2026-08-01T00:00:00.000Z",
    assignedTeachers: [],
    assignedTeacherNames: "",
    profilePhotoUrl: null,
    ...overrides,
    hasStandingHealthItems: overrides.hasStandingHealthItems ?? false,
  };
}

describe("admin-student-roster-metrics", () => {
  it("derives roster metrics", () => {
    const nowMs = Date.parse("2026-08-15T00:00:00.000Z");
    const metrics = deriveStudentRosterMetrics(
      [
        student(),
        student({
          id: "student-2",
          assignedTeachers: [{ id: "staff-1", name: "Teacher One" }],
          assignedTeacherNames: "Teacher One",
          programNames: ["Summer Program"],
        }),
      ],
      nowMs,
    );

    assert.equal(metrics.totalCount, 2);
    assert.equal(metrics.unassignedCount, 1);
    assert.equal(metrics.programCount, 2);
    assert.equal(metrics.newEnrollmentCount, 2);
    assert.deepEqual(metrics.programOptions, [
      ["School Year 2026–27", "School Year 2026–27"],
      ["Summer Program", "Summer Program"],
    ]);
  });

  it("filters unassigned and program rows", () => {
    const rows = [
      student(),
      student({
        id: "student-2",
        assignedTeachers: [{ id: "staff-1", name: "Teacher One" }],
        programNames: ["Summer Program"],
      }),
    ];

    assert.equal(filterStudentsByRosterFilter(rows, "unassigned").length, 1);
    assert.equal(
      filterStudentsByRosterFilter(rows, "Summer Program").length,
      1,
    );
  });

  it("detects recent enrollments within 30 days", () => {
    const nowMs = Date.parse("2026-08-15T00:00:00.000Z");
    assert.equal(isRecentEnrollment("2026-08-01T00:00:00.000Z", nowMs), true);
    assert.equal(isRecentEnrollment("2026-06-01T00:00:00.000Z", nowMs), false);
  });

  it("matches search across family and classroom fields", () => {
    const row = student();
    assert.equal(
      matchesStudentSearch(
        row,
        "meadow room",
        () => "1st Grade",
        () => "Arrow Calvert",
      ),
      true,
    );
    assert.equal(
      matchesStudentSearch(
        row,
        "missing",
        () => "1st Grade",
        () => "Arrow Calvert",
      ),
      false,
    );
  });

  it("identifies unassigned students", () => {
    assert.equal(isStudentUnassigned(student()), true);
    assert.equal(
      isStudentUnassigned(
        student({ assignedTeachers: [{ id: "staff-1", name: "Teacher One" }] }),
      ),
      false,
    );
  });
});
