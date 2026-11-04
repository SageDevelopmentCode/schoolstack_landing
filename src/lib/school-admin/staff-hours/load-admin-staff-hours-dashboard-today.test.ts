import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAdminDashboardStaffHoursToday,
  DASHBOARD_STAFF_HOURS_COMPLETED_CAP,
  formatDashboardStaffHoursSummaryLine,
} from "./load-admin-staff-hours-dashboard-today";
import type { AdminStaffHoursSessionRow } from "./staff-hours-types";

describe("formatDashboardStaffHoursSummaryLine", () => {
  it("joins clocked in, sessions, and total hours", () => {
    assert.equal(
      formatDashboardStaffHoursSummaryLine({
        clockedInCount: 2,
        completedSessionCount: 4,
        totalHoursLabel: "6h 45m",
      }),
      "2 clocked in · 4 sessions done · 6h 45m logged today",
    );
  });

  it("uses singular session label", () => {
    assert.equal(
      formatDashboardStaffHoursSummaryLine({
        clockedInCount: 0,
        completedSessionCount: 1,
        totalHoursLabel: "1h",
      }),
      "0 clocked in · 1 session done · 1h logged today",
    );
  });
});

describe("buildAdminDashboardStaffHoursToday", () => {
  const now = new Date("2026-11-03T18:30:00.000Z");

  it("sums closed and open minutes and caps completed rows", () => {
    const closed: AdminStaffHoursSessionRow[] = Array.from(
      { length: DASHBOARD_STAFF_HOURS_COMPLETED_CAP + 2 },
      (_, index) => ({
        id: `closed-${index}`,
        staffMemberId: "s1",
        staffName: "Ada Lovelace",
        workDate: "2026-11-03",
        clockInAt: `2026-11-03T${10 + index}:00:00.000Z`,
        clockOutAt: `2026-11-03T${11 + index}:00:00.000Z`,
        minutes: 60,
        clockInLabel: "10:00 AM",
        clockOutLabel: "11:00 AM",
      }),
    );

    const result = buildAdminDashboardStaffHoursToday({
      referenceDateKey: "2026-11-03",
      now,
      liveRows: [
        {
          staffMemberId: "s2",
          staffName: "Grace Hopper",
          clockInAt: "2026-11-03T17:00:00.000Z",
          clockInLabel: "10:00 AM",
        },
      ],
      todayClosedSessions: closed,
    });

    assert.equal(result.clockedInCount, 1);
    assert.equal(result.completedSessionCount, closed.length);
    assert.equal(result.completedToday.length, DASHBOARD_STAFF_HOURS_COMPLETED_CAP);
    assert.equal(result.hiddenCompletedCount, 2);
    assert.equal(result.totalMinutesToday, closed.length * 60 + 90);
    assert.match(result.summaryLine, /1 clocked in/);
  });

  it("returns empty-state friendly counts", () => {
    const result = buildAdminDashboardStaffHoursToday({
      referenceDateKey: "2026-11-03",
      now,
      liveRows: [],
      todayClosedSessions: [],
    });

    assert.equal(result.summaryLine, "0 clocked in · 0 sessions done · 0m logged today");
    assert.equal(result.clockedIn.length, 0);
    assert.equal(result.completedToday.length, 0);
    assert.equal(result.hiddenCompletedCount, 0);
  });
});
