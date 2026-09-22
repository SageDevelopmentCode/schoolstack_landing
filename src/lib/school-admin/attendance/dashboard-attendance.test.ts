import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AttendanceRosterSummary } from "@/lib/school-admin/attendance/attendance-types";
import {
  formatDashboardAttendanceSubcopy,
  shouldShowDashboardAttendanceSnapshot,
} from "./dashboard-attendance";

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

describe("formatDashboardAttendanceSubcopy", () => {
  it("formats present count against total students", () => {
    assert.equal(
      formatDashboardAttendanceSubcopy(makeSummary()),
      "10 of 12 students present",
    );
  });

  it("uses singular student label for one learner", () => {
    assert.equal(
      formatDashboardAttendanceSubcopy(
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
      formatDashboardAttendanceSubcopy(
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

describe("shouldShowDashboardAttendanceSnapshot", () => {
  it("shows when my school is enabled and summary loaded", () => {
    assert.equal(
      shouldShowDashboardAttendanceSnapshot(true, {
        date: "2026-09-20",
        summary: makeSummary(),
        students: [],
      }),
      true,
    );
  });

  it("hides when my school is disabled", () => {
    assert.equal(
      shouldShowDashboardAttendanceSnapshot(false, {
        date: "2026-09-20",
        summary: makeSummary(),
        students: [],
      }),
      false,
    );
  });

  it("hides when roster failed to load", () => {
    assert.equal(shouldShowDashboardAttendanceSnapshot(true, null), false);
  });
});
