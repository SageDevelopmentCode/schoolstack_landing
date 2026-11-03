import type { SupabaseClient } from "@supabase/supabase-js";
import {
  STAFF_WORK_TIME_ENTRY_COLUMNS,
  type StaffWorkTimeEntryRow,
} from "@/lib/school-teacher/my-hours/my-hours-db-types";
import { entryDurationMinutes } from "@/lib/school-teacher/my-hours/my-hours-summaries";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { staffDisplayName } from "@/lib/staff/staff-display";
import type {
  AdminStaffHoursSessionRow,
  AdminStaffHoursSummaryRow,
} from "@/lib/school-admin/staff-hours/staff-hours-types";
import { formatStaffHoursClockLabel } from "@/lib/school-admin/staff-hours/staff-hours-org-utils";

export function buildAdminStaffHoursSummaryRows(
  rows: StaffWorkTimeEntryRow[],
  members: StaffMemberRecord[],
  options: {
    from: string;
    to: string;
    staffMemberId?: string | null;
    timezone: string;
    now?: Date;
  },
): { summaryRows: AdminStaffHoursSummaryRow[]; sessions: AdminStaffHoursSessionRow[] } {
  const now = options.now ?? new Date();
  const filteredRows = rows.filter((row) => {
    if (row.work_date < options.from || row.work_date > options.to) {
      return false;
    }
    if (
      options.staffMemberId &&
      row.staff_member_id !== options.staffMemberId
    ) {
      return false;
    }
    return true;
  });

  const byStaff = new Map<
    string,
    { minutes: number; sessions: number; days: Set<string> }
  >();

  for (const row of filteredRows) {
    const bucket = byStaff.get(row.staff_member_id) ?? {
      minutes: 0,
      sessions: 0,
      days: new Set<string>(),
    };
    bucket.minutes += entryDurationMinutes(row, now);
    bucket.sessions += 1;
    bucket.days.add(row.work_date);
    byStaff.set(row.staff_member_id, bucket);
  }

  const memberById = new Map(members.map((m) => [m.id, m]));
  const activeMembers = members.filter((m) => m.employmentStatus === "active");
  const roster =
    options.staffMemberId != null
      ? activeMembers.filter((m) => m.id === options.staffMemberId)
      : activeMembers;

  const summaryRows: AdminStaffHoursSummaryRow[] = roster
    .map((member) => {
      const totals = byStaff.get(member.id);
      return {
        staffMemberId: member.id,
        staffName: staffDisplayName(member),
        roleTitle: member.roleTitle,
        totalMinutes: totals?.minutes ?? 0,
        sessionCount: totals?.sessions ?? 0,
        daysWorked: totals?.days.size ?? 0,
      };
    })
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  const sessions: AdminStaffHoursSessionRow[] = filteredRows
    .map((row) => {
      const member = memberById.get(row.staff_member_id);
      return {
        id: row.id,
        staffMemberId: row.staff_member_id,
        staffName: member ? staffDisplayName(member) : "Staff member",
        workDate: row.work_date,
        clockInAt: row.clock_in_at,
        clockOutAt: row.clock_out_at,
        minutes: entryDurationMinutes(row, now),
        clockInLabel: formatStaffHoursClockLabel(row.clock_in_at, options.timezone),
        clockOutLabel: row.clock_out_at
          ? formatStaffHoursClockLabel(row.clock_out_at, options.timezone)
          : "—",
      };
    })
    .sort(
      (a, b) =>
        new Date(b.clockInAt).getTime() - new Date(a.clockInAt).getTime(),
    );

  return { summaryRows, sessions };
}

export async function loadStaffWorkTimeEntriesInRange(
  admin: SupabaseClient,
  organizationId: string,
  from: string,
  to: string,
): Promise<StaffWorkTimeEntryRow[]> {
  const [rangeResult, openResult] = await Promise.all([
    admin
      .from("staff_work_time_entries")
      .select(STAFF_WORK_TIME_ENTRY_COLUMNS)
      .eq("organization_id", organizationId)
      .gte("work_date", from)
      .lte("work_date", to)
      .order("clock_in_at", { ascending: true }),
    admin
      .from("staff_work_time_entries")
      .select(STAFF_WORK_TIME_ENTRY_COLUMNS)
      .eq("organization_id", organizationId)
      .is("clock_out_at", null),
  ]);

  if (rangeResult.error) throw rangeResult.error;
  if (openResult.error) throw openResult.error;

  const merged = new Map<string, StaffWorkTimeEntryRow>();
  for (const row of (rangeResult.data ?? []) as StaffWorkTimeEntryRow[]) {
    merged.set(row.id, row);
  }
  for (const row of (openResult.data ?? []) as StaffWorkTimeEntryRow[]) {
    if (row.work_date >= from && row.work_date <= to) {
      merged.set(row.id, row);
    }
  }

  return [...merged.values()];
}

export async function loadAdminStaffHoursSummary(
  admin: SupabaseClient,
  organizationId: string,
  members: StaffMemberRecord[],
  options: {
    from: string;
    to: string;
    staffMemberId?: string | null;
    timezone: string;
  },
): Promise<{ summaryRows: AdminStaffHoursSummaryRow[]; sessions: AdminStaffHoursSessionRow[] }> {
  const rows = await loadStaffWorkTimeEntriesInRange(
    admin,
    organizationId,
    options.from,
    options.to,
  );
  return buildAdminStaffHoursSummaryRows(rows, members, options);
}
