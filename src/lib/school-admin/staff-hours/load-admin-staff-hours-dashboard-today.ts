import type { SupabaseClient } from "@supabase/supabase-js";
import { displayDateKeyInTimezone } from "@/lib/demo-scheduler-timezone";
import { isAdminNavPathEnabled } from "@/lib/organization-settings/admin-routes";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { loadAdminStaffHoursLive } from "@/lib/school-admin/staff-hours/load-admin-staff-hours-live";
import { loadOrganizationTimezoneForStaffHours } from "@/lib/school-admin/staff-hours/staff-hours-org-utils";
import type { AdminStaffHoursSessionRow } from "@/lib/school-admin/staff-hours/staff-hours-types";
import {
  formatHoursMinutes,
  formatLiveElapsed,
} from "@/lib/school-teacher/my-hours/format-duration";
import { entryDurationMinutes } from "@/lib/school-teacher/my-hours/my-hours-summaries";
import { listStaffMembers } from "@/lib/staff/staff-members";

export const DASHBOARD_STAFF_HOURS_COMPLETED_CAP = 5;

export type AdminDashboardStaffHoursClockedInRow = {
  staffMemberId: string;
  staffName: string;
  clockInAt: string;
  clockInLabel: string;
  elapsedLabel: string;
};

export type AdminDashboardStaffHoursCompletedRow = {
  staffMemberId: string;
  staffName: string;
  clockInLabel: string;
  clockOutLabel: string;
  durationLabel: string;
};

export type AdminDashboardStaffHoursToday = {
  referenceDateKey: string;
  summaryLine: string;
  clockedInCount: number;
  completedSessionCount: number;
  totalMinutesToday: number;
  totalHoursLabel: string;
  clockedIn: AdminDashboardStaffHoursClockedInRow[];
  completedToday: AdminDashboardStaffHoursCompletedRow[];
  hiddenCompletedCount: number;
};

export function formatDashboardStaffHoursSummaryLine(input: {
  clockedInCount: number;
  completedSessionCount: number;
  totalHoursLabel: string;
}): string {
  const parts: string[] = [];
  parts.push(
    `${input.clockedInCount} clocked in`,
  );
  parts.push(
    `${input.completedSessionCount} session${input.completedSessionCount === 1 ? "" : "s"} done`,
  );
  parts.push(`${input.totalHoursLabel} logged today`);
  return parts.join(" · ");
}

export function buildAdminDashboardStaffHoursToday(input: {
  referenceDateKey: string;
  now?: Date;
  liveRows: Array<{
    staffMemberId: string;
    staffName: string;
    clockInAt: string;
    clockInLabel: string;
  }>;
  todayClosedSessions: AdminStaffHoursSessionRow[];
}): AdminDashboardStaffHoursToday {
  const now = input.now ?? new Date();
  const clockedIn = input.liveRows.map((row) => {
    const elapsedSeconds = Math.max(
      0,
      Math.floor((now.getTime() - new Date(row.clockInAt).getTime()) / 1000),
    );
    return {
      staffMemberId: row.staffMemberId,
      staffName: row.staffName,
      clockInAt: row.clockInAt,
      clockInLabel: row.clockInLabel,
      elapsedLabel: formatLiveElapsed(elapsedSeconds),
    };
  });

  const sortedCompleted = [...input.todayClosedSessions].sort(
    (a, b) => new Date(b.clockInAt).getTime() - new Date(a.clockInAt).getTime(),
  );
  const visibleCompleted = sortedCompleted.slice(0, DASHBOARD_STAFF_HOURS_COMPLETED_CAP);
  const hiddenCompletedCount = Math.max(
    0,
    sortedCompleted.length - visibleCompleted.length,
  );

  const completedToday = visibleCompleted.map((session) => ({
    staffMemberId: session.staffMemberId,
    staffName: session.staffName,
    clockInLabel: session.clockInLabel,
    clockOutLabel: session.clockOutLabel,
    durationLabel: formatHoursMinutes(session.minutes),
  }));

  const openMinutes = input.liveRows.reduce((sum, row) => {
    return (
      sum +
      entryDurationMinutes(
        {
          id: "",
          organization_id: "",
          staff_member_id: row.staffMemberId,
          work_date: input.referenceDateKey,
          clock_in_at: row.clockInAt,
          clock_out_at: null,
          recorded_by_user_id: null,
        },
        now,
      )
    );
  }, 0);
  const closedMinutes = input.todayClosedSessions.reduce(
    (sum, session) => sum + session.minutes,
    0,
  );
  const totalMinutesToday = openMinutes + closedMinutes;
  const totalHoursLabel = formatHoursMinutes(totalMinutesToday);

  return {
    referenceDateKey: input.referenceDateKey,
    summaryLine: formatDashboardStaffHoursSummaryLine({
      clockedInCount: clockedIn.length,
      completedSessionCount: sortedCompleted.length,
      totalHoursLabel,
    }),
    clockedInCount: clockedIn.length,
    completedSessionCount: sortedCompleted.length,
    totalMinutesToday,
    totalHoursLabel,
    clockedIn,
    completedToday,
    hiddenCompletedCount,
  };
}

export async function loadAdminStaffHoursDashboardToday(
  admin: SupabaseClient,
  organizationId: string,
  organizationFeatures: OrganizationFeatures,
  now: Date = new Date(),
): Promise<AdminDashboardStaffHoursToday | null> {
  if (!isAdminNavPathEnabled(organizationFeatures, "my_school", "staff_hours")) {
    return null;
  }

  const timezone = await loadOrganizationTimezoneForStaffHours(
    admin,
    organizationId,
  );
  const referenceDateKey = displayDateKeyInTimezone(now, timezone);
  const members = await listStaffMembers(admin, organizationId);
  const { liveRows, todayClosedSessions } = await loadAdminStaffHoursLive(
    admin,
    organizationId,
    members,
    timezone,
    referenceDateKey,
    now,
  );

  return buildAdminDashboardStaffHoursToday({
    referenceDateKey,
    now,
    liveRows,
    todayClosedSessions,
  });
}
