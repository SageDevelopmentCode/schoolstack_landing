import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  AttendanceRosterStudent,
  AttendanceRosterSummary,
} from "@/lib/school-admin/attendance/attendance-types";
import {
  formatTeacherDashboardAttendanceSubcopy,
  recomputeAttendanceSummary,
  shouldShowTeacherDashboardAttendanceSection,
} from "./teacher-dashboard-attendance";

function makeSummary(
  overrides: Partial<AttendanceRosterSummary> = {},
): AttendanceRosterSummary {
  return {
    totalStudents: 12,
    presentCount: 8,
    absentCount: 1,
    pickedUpCount: 2,
    notMarkedCount: 1,
    ...overrides,
  };
}

describe("formatTeacherDashboardAttendanceSubcopy", () => {
  it("formats present count against total students", () => {
    assert.equal(
      formatTeacherDashboardAttendanceSubcopy(makeSummary()),
      "10 of 12 students present",
    );
  });

  it("uses singular student label for one learner", () => {
    assert.equal(
      formatTeacherDashboardAttendanceSubcopy(
        makeSummary({
          totalStudents: 1,
          presentCount: 1,
          absentCount: 0,
          pickedUpCount: 0,
          notMarkedCount: 0,
        }),
      ),
      "1 of 1 student present",
    );
  });

  it("handles empty roster copy", () => {
    assert.equal(
      formatTeacherDashboardAttendanceSubcopy(
        makeSummary({
          totalStudents: 0,
          presentCount: 0,
          absentCount: 0,
          pickedUpCount: 0,
          notMarkedCount: 0,
        }),
      ),
      "No attendance-enabled students on today's roster.",
    );
  });
});

function makeStudent(
  overrides: Partial<AttendanceRosterStudent> & { id: string },
): AttendanceRosterStudent {
  return {
    firstName: "Ada",
    lastName: "Lovelace",
    grade: "3",
    profilePhotoUrl: null,
    familyId: "family-1",
    familyName: "Lovelace",
    programNames: ["Lower School"],
    classroomNames: ["Room 3"],
    attendanceStatus: "not_marked",
    presentAt: null,
    absentAt: null,
    pickedUpAt: null,
    pickedUpByGuardianId: null,
    pickedUpByAuthorizedContactId: null,
    pickedUpByName: null,
    ...overrides,
  };
}

describe("recomputeAttendanceSummary", () => {
  it("counts each attendance status from the student list", () => {
    const students = [
      makeStudent({ id: "1", attendanceStatus: "present" }),
      makeStudent({ id: "2", attendanceStatus: "present" }),
      makeStudent({ id: "3", attendanceStatus: "absent" }),
      makeStudent({ id: "4", attendanceStatus: "picked_up" }),
      makeStudent({ id: "5", attendanceStatus: "not_marked" }),
    ];

    assert.deepEqual(recomputeAttendanceSummary(students), {
      totalStudents: 5,
      presentCount: 2,
      absentCount: 1,
      pickedUpCount: 1,
      notMarkedCount: 1,
    });
  });

  it("updates counts after a status change", () => {
    const students = [
      makeStudent({ id: "1", attendanceStatus: "not_marked" }),
      makeStudent({ id: "2", attendanceStatus: "present" }),
    ];

    const updated = students.map((student) =>
      student.id === "1"
        ? { ...student, attendanceStatus: "present" as const }
        : student,
    );

    assert.deepEqual(recomputeAttendanceSummary(updated), {
      totalStudents: 2,
      presentCount: 2,
      absentCount: 0,
      pickedUpCount: 0,
      notMarkedCount: 0,
    });
  });
});

describe("shouldShowTeacherDashboardAttendanceSection", () => {
  it("shows when attendance is enabled and summary loaded", () => {
    assert.equal(
      shouldShowTeacherDashboardAttendanceSection(true, {
        date: "2026-09-20",
        summary: makeSummary(),
        students: [],
      }),
      true,
    );
  });

  it("hides when attendance feature is disabled", () => {
    assert.equal(
      shouldShowTeacherDashboardAttendanceSection(false, {
        date: "2026-09-20",
        summary: makeSummary(),
        students: [],
      }),
      false,
    );
  });

  it("hides when roster failed to load", () => {
    assert.equal(shouldShowTeacherDashboardAttendanceSection(true, null), false);
  });
});
