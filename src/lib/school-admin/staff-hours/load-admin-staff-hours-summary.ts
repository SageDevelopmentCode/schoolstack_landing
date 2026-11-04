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
import { fetchAllPostgrestRows } from "@/lib/supabase/fetch-all-rows";

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

  type SummaryRosterEntry =
    | { kind: "member"; member: StaffMemberRecord }
    | { kind: "orphan"; staffMemberId: string };

  let rosterEntries: SummaryRosterEntry[];

  if (options.staffMemberId != null) {
    const member = memberById.get(options.staffMemberId);
    rosterEntries = member ? [{ kind: "member", member }] : [];
  } else {
    rosterEntries = activeMembers.map((member) => ({
      kind: "member" as const,
      member,
    }));
    const rosterIds = new Set(activeMembers.map((m) => m.id));
    for (const staffId of byStaff.keys()) {
      if (rosterIds.has(staffId)) continue;
      const member = memberById.get(staffId);
      if (member) {
        rosterIds.add(staffId);
        rosterEntries.push({ kind: "member", member });
      } else {
        rosterIds.add(staffId);
        rosterEntries.push({ kind: "orphan", staffMemberId: staffId });
      }
    }
  }

  const summaryRows: AdminStaffHoursSummaryRow[] = rosterEntries
    .map((entry) => {
      const staffMemberId =
        entry.kind === "member" ? entry.member.id : entry.staffMemberId;
      const totals = byStaff.get(staffMemberId);
      if (entry.kind === "member") {
        return {
          staffMemberId,
          staffName: staffDisplayName(entry.member),
          roleTitle: entry.member.roleTitle,
          totalMinutes: totals?.minutes ?? 0,
          sessionCount: totals?.sessions ?? 0,
          daysWorked: totals?.days.size ?? 0,
        };
      }
      return {
        staffMemberId,
        staffName: "Staff member",
        roleTitle: null,
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
  const [rangeRows, openResult] = await Promise.all([
    fetchAllPostgrestRows(async (offset, limit) =>
      admin
        .from("staff_work_time_entries")
        .select(STAFF_WORK_TIME_ENTRY_COLUMNS)
        .eq("organization_id", organizationId)
        .gte("work_date", from)
        .lte("work_date", to)
        .order("clock_in_at", { ascending: true })
        .order("id", { ascending: true })
        .range(offset, limit),
    ),
    admin
      .from("staff_work_time_entries")
      .select(STAFF_WORK_TIME_ENTRY_COLUMNS)
      .eq("organization_id", organizationId)
      .is("clock_out_at", null),
  ]);

  if (openResult.error) throw openResult.error;

  const merged = new Map<string, StaffWorkTimeEntryRow>();
  for (const row of rangeRows) {
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
