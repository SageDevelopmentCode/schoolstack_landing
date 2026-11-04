import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildAdminStaffHoursSummaryRows,
  loadStaffWorkTimeEntriesInRange,
} from "./load-admin-staff-hours-summary";
import type { StaffWorkTimeEntryRow } from "@/lib/school-teacher/my-hours/my-hours-db-types";
import type {
  StaffEmploymentStatus,
  StaffMemberRecord,
} from "@/lib/staff/staff-members";
import { POSTGREST_DEFAULT_MAX_ROWS } from "@/lib/supabase/fetch-all-rows";

function entry(
  partial: Partial<StaffWorkTimeEntryRow> & Pick<StaffWorkTimeEntryRow, "staff_member_id" | "work_date" | "clock_in_at">,
): StaffWorkTimeEntryRow {
  return {
    id: partial.id ?? "entry-1",
    organization_id: partial.organization_id ?? "org-1",
    staff_member_id: partial.staff_member_id,
    work_date: partial.work_date,
    clock_in_at: partial.clock_in_at,
    clock_out_at:
      partial.clock_out_at !== undefined
        ? partial.clock_out_at
        : "2026-11-03T16:00:00.000Z",
    recorded_by_user_id: partial.recorded_by_user_id ?? "user-1",
  };
}

function member(
  id: string,
  first: string,
  last: string,
  employmentStatus: StaffEmploymentStatus = "active",
): StaffMemberRecord {
  return {
    id,
    organizationId: "org-1",
    userId: null,
    firstName: first,
    lastName: last,
    email: null,
    roleTitle: "Guide",
    employmentStatus,
    portalRole: "teacher",
    membershipStatus: "active",
    isLinked: false,
    profilePhotoUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("buildAdminStaffHoursSummaryRows", () => {
  it("aggregates minutes per active staff and includes zero-hour rows", () => {
    const members = [member("s1", "Ada", "Lovelace"), member("s2", "Grace", "Hopper")];
    const rows = [
      entry({
        id: "e1",
        staff_member_id: "s1",
        work_date: "2026-11-03",
        clock_in_at: "2026-11-03T14:00:00.000Z",
        clock_out_at: "2026-11-03T15:00:00.000Z",
      }),
      entry({
        id: "e2",
        staff_member_id: "s1",
        work_date: "2026-11-04",
        clock_in_at: "2026-11-04T14:00:00.000Z",
        clock_out_at: "2026-11-04T16:00:00.000Z",
      }),
    ];

    const { summaryRows } = buildAdminStaffHoursSummaryRows(rows, members, {
      from: "2026-11-03",
      to: "2026-11-04",
      timezone: "America/Denver",
    });

    assert.equal(summaryRows.length, 2);
    const ada = summaryRows.find((row) => row.staffMemberId === "s1");
    const grace = summaryRows.find((row) => row.staffMemberId === "s2");
    assert.equal(ada?.totalMinutes, 180);
    assert.equal(ada?.sessionCount, 2);
    assert.equal(ada?.daysWorked, 2);
    assert.equal(grace?.totalMinutes, 0);
  });

  it("counts open sessions to now", () => {
    const now = new Date("2026-11-03T17:00:00.000Z");
    const members = [member("s1", "Ada", "Lovelace")];
    const rows = [
      entry({
        id: "e1",
        staff_member_id: "s1",
        work_date: "2026-11-03",
        clock_in_at: "2026-11-03T16:30:00.000Z",
        clock_out_at: null,
      }),
    ];

    const { summaryRows } = buildAdminStaffHoursSummaryRows(rows, members, {
      from: "2026-11-03",
      to: "2026-11-03",
      timezone: "America/Denver",
      now,
    });

    assert.equal(summaryRows[0]?.totalMinutes, 30);
  });

  it("includes inactive staff who logged hours and omits inactive staff with zero hours", () => {
    const members = [
      member("s1", "Ada", "Lovelace"),
      member("s2", "Grace", "Hopper", "inactive"),
    ];
    const rows = [
      entry({
        id: "e1",
        staff_member_id: "s2",
        work_date: "2026-11-03",
        clock_in_at: "2026-11-03T14:00:00.000Z",
        clock_out_at: "2026-11-03T15:00:00.000Z",
      }),
    ];

    const { summaryRows } = buildAdminStaffHoursSummaryRows(rows, members, {
      from: "2026-11-03",
      to: "2026-11-03",
      timezone: "America/Denver",
    });

    assert.equal(summaryRows.length, 2);
    const ada = summaryRows.find((row) => row.staffMemberId === "s1");
    const grace = summaryRows.find((row) => row.staffMemberId === "s2");
    assert.equal(ada?.totalMinutes, 0);
    assert.equal(grace?.totalMinutes, 60);
    assert.equal(grace?.sessionCount, 1);
  });

  it("excludes inactive staff with no entries in range", () => {
    const members = [
      member("s1", "Ada", "Lovelace"),
      member("s2", "Grace", "Hopper", "inactive"),
    ];

    const { summaryRows } = buildAdminStaffHoursSummaryRows([], members, {
      from: "2026-11-03",
      to: "2026-11-03",
      timezone: "America/Denver",
    });

    assert.equal(summaryRows.length, 1);
    assert.equal(summaryRows[0]?.staffMemberId, "s1");
  });

  it("includes on-leave staff who logged hours", () => {
    const members = [
      member("s1", "Ada", "Lovelace"),
      member("s2", "Grace", "Hopper", "on_leave"),
    ];
    const rows = [
      entry({
        id: "e1",
        staff_member_id: "s2",
        work_date: "2026-11-03",
        clock_in_at: "2026-11-03T14:00:00.000Z",
        clock_out_at: "2026-11-03T16:00:00.000Z",
      }),
    ];

    const { summaryRows } = buildAdminStaffHoursSummaryRows(rows, members, {
      from: "2026-11-03",
      to: "2026-11-03",
      timezone: "America/Denver",
    });

    const grace = summaryRows.find((row) => row.staffMemberId === "s2");
    assert.equal(grace?.totalMinutes, 120);
  });
});

describe("loadStaffWorkTimeEntriesInRange", () => {
  it("pages through PostgREST range results", async () => {
    const totalRows = POSTGREST_DEFAULT_MAX_ROWS + 1;
    const rangeRows: StaffWorkTimeEntryRow[] = Array.from(
      { length: totalRows },
      (_, index) =>
        entry({
          id: `entry-${index}`,
          staff_member_id: "s1",
          work_date: "2026-11-03",
          clock_in_at: `2026-11-03T${String(10 + (index % 10)).padStart(2, "0")}:00:00.000Z`,
        }),
    );

    let rangeCalls = 0;

    const admin = {
      from(table: string) {
        assert.equal(table, "staff_work_time_entries");
        const builder = {
          select() {
            return builder;
          },
          eq() {
            return builder;
          },
          gte() {
            return builder;
          },
          lte() {
            return builder;
          },
          order() {
            return builder;
          },
          is(column: string, value: unknown) {
            if (column === "clock_out_at" && value === null) {
              return Promise.resolve({ data: [], error: null });
            }
            return builder;
          },
          range(from: number, to: number) {
            rangeCalls += 1;
            return Promise.resolve({
              data: rangeRows.slice(from, to + 1),
              error: null,
            });
          },
        };
        return builder;
      },
    } as unknown as SupabaseClient;

    const rows = await loadStaffWorkTimeEntriesInRange(
      admin,
      "org-1",
      "2026-11-01",
      "2026-11-30",
    );

    assert.equal(rows.length, totalRows);
    assert.equal(rangeCalls, 2);
  });
});
