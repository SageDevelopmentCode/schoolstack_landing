import type { SupabaseClient } from "@supabase/supabase-js";
import { displayDateKeyInTimezone } from "@/lib/demo-scheduler-timezone";
import {
  addDays,
  parseDateKey,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import {
  STAFF_WORK_TIME_ENTRY_COLUMNS,
  type StaffWorkTimeEntryRow,
} from "@/lib/school-teacher/my-hours/my-hours-db-types";
import { parseMyHoursDateKey } from "@/lib/school-teacher/my-hours/my-hours-mutations";
import {
  buildDayLogFromRows,
  buildSidebarSummary,
  groupEntriesByWorkDate,
  mapEntryToSession,
} from "@/lib/school-teacher/my-hours/my-hours-summaries";
import type {
  MyHoursDayLog,
  MyHoursSession,
  TeacherMyHoursPageData,
} from "@/lib/school-teacher/my-hours/types";
import { assertStaffMemberBelongsToOrg } from "@/lib/staff/staff-preview-access";
import { fetchAllPostgrestRows } from "@/lib/supabase/fetch-all-rows";

const DEFAULT_LOOKBACK_DAYS = 365;

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

export function defaultMyHoursDateRange(
  timezone: string,
  now: Date = new Date(),
): { from: string; to: string; referenceDateKey: string } {
  const referenceDateKey = displayDateKeyInTimezone(now, timezone);
  const to = referenceDateKey;
  const from = toDateKey(addDays(parseDateKey(referenceDateKey), -DEFAULT_LOOKBACK_DAYS));
  return { from, to, referenceDateKey };
}

export function emptyTeacherMyHoursPageData(
  timezone: string,
  now: Date = new Date(),
): TeacherMyHoursPageData {
  const { from, to, referenceDateKey } = defaultMyHoursDateRange(timezone, now);
  return {
    timezone,
    referenceDateKey,
    rangeFrom: from,
    rangeTo: to,
    activeSession: null,
    entriesByDateKey: {},
    sessionsByDateKey: {},
    sidebar: buildSidebarSummary([], referenceDateKey),
  };
}

function buildPageMaps(
  rows: StaffWorkTimeEntryRow[],
  timezone: string,
  now: Date,
): {
  entriesByDateKey: Record<string, MyHoursDayLog>;
  sessionsByDateKey: Record<string, MyHoursSession[]>;
} {
  const grouped = groupEntriesByWorkDate(rows);
  const entriesByDateKey: Record<string, MyHoursDayLog> = {};
  const sessionsByDateKey: Record<string, MyHoursSession[]> = {};

  for (const [dateKey, dayRows] of grouped) {
    const log = buildDayLogFromRows(dayRows, now);
    if (log) {
      entriesByDateKey[dateKey] = log;
    }
    sessionsByDateKey[dateKey] = dayRows.map((row) =>
      mapEntryToSession(row, timezone, now),
    );
  }

  return { entriesByDateKey, sessionsByDateKey };
}

export async function loadTeacherMyHoursPageData(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  options?: { from?: string; to?: string },
): Promise<TeacherMyHoursPageData> {
  const timezone = await loadOrganizationTimezone(admin, organizationId);
  const now = new Date();
  const defaults = defaultMyHoursDateRange(timezone, now);
  const from = options?.from ? parseMyHoursDateKey(options.from) : defaults.from;
  const to = options?.to ? parseMyHoursDateKey(options.to) : defaults.to;

  const [rangeRows, openResult] = await Promise.all([
    fetchAllPostgrestRows(async (offset, limit) =>
      admin
        .from("staff_work_time_entries")
        .select(STAFF_WORK_TIME_ENTRY_COLUMNS)
        .eq("organization_id", organizationId)
        .eq("staff_member_id", staffMemberId)
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
      .eq("staff_member_id", staffMemberId)
      .is("clock_out_at", null)
      .maybeSingle(),
  ]);

  if (openResult.error) throw openResult.error;

  const merged = new Map<string, StaffWorkTimeEntryRow>();
  for (const row of rangeRows) {
    merged.set(row.id, row);
  }
  const openRow = openResult.data as StaffWorkTimeEntryRow | null;
  if (openRow) {
    merged.set(openRow.id, openRow);
  }
  const rows = [...merged.values()].sort(
    (a, b) =>
      new Date(a.clock_in_at).getTime() - new Date(b.clock_in_at).getTime(),
  );
  const referenceDateKey = defaults.referenceDateKey;

  const open = rows.find((row) => row.clock_out_at == null) ?? null;
  const activeSession = open
    ? {
        entryId: open.id,
        clockInAt: open.clock_in_at,
        workDate: open.work_date,
      }
    : null;

  const { entriesByDateKey, sessionsByDateKey } = buildPageMaps(
    rows,
    timezone,
    now,
  );

  return {
    timezone,
    referenceDateKey,
    rangeFrom: from,
    rangeTo: to,
    activeSession,
    entriesByDateKey,
    sessionsByDateKey,
    sidebar: buildSidebarSummary(rows, referenceDateKey),
  };
}

export async function loadTeacherMyHoursPreviewData(
  admin: SupabaseClient,
  organizationId: string,
  staffMemberId: string,
  options?: { from?: string; to?: string },
): Promise<TeacherMyHoursPageData> {
  await assertStaffMemberBelongsToOrg(admin, organizationId, staffMemberId);
  return loadTeacherMyHoursPageData(
    admin,
    organizationId,
    staffMemberId,
    options,
  );
}
