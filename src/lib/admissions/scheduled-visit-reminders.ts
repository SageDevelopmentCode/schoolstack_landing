import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatDurationLabel,
  formatOrganizationTimezoneLabel,
  formatScheduledVisitWhenLabel,
  getOrganizationTimezone,
} from "@/lib/admissions/admissions-availability";
import { addCalendarDays } from "@/lib/admissions/admissions-observation-availability";
import { labelFromPublicRegistrant } from "@/lib/admissions/admin-scheduled-visits";
import { resolveApplicantContact } from "@/lib/admissions/application-notifications";
import type { PostSubmitActionType } from "@/lib/admissions/application-form-schema";
import { parseApplicationFormPostSubmitConfig } from "@/lib/admissions/application-form-schema";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import {
  POST_SUBMIT_ACTION_TEMPLATES,
  postSubmitActionLabel,
} from "@/lib/admissions/post-submit-templates";
import type { PublicTourRegistrant } from "@/lib/admissions/public-tour-settings";
import { PUBLIC_TOUR_POST_SUBMIT_ACTION_ID } from "@/lib/admissions/public-tour-settings";
import {
  formatCampusTourBookingSourceLabel,
  notifyScheduledVisitRemindersSent,
  type CampusTourBookingSource,
} from "@/lib/discord";
import {
  sendScheduledVisitAdminDigestEmail,
  sendScheduledVisitDayBeforeReminderEmail,
  type ScheduledVisitAdminDigestRow,
} from "@/lib/emails";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import {
  isScheduledVisitDayBeforeReminderEnabled,
  loadOrganizationNotificationSettings,
  persistScheduledVisitReminderState,
  resolveVisitNotificationEmails,
} from "@/lib/notifications/org-notification-settings";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { SITE_URL } from "@/lib/site";

const VISIT_REMINDER_SELECT = `
  id,
  application_id,
  family_id,
  booking_source,
  registrant,
  post_submit_action_id,
  action_type,
  scheduling_mode,
  scheduled_date,
  end_date,
  start_time_slot,
  duration_minutes,
  visit_day_count,
  day_before_parent_reminder_sent_at,
  applications (
    application_form_versions (
      title,
      post_submit_config
    ),
    students:student_id (
      first_name,
      last_name
    ),
    primary_guardian_id,
    created_by_user_id
  ),
  families:family_id (
    name
  )
`;

export type ScheduledVisitRemindersResult = {
  parentRemindersSent: number;
  adminWeeklyDigestsSent: number;
  adminDayBeforeDigestsSent: number;
  failures: number;
};

type VisitReminderFamilyJoin = { name?: string | null };

type VisitReminderRow = {
  id: string;
  application_id: string | null;
  family_id: string | null;
  booking_source: string | null;
  registrant: unknown;
  post_submit_action_id: string;
  action_type: PostSubmitActionType;
  scheduling_mode: "time_slot" | "whole_day";
  scheduled_date: string;
  end_date: string | null;
  start_time_slot: string;
  duration_minutes: number;
  visit_day_count: number | null;
  day_before_parent_reminder_sent_at: string | null;
  applications: unknown;
  families: VisitReminderFamilyJoin | VisitReminderFamilyJoin[] | null;
};

