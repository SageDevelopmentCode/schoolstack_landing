import type { SupabaseClient } from "@supabase/supabase-js";
import {
  displayDateKeyInTimezone,
  formatDemoTimeLabelInTimezone,
} from "@/lib/demo-scheduler-timezone";
import {
  parseDateKey,
  startOfWeekMonday,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";

export async function loadOrganizationTimezoneForStaffHours(
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

export function defaultAdminStaffHoursSummaryRange(
  timezone: string,
  now: Date = new Date(),
): { from: string; to: string; referenceDateKey: string } {
  const referenceDateKey = displayDateKeyInTimezone(now, timezone);
  const referenceDate = parseDateKey(referenceDateKey);
  const weekStart = startOfWeekMonday(referenceDate);
  return {
    from: toDateKey(weekStart),
    to: referenceDateKey,
    referenceDateKey,
  };
}

export function formatStaffHoursClockLabel(
  iso: string,
  timezone: string,
): string {
  return formatDemoTimeLabelInTimezone(new Date(iso), timezone);
}
