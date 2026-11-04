import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { addCalendarDays } from "@/lib/admissions/admissions-observation-availability";
import { formatDateOnlyLabel } from "@/lib/admissions/admissions-availability";
import {
  dateKeyInTimezone,
  localWeekdayAndHourInTimezone,
} from "@/lib/admissions/scheduled-visit-reminders";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import {
  buildEmailNotificationContext,
  sendStaffHoursWeeklyAdminDigestEmail,
  type StaffHoursWeeklyAdminDigestStaffSessions,
} from "@/lib/emails";
import { mergeFeatures } from "@/lib/organization-settings/merge";
import { isAdminNavPathEnabled, schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import {
  loadOrganizationNotificationSettings,
  persistStaffHoursReminderState,
  resolveStaffHoursNotificationEmails,
} from "@/lib/notifications/org-notification-settings";
import {
  buildAdminStaffHoursSummaryRows,
  loadStaffWorkTimeEntriesInRange,
} from "@/lib/school-admin/staff-hours/load-admin-staff-hours-summary";
import { loadOrganizationTimezoneForStaffHours } from "@/lib/school-admin/staff-hours/staff-hours-org-utils";
import type { AdminStaffHoursSessionRow } from "@/lib/school-admin/staff-hours/staff-hours-types";
import type { StaffWorkTimeEntryRow } from "@/lib/school-teacher/my-hours/my-hours-db-types";
import {
  formatHoursMinutes,
  parseDateKey,
  startOfWeekMonday,
  toDateKey,
} from "@/lib/school-teacher/my-hours/format-duration";
import { listStaffMembers } from "@/lib/staff/staff-members";
import { SITE_URL } from "@/lib/site";

export function isSundayMorningWindow(timezone: string, now = new Date()): boolean {
  const { weekday, hour } = localWeekdayAndHourInTimezone(timezone, now);
  return weekday === "Sunday" && hour >= 6 && hour < 10;
}

function formatDateKeyForDigestLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function weekRangeForStaffHoursWeeklyDigest(
  timezone: string,
  now = new Date(),
): { from: string; to: string; weekEndKey: string; weekLabel: string } {
  const todayKey = dateKeyInTimezone(timezone, now);
  const weekEndKey = addCalendarDays(todayKey, -1);
  const weekStart = startOfWeekMonday(parseDateKey(weekEndKey));
  const from = toDateKey(weekStart);
  const to = weekEndKey;
  const weekLabel = `${formatDateKeyForDigestLabel(from)} – ${formatDateKeyForDigestLabel(to)}`;
  return { from, to, weekEndKey, weekLabel };
}

export function completedStaffWorkEntries(
  rows: StaffWorkTimeEntryRow[],
): StaffWorkTimeEntryRow[] {
  return rows.filter((row) => row.clock_out_at != null);
}

export function buildStaffHoursWeeklyDigestSessionGroups(
  summaryRows: Array<{
    staffMemberId: string;
    staffName: string;
    totalMinutes: number;
  }>,
  sessions: AdminStaffHoursSessionRow[],
): StaffHoursWeeklyAdminDigestStaffSessions[] {
  const completedSessions = sessions.filter(
    (session) => session.clockOutAt != null && session.minutes > 0,
  );

  const sessionsByStaffId = new Map<string, AdminStaffHoursSessionRow[]>();
  for (const session of completedSessions) {
    const list = sessionsByStaffId.get(session.staffMemberId) ?? [];
    list.push(session);
    sessionsByStaffId.set(session.staffMemberId, list);
  }

  return summaryRows
    .filter((row) => row.totalMinutes > 0)
    .map((row) => {
      const staffSessions = (sessionsByStaffId.get(row.staffMemberId) ?? [])
        .sort(
          (a, b) =>
            a.workDate.localeCompare(b.workDate) ||
            new Date(a.clockInAt).getTime() - new Date(b.clockInAt).getTime(),
        )
        .map((session) => ({
          dateLabel: formatDateOnlyLabel(session.workDate),
          timeLabel: `${session.clockInLabel} – ${session.clockOutLabel}`,
          durationLabel: formatHoursMinutes(session.minutes),
        }));

      return {
        staffName: row.staffName,
        sessions: staffSessions,
      };
    })
    .filter((group) => group.sessions.length > 0);
}

export type StaffHoursWeeklyDigestResult = {
  weeklyDigestsSent: number;
  failures: number;
};

type StaffHoursWeeklyDigestDeps = {
  now?: Date;
  resolveStaffHoursEmails?: typeof resolveStaffHoursNotificationEmails;
  sendDigestEmail?: typeof sendStaffHoursWeeklyAdminDigestEmail;
};

export async function sendStaffHoursWeeklyDigestForOrganization(
  admin: SupabaseClient,
  organizationId: string,
  deps: StaffHoursWeeklyDigestDeps = {},
): Promise<StaffHoursWeeklyDigestResult> {
  const now = deps.now ?? new Date();
  const resolveEmails =
    deps.resolveStaffHoursEmails ?? resolveStaffHoursNotificationEmails;
  const sendDigestEmail =
    deps.sendDigestEmail ?? sendStaffHoursWeeklyAdminDigestEmail;

  let failures = 0;
  let weeklyDigestsSent = 0;

  const { data: settingsRow, error: settingsError } = await admin
    .from("organization_settings")
    .select("features, notifications")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (settingsError) throw settingsError;

  const features = mergeFeatures(
    settingsRow?.features as Record<string, unknown> | null | undefined,
  );
  if (!isAdminNavPathEnabled(features, "my_school", "staff_hours")) {
    return { weeklyDigestsSent, failures };
  }

  const notificationSettings = await loadOrganizationNotificationSettings(
    admin,
    organizationId,
  );
  if (!notificationSettings.staff_hours.enabled) {
    return { weeklyDigestsSent, failures };
  }

  const timezone = await loadOrganizationTimezoneForStaffHours(
    admin,
    organizationId,
  );
  if (!isSundayMorningWindow(timezone, now)) {
    return { weeklyDigestsSent, failures };
  }

  const { from, to, weekEndKey, weekLabel } = weekRangeForStaffHoursWeeklyDigest(
    timezone,
    now,
  );

  if (
    notificationSettings.staff_hours_reminders.last_weekly_digest_week_end ===
    weekEndKey
  ) {
    return { weeklyDigestsSent, failures };
  }

  const recipientEmails = await resolveEmails(admin, organizationId);
  if (recipientEmails.length === 0) {
    return { weeklyDigestsSent, failures };
  }

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) throw orgError;

  const schoolName = String(org?.name ?? "Your school");
  const schoolSlug = String(org?.slug ?? "");
  const staffHoursAdminUrl = schoolSlug
    ? `${SITE_URL.replace(/\/$/, "")}${schoolAdminPath(schoolSlug, "my_school", "staff_hours")}`
    : SITE_URL;

  const members = await listStaffMembers(admin, organizationId);
  const allEntries = await loadStaffWorkTimeEntriesInRange(
    admin,
    organizationId,
    from,
    to,
  );
  const completedEntries = completedStaffWorkEntries(allEntries);
  const { summaryRows, sessions } = buildAdminStaffHoursSummaryRows(
    completedEntries,
    members,
    { from, to, timezone, now },
  );

  const staffRows = summaryRows
    .filter((row) => row.totalMinutes > 0)
    .map((row) => ({
      staffName: row.staffName,
      totalLabel: formatHoursMinutes(row.totalMinutes),
    }));

  if (staffRows.length === 0) {
    return { weeklyDigestsSent, failures };
  }

  const staffSessionGroups = buildStaffHoursWeeklyDigestSessionGroups(
    summaryRows,
    sessions,
  );

  const notificationContext = buildEmailNotificationContext({
    organizationId,
    organizationSlug: schoolSlug,
    surface: "cron",
    entityType: "organization",
    entityId: organizationId,
  });

  let delivered = false;
  for (const email of recipientEmails) {
    const result = await sendDigestEmail({
      email,
      schoolName,
      weekLabel,
      staffHoursAdminUrl,
      staffRows,
      staffSessionGroups,
      notificationContext,
    });
    if (result.ok) {
      delivered = true;
    } else {
      failures += 1;
      await logNotificationFailure(admin, {
        organizationId,
        operation: "staff_hours_weekly_admin_digest",
        error: `Failed to send staff hours weekly digest to ${email}`,
        entityType: "organization",
        entityId: organizationId,
      });
    }
  }

  if (delivered) {
    weeklyDigestsSent = 1;
    await persistStaffHoursReminderState(admin, organizationId, {
      last_weekly_digest_week_end: weekEndKey,
    });
  }

  return { weeklyDigestsSent, failures };
}