export function dateKeyInTimezone(timezone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function tomorrowKey(timezone: string, now = new Date()): string {
  return addCalendarDays(dateKeyInTimezone(timezone, now), 1);
}

export function localWeekdayAndHourInTimezone(
  timezone: string,
  now = new Date(),
): { weekday: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  return { weekday, hour };
}

export function isMondayMorningWindow(timezone: string, now = new Date()): boolean {
  const { weekday, hour } = localWeekdayAndHourInTimezone(timezone, now);
  return weekday === "Monday" && hour >= 6 && hour < 10;
}

export function weekRangeForWeeklyDigest(
  timezone: string,
  now = new Date(),
): { start: string; end: string } {
  const start = tomorrowKey(timezone, now);
  return { start, end: addCalendarDays(start, 6) };
}

type ApplicationJoin = {
  primary_guardian_id?: string | null;
  created_by_user_id?: string | null;
  application_form_versions?: unknown;
  students?: unknown;
};

function applicationJoin(row: VisitReminderRow): ApplicationJoin | null {
  return unwrapJoin(row.applications as ApplicationJoin | ApplicationJoin[] | null);
}

function resolveStepTitle(row: VisitReminderRow): string {
  if (row.post_submit_action_id === PUBLIC_TOUR_POST_SUBMIT_ACTION_ID) {
    return "Public campus tour";
  }

  const application = applicationJoin(row);
  const formVersion = unwrapJoin(
    application?.application_form_versions as { post_submit_config?: unknown } | null,
  );
  const config = parseApplicationFormPostSubmitConfig(formVersion?.post_submit_config);
  const action = config.actions.find((entry) => entry.id === row.post_submit_action_id);
  if (action) return postSubmitActionLabel(action);
  return POST_SUBMIT_ACTION_TEMPLATES[row.action_type]?.label ?? "Visit";
}

function unwrapJoin<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function resolveStudentLabel(row: VisitReminderRow): string | null {
  const application = applicationJoin(row);
  const student = unwrapJoin(
    application?.students as { first_name?: string; last_name?: string } | null,
  );
  if (!student) return null;
  const name = [student.first_name, student.last_name]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(" ");
  return name || null;
}

function resolveContactLabel(row: VisitReminderRow): string {
  const student = resolveStudentLabel(row);
  if (student) return student;

  const bookingSource = row.booking_source ?? "application";
  if (bookingSource === "public") {
    return labelFromPublicRegistrant(row.registrant) ?? "Family";
  }

  const family = unwrapJoin(row.families);
  if (family?.name && String(family.name).trim()) {
    return String(family.name).trim();
  }

  return "Family";
}

function bookingSourceForDiscord(
  bookingSource: string | null,
): CampusTourBookingSource {
  switch (bookingSource) {
    case "public":
      return "public";
    case "family_pre_app":
      return "pre_application";
    default:
      return "post_submit";
  }
}

function visitWhenLabel(row: VisitReminderRow): string {
  return formatScheduledVisitWhenLabel({
    schedulingMode: row.scheduling_mode,
    scheduledDate: row.scheduled_date,
    endDate: row.end_date ?? undefined,
    startTimeSlot: row.start_time_slot,
    durationMinutes: row.duration_minutes,
    visitDayCount: row.visit_day_count ?? undefined,
  });
}

function toDigestRow(row: VisitReminderRow): ScheduledVisitAdminDigestRow {
  return {
    whenLabel: visitWhenLabel(row),
    stepTitle: resolveStepTitle(row),
    contactLabel: resolveContactLabel(row),
    bookingSourceLabel: formatCampusTourBookingSourceLabel(
      bookingSourceForDiscord(row.booking_source),
    ),
  };
}

async function loadScheduledVisitsInDateRange(
  admin: SupabaseClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<VisitReminderRow[]> {
  const { data, error } = await admin
    .from("admissions_scheduled_visits")
    .select(VISIT_REMINDER_SELECT)
    .eq("organization_id", organizationId)
    .eq("status", "scheduled")
    .is("completed_manually_at", null)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .order("scheduled_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as VisitReminderRow[];
}

type ParentRecipient = { email: string; name: string };

async function resolveParentRecipients(
  admin: SupabaseClient,
  row: VisitReminderRow,
): Promise<ParentRecipient[]> {
  const bookingSource = row.booking_source ?? "application";

  if (bookingSource === "public") {
    if (!row.registrant || typeof row.registrant !== "object" || Array.isArray(row.registrant)) {
      return [];
    }
    const registrant = row.registrant as PublicTourRegistrant;
    const email = registrant.contactEmail?.trim().toLowerCase();
    if (!email) return [];
    const answers = registrant.answers;
    const name =
      (typeof answers?.contact_name === "string" && answers.contact_name.trim()) ||
      labelFromPublicRegistrant(row.registrant) ||
      "there";
    return [{ email, name }];
  }

  if (bookingSource === "family_pre_app" && row.family_id) {
    const emails = await loadFamilyNotificationEmails(admin, row.family_id);
    if (emails.length === 0) return [];
    const family = unwrapJoin(row.families);
    const name = family?.name?.trim() || "there";
    return emails.map((email) => ({ email, name }));
  }

  if (row.application_id) {
    const application = applicationJoin(row);
    const contact = await resolveApplicantContact(admin, {
      family_id: row.family_id,
      created_by_user_id: application?.created_by_user_id ?? null,
      primary_guardian_id: application?.primary_guardian_id ?? null,
    });
    if (!contact?.email) return [];
    return [
      {
        email: contact.email,
        name: contact.displayName || "there",
      },
    ];
  }

  return [];
}

function resolveOptionalParentLink(
  schoolSlug: string,
  row: VisitReminderRow,
): { label: string; href: string } | undefined {
  const base = SITE_URL.replace(/\/$/, "");
  const bookingSource = row.booking_source ?? "application";

  if (bookingSource === "application" && row.application_id && schoolSlug) {
    return {
      label: "View apply dashboard",
      href: `${base}/school/${schoolSlug}/apply/${row.application_id}`,
    };
  }

  if (bookingSource === "family_pre_app" && schoolSlug) {
    return {
      label: "View apply dashboard",
      href: `${base}/school/${schoolSlug}/apply`,
    };
  }

  return undefined;
}

async function sendAdminDigest(
  admin: SupabaseClient,
  organizationId: string,
  payload: {
    schoolName: string;
    schoolSlug: string;
    digestKind: "weekly" | "day_before";
    rows: VisitReminderRow[];
    recipientEmails: string[];
    scheduleAdminUrl: string;
  },
): Promise<{ sent: boolean; failures: number }> {
  if (payload.recipientEmails.length === 0 || payload.rows.length === 0) {
    return { sent: false, failures: 0 };
  }

  const digestRows = payload.rows.map(toDigestRow);
  let delivered = false;
  let failures = 0;

  for (const email of payload.recipientEmails) {
    const result = await sendScheduledVisitAdminDigestEmail({
      email,
      schoolName: payload.schoolName,
      digestKind: payload.digestKind,
      scheduleAdminUrl: payload.scheduleAdminUrl,
      rows: digestRows,
    });
    if (result.ok) {
      delivered = true;
    } else {
      failures += 1;
      await logNotificationFailure(admin, {
        organizationId,
        operation: `scheduled_visit_admin_${payload.digestKind}_digest`,
        error: `Failed to send scheduled visit admin digest to ${email}`,
        entityType: "organization",
        entityId: organizationId,
      });
    }
  }

  return { sent: delivered, failures };
}

type ReminderDeps = {
  now?: Date;
  isParentReminderEnabled?: typeof isScheduledVisitDayBeforeReminderEnabled;
  resolveVisitEmails?: typeof resolveVisitNotificationEmails;
  sendParentEmail?: typeof sendScheduledVisitDayBeforeReminderEmail;
  notifyDiscord?: typeof notifyScheduledVisitRemindersSent;
};

export async function sendScheduledVisitRemindersForOrganization(
  admin: SupabaseClient,
  organizationId: string,
  deps: ReminderDeps = {},
): Promise<ScheduledVisitRemindersResult> {
  const now = deps.now ?? new Date();
  const checkParentEnabled =
    deps.isParentReminderEnabled ?? isScheduledVisitDayBeforeReminderEnabled;
  const resolveVisitEmails = deps.resolveVisitEmails ?? resolveVisitNotificationEmails;
  const sendParentEmail =
    deps.sendParentEmail ?? sendScheduledVisitDayBeforeReminderEmail;
  const notifyDiscord = deps.notifyDiscord ?? notifyScheduledVisitRemindersSent;

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) throw orgError;

  const schoolName = String(org?.name ?? "Your school");
  const schoolSlug = String(org?.slug ?? "");
  const timezone = await getOrganizationTimezone(admin, organizationId);
  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);
  const tomorrow = tomorrowKey(timezone, now);
  const scheduleAdminUrl = schoolSlug
    ? `${SITE_URL.replace(/\/$/, "")}${schoolAdminPath(schoolSlug, "schedule")}?tab=visits`
    : SITE_URL;

  const notificationSettings = await loadOrganizationNotificationSettings(
    admin,
    organizationId,
  );
  const reminderState = notificationSettings.scheduled_visit_reminders;

  let parentRemindersSent = 0;
  let adminWeeklyDigestsSent = 0;
  let adminDayBeforeDigestsSent = 0;
  let failures = 0;

  const parentEnabled = await checkParentEnabled(admin, organizationId);
  if (parentEnabled) {
    const { data: tomorrowVisits, error: tomorrowError } = await admin
      .from("admissions_scheduled_visits")
      .select(VISIT_REMINDER_SELECT)
      .eq("organization_id", organizationId)
      .eq("status", "scheduled")
      .is("completed_manually_at", null)
      .eq("scheduled_date", tomorrow)
      .is("day_before_parent_reminder_sent_at", null);

    if (tomorrowError) throw tomorrowError;

    for (const row of (tomorrowVisits ?? []) as VisitReminderRow[]) {
      const recipients = await resolveParentRecipients(admin, row);
      if (recipients.length === 0) {
        failures += 1;
        await logNotificationFailure(admin, {
          organizationId,
          operation: "scheduled_visit_day_before_parent_reminder",
          error: "No deliverable parent email for scheduled visit",
          entityType: "admissions_scheduled_visit",
          entityId: row.id,
        });
        continue;
      }

      const stepTitle = resolveStepTitle(row);
      const whenLabel = visitWhenLabel(row);
      const durationLabel = formatDurationLabel(row.duration_minutes);
      const optionalLink = resolveOptionalParentLink(schoolSlug, row);

      const { data: claimed, error: claimError } = await admin
        .from("admissions_scheduled_visits")
        .update({ day_before_parent_reminder_sent_at: now.toISOString() })
        .eq("id", row.id)
        .eq("organization_id", organizationId)
        .is("day_before_parent_reminder_sent_at", null)
        .select("id");

      if (claimError) throw claimError;
      if (!claimed?.length) continue;

      let delivered = false;
      for (const recipient of recipients) {
        const result = await sendParentEmail({
          email: recipient.email,
          name: recipient.name,
          schoolName,
          stepTitle,
          whenLabel,
          timezoneLabel,
          durationLabel,
          optionalLink,
        });
        if (result.ok) {
          delivered = true;
        } else {
          failures += 1;
          await logNotificationFailure(admin, {
            organizationId,
            operation: "scheduled_visit_day_before_parent_reminder",
            error: `Failed to send day-before reminder to ${recipient.email}`,
            entityType: "admissions_scheduled_visit",
            entityId: row.id,
          });
        }
      }

      if (!delivered) {
        const { error: revertError } = await admin
          .from("admissions_scheduled_visits")
          .update({ day_before_parent_reminder_sent_at: null })
          .eq("id", row.id)
          .eq("organization_id", organizationId);

        if (revertError) throw revertError;
        continue;
      }

      parentRemindersSent += 1;
    }
  }

  const visitChannelEnabled = notificationSettings.visits.enabled;
  const adminEmails = visitChannelEnabled
    ? await resolveVisitEmails(admin, organizationId)
    : [];

  const tomorrowVisitRows = await loadScheduledVisitsInDateRange(
    admin,
    organizationId,
    tomorrow,
    tomorrow,
  );

  if (
    adminEmails.length > 0 &&
    tomorrowVisitRows.length > 0 &&
    reminderState.last_day_before_admin_digest_for_date !== tomorrow
  ) {
    const digestResult = await sendAdminDigest(admin, organizationId, {
      schoolName,
      schoolSlug,
      digestKind: "day_before",
      rows: tomorrowVisitRows,
      recipientEmails: adminEmails,
      scheduleAdminUrl,
    });
    failures += digestResult.failures;
    if (digestResult.sent) {
      adminDayBeforeDigestsSent += 1;
      await persistScheduledVisitReminderState(admin, organizationId, {
        last_day_before_admin_digest_for_date: tomorrow,
      });
    }
  }

  const mondayKey = dateKeyInTimezone(timezone, now);
  if (
    isMondayMorningWindow(timezone, now) &&
    adminEmails.length > 0 &&
    reminderState.last_weekly_admin_digest_week_start !== mondayKey
  ) {
    const { start, end } = weekRangeForWeeklyDigest(timezone, now);
    const weekVisits = await loadScheduledVisitsInDateRange(
      admin,
      organizationId,
      start,
      end,
    );

    if (weekVisits.length > 0) {
      const digestResult = await sendAdminDigest(admin, organizationId, {
        schoolName,
        schoolSlug,
        digestKind: "weekly",
        rows: weekVisits,
        recipientEmails: adminEmails,
        scheduleAdminUrl,
      });
      failures += digestResult.failures;
      if (digestResult.sent) {
        adminWeeklyDigestsSent += 1;
        await persistScheduledVisitReminderState(admin, organizationId, {
          last_weekly_admin_digest_week_start: mondayKey,
        });
      }
    }
  }

  if (
    parentRemindersSent > 0 ||
    adminWeeklyDigestsSent > 0 ||
    adminDayBeforeDigestsSent > 0 ||
    failures > 0
  ) {
    const discordVisits = [
      ...tomorrowVisitRows.map((row) => ({
        whenLabel: visitWhenLabel(row),
        stepTitle: resolveStepTitle(row),
        contactLabel: resolveContactLabel(row),
      })),
    ];

    void notifyDiscord({
      organizationId,
      schoolName,
      schoolSlug,
      parentRemindersSent,
      adminWeeklyDigestsSent,
      adminDayBeforeDigestsSent,
      failures,
      visits: discordVisits,
    }).catch((error) => {
      console.error("Scheduled visit reminders Discord notification failed:", error);
    });
  }

  return {
    parentRemindersSent,
    adminWeeklyDigestsSent,
    adminDayBeforeDigestsSent,
    failures,
  };
}
