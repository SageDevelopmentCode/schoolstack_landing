import type { SupabaseClient } from "@supabase/supabase-js";
import {
  STAFF_WORK_TIME_ENTRY_COLUMNS,
  type StaffWorkTimeEntryRow,
} from "@/lib/school-teacher/my-hours/my-hours-db-types";
import { entryDurationMinutes } from "@/lib/school-teacher/my-hours/my-hours-summaries";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { staffDisplayName } from "@/lib/staff/staff-display";
import type {
  AdminStaffHoursLiveRow,
  AdminStaffHoursSessionRow,
} from "@/lib/school-admin/staff-hours/staff-hours-types";
import { formatStaffHoursClockLabel } from "@/lib/school-admin/staff-hours/staff-hours-org-utils";
import { fetchAllPostgrestRows } from "@/lib/supabase/fetch-all-rows";

function staffNameById(
  members: StaffMemberRecord[],
): Map<string, StaffMemberRecord> {
  return new Map(members.map((member) => [member.id, member]));
}

function rowToSession(
  row: StaffWorkTimeEntryRow,
  member: StaffMemberRecord | undefined,
  timezone: string,
  now: Date,
): AdminStaffHoursSessionRow {
  const staffName = member ? staffDisplayName(member) : "Staff member";
  return {
    id: row.id,
    staffMemberId: row.staff_member_id,
    staffName,
    workDate: row.work_date,
    clockInAt: row.clock_in_at,
    clockOutAt: row.clock_out_at,
    minutes: entryDurationMinutes(row, now),
    clockInLabel: formatStaffHoursClockLabel(row.clock_in_at, timezone),
    clockOutLabel: row.clock_out_at
      ? formatStaffHoursClockLabel(row.clock_out_at, timezone)
      : "—",
  };
}

export async function loadAdminStaffHoursLive(
  admin: SupabaseClient,
  organizationId: string,
  members: StaffMemberRecord[],
  timezone: string,
  referenceDateKey: string,
  now: Date = new Date(),
): Promise<{
  liveRows: AdminStaffHoursLiveRow[];
  todayClosedSessions: AdminStaffHoursSessionRow[];
}> {
  const byId = staffNameById(members);

  const [openRows, todayRows] = await Promise.all([
    fetchAllPostgrestRows(async (offset, limit) =>
      admin
        .from("staff_work_time_entries")
        .select(STAFF_WORK_TIME_ENTRY_COLUMNS)
        .eq("organization_id", organizationId)
        .is("clock_out_at", null)
        .order("clock_in_at", { ascending: true })
        .order("id", { ascending: true })
        .range(offset, limit),
    ),
    fetchAllPostgrestRows(async (offset, limit) =>
      admin
        .from("staff_work_time_entries")
        .select(STAFF_WORK_TIME_ENTRY_COLUMNS)
        .eq("organization_id", organizationId)
        .eq("work_date", referenceDateKey)
        .not("clock_out_at", "is", null)
        .order("clock_in_at", { ascending: false })
        .order("id", { ascending: true })
        .range(offset, limit),
    ),
  ]);

  const liveRows: AdminStaffHoursLiveRow[] = openRows.map((row) => {
    const member = byId.get(row.staff_member_id);
    return {
      staffMemberId: row.staff_member_id,
      staffName: member ? staffDisplayName(member) : "Staff member",
      roleTitle: member?.roleTitle ?? null,
      entryId: row.id,
      clockInAt: row.clock_in_at,
      workDate: row.work_date,
      clockInLabel: formatStaffHoursClockLabel(row.clock_in_at, timezone),
    };
  });

  const todayClosedSessions = todayRows.map((row) =>
    rowToSession(row, byId.get(row.staff_member_id), timezone, now),
  );

  return { liveRows, todayClosedSessions };
}
