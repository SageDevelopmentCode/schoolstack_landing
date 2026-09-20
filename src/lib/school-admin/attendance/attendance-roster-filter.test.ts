import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterStudentsForAttendanceRoster,
  studentHasAttendanceEnabledEnrollment,
} from "./attendance-roster-filter";

describe("attendance roster filter", () => {
  const programAttendanceEnabled = new Map<string, boolean>([
    ["main-program", true],
    ["kindergarten-co-op", false],
  ]);

  it("includes students with at least one attendance-enabled enrollment", () => {
    const students = [
      {
        studentId: "student-1",
        enrollments: [
          { programId: "kindergarten-co-op", status: "enrolled" },
          { programId: "main-program", status: "enrolled" },
        ],
      },
      {
        studentId: "student-2",
        enrollments: [{ programId: "kindergarten-co-op", status: "enrolled" }],
      },
    ];

    const filtered = filterStudentsForAttendanceRoster(
      students,
      programAttendanceEnabled,
    );

    assert.deepEqual(filtered.map((student) => student.studentId), ["student-1"]);
  });

  it("excludes students with only attendance-disabled enrollments", () => {
    assert.equal(
      studentHasAttendanceEnabledEnrollment(
        [{ programId: "kindergarten-co-op", status: "enrolled" }],
        programAttendanceEnabled,
      ),
      false,
    );
  });
});
