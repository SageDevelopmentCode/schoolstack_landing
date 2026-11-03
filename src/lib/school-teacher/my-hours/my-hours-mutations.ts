import {
  displayDateKeyInTimezone,
  formatDemoTimeLabelInTimezone,
} from "@/lib/demo-scheduler-timezone";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  STAFF_WORK_TIME_ENTRY_COLUMNS,
  type StaffWorkTimeEntryRow,
} from "@/lib/school-teacher/my-hours/my-hours-db-types";
import { entryDurationMinutes } from "@/lib/school-teacher/my-hours/my-hours-summaries";
import type { MyHoursSession } from "@/lib/school-teacher/my-hours/types";

const MIN_SESSION_MINUTES = 1;

export class MyHoursMutationError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "MyHoursMutationError";
    this.code = code;
    this.status = status;
  }
}

export function parseMyHoursDateKey(value: string): string {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new MyHoursMutationError(
      "Date must be YYYY-MM-DD.",
      "invalid_date",
      400,
    );
  }
  return trimmed;
}

function rowToSession(row: StaffWorkTimeEntryRow, timezone: string): MyHoursSession {
  const start = new Date(row.clock_in_at);
  const end = row.clock_out_at ? new Date(row.clock_out_at) : null;
  return {
    id: row.id,
    clockInAt: row.clock_in_at,
    clockOutAt: row.clock_out_at,
    clockIn: formatDemoTimeLabelInTimezone(start, timezone),
    clockOut: end
      ? formatDemoTimeLabelInTimezone(end, timezone)
      : "—",
    minutes: entryDurationMinutes(row),
  };
}

async function loadOrganizationTimezone(
  admin: SupabaseClient,
  organizationId: string,
): Promise<string> {
  const { data, error } = await admin
    .from("organizations")
    .select("timezone")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) throw error;
  return typeof data?.timezone === "string" && data.timezone.trim()
    ? data.timezone.trim()
    : "America/Denver";
}

async function findOpenEntry(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
): Promise<StaffWorkTimeEntryRow | null> {
  const { data, error } = await admin
    .from("staff_work_time_entries")
    .select(STAFF_WORK_TIME_ENTRY_COLUMNS)
    .eq("organization_id", organizationId)
    .eq("staff_member_id", staffMemberId)
    .is("clock_out_at", null)
    .maybeSingle();

  if (error) throw error;
  return (data as StaffWorkTimeEntryRow | null) ?? null;
}

export async function clockInStaffWorkTime(
  admin: SupabaseClient,
  params: {
    organizationId: string;
    staffMemberId: string;
    recordedByUserId: string;
  },
): Promise<{ entry: StaffWorkTimeEntryRow; timezone: string }> {
  const { organizationId, staffMemberId, recordedByUserId } = params;

  const existing = await findOpenEntry(admin, organizationId, staffMemberId);
  if (existing) {
    throw new MyHoursMutationError(
      "You are already clocked in.",
      "already_clocked_in",
      409,
    );
  }

  const timezone = await loadOrganizationTimezone(admin, organizationId);
  const now = new Date();
  const workDate = displayDateKeyInTimezone(now, timezone);

  const { data, error } = await admin
    .from("staff_work_time_entries")
    .insert({
      organization_id: organizationId,
      staff_member_id: staffMemberId,
      work_date: workDate,
      clock_in_at: now.toISOString(),
      recorded_by_user_id: recordedByUserId,
    })
    .select(STAFF_WORK_TIME_ENTRY_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new MyHoursMutationError(
        "You are already clocked in.",
        "already_clocked_in",
        409,
      );
    }
    throw error;
  }

  return { entry: data as StaffWorkTimeEntryRow, timezone };
}

export async function clockOutStaffWorkTime(
  admin: SupabaseClient,
  params: {
    organizationId: string;
    staffMemberId: string;
  },
): Promise<{ entry: StaffWorkTimeEntryRow; session: MyHoursSession; timezone: string }> {
  const { organizationId, staffMemberId } = params;

  const open = await findOpenEntry(admin, organizationId, staffMemberId);
  if (!open) {
    throw new MyHoursMutationError(
      "No active session to clock out.",
      "not_clocked_in",
      404,
    );
  }

  const timezone = await loadOrganizationTimezone(admin, organizationId);
  const now = new Date();
  const elapsedMinutes = entryDurationMinutes(open, now);
  if (elapsedMinutes < MIN_SESSION_MINUTES) {
    throw new MyHoursMutationError(
      "Session must be at least one minute before clocking out.",
      "session_too_short",
      400,
    );
  }

  const { data, error } = await admin
    .from("staff_work_time_entries")
    .update({ clock_out_at: now.toISOString() })
    .eq("id", open.id)
    .select(STAFF_WORK_TIME_ENTRY_COLUMNS)
    .single();

  if (error) throw error;

  const entry = data as StaffWorkTimeEntryRow;
  return {
    entry,
    session: rowToSession(entry, timezone),
    timezone,
  };
}
