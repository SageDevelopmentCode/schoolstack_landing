import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatInstantDateTimeInTimezone,
  getOrganizationTimezone,
} from "@/lib/admissions/admissions-availability";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import {
  buildEmailNotificationContext,
  buildFridayBranchClassRosterEmailHtml,
  sendFridayBranchClassRosterEmail,
} from "@/lib/emails";
import { wrapEmailHtmlForAdminPreview } from "@/lib/email-layout";
import { MAX_ROSTER_RECIPIENTS } from "@/lib/friday-branch/friday-branch-roster-constants";
import type { FridayBranchClassRosterForEmail } from "@/lib/school-admin/friday-branch/friday-branch-types";
import {
  formatRosterStatusLabel,
  loadFridayBranchClassRosterForEmail,
} from "@/lib/school-admin/friday-branch/friday-branch-storage";

export { MAX_ROSTER_RECIPIENTS };

export type FridayBranchClassRosterEmailPayload = {
  schoolName: string;
  className: string;
  slotTime: string;
  location: string;
  ageGroup: string;
  teacher: string;
  blockLabel: string;
  blockDateRange: string;
  sentAtLabel: string;
  rows: {
    studentName: string;
    familyName: string;
    grade: string;
    statusLabel: string;
    familyEmail: string;
    familyPhone: string;
  }[];
};

function formatRosterSentAtLabel(
  organizationTimeZone: string,
  date = new Date(),
): string {
  return formatInstantDateTimeInTimezone(date, organizationTimeZone);
}

export function buildFridayBranchClassRosterEmailSubject(
  className: string,
  slotTime: string,
): string {
  return `Friday Branch roster — ${className} (${slotTime})`;
}

export function buildFridayBranchClassRosterEmailPayload(
  roster: FridayBranchClassRosterForEmail,
  organizationTimeZone: string,
  sentAt = new Date(),
): FridayBranchClassRosterEmailPayload {
  return {
    schoolName: roster.schoolName,
    className: roster.className,
    slotTime: roster.slotTime,
    location: roster.location,
    ageGroup: roster.ageGroup,
    teacher: roster.teacher,
    blockLabel: roster.blockLabel,
    blockDateRange: roster.blockDateRange,
    sentAtLabel: formatRosterSentAtLabel(organizationTimeZone, sentAt),
    rows: roster.rows.map((row) => ({
      studentName: row.studentName,
      familyName: row.familyName,
      grade: row.grade,
      statusLabel: formatRosterStatusLabel(row.status),
      familyEmail: row.familyEmail,
      familyPhone: row.familyPhone,
    })),
  };
}

export function buildFridayBranchClassRosterEmailPreview(
  roster: FridayBranchClassRosterForEmail,
  organizationTimeZone: string,
  sentAt = new Date(),
): { subject: string; html: string } {
  const payload = buildFridayBranchClassRosterEmailPayload(
    roster,
    organizationTimeZone,
    sentAt,
  );

  return {
    subject: buildFridayBranchClassRosterEmailSubject(
      payload.className,
      payload.slotTime,
    ),
    html: wrapEmailHtmlForAdminPreview(
      buildFridayBranchClassRosterEmailHtml(payload),
    ),
  };
}

export async function loadFridayBranchClassRosterEmailPreview(
  supabase: SupabaseClient,
  organizationId: string,
  classId: string,
): Promise<{ subject: string; html: string } | null> {
  const roster = await loadFridayBranchClassRosterForEmail(
    supabase,
    organizationId,
    classId,
  );

  if (!roster) return null;

  const organizationTimeZone = await getOrganizationTimezone(
    supabase,
    organizationId,
  );

  return buildFridayBranchClassRosterEmailPreview(roster, organizationTimeZone);
}

export async function sendFridayBranchClassRosterEmails(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    classId: string;
    emails: string[];
  },
): Promise<{ sentCount: number }> {
  const roster = await loadFridayBranchClassRosterForEmail(
    supabase,
    input.organizationId,
    input.classId,
  );

  if (!roster) {
    throw new Error("Friday Branch class not found.");
  }

  if (roster.rows.length === 0) {
    throw new Error("No students signed up yet.");
  }

  const organizationTimeZone = await getOrganizationTimezone(
    supabase,
    input.organizationId,
  );
  const payload = buildFridayBranchClassRosterEmailPayload(
    roster,
    organizationTimeZone,
  );

  const { data: orgRow } = await supabase
    .from("organizations")
    .select("slug")
    .eq("id", input.organizationId)
    .maybeSingle();
  const rosterEmailContext = buildEmailNotificationContext({
    organizationId: input.organizationId,
    organizationSlug: String(orgRow?.slug ?? ""),
    surface: "web",
    entityType: "friday_branch_class",
    entityId: input.classId,
  });

  const results = await Promise.allSettled(
    input.emails.map((email) =>
      sendFridayBranchClassRosterEmail({
        email,
        ...payload,
        notificationContext: rosterEmailContext,
      }),
    ),
  );

  await logSettledNotificationFailures(supabase, {
    organizationId: input.organizationId,
    operation: "friday_branch.class.roster_email",
    entityType: "friday_branch_class",
    entityId: input.classId,
  }, results);

  const sentCount = results.filter(
    (result) => result.status === "fulfilled" && result.value.success,
  ).length;

  if (sentCount === 0) {
    const firstFailure = results.find((result) => result.status === "rejected")
      ?? results.find(
        (result) =>
          result.status === "fulfilled" && !result.value.success,
      );

    const message =
      firstFailure?.status === "rejected"
        ? firstFailure.reason instanceof Error
          ? firstFailure.reason.message
          : "Failed to send roster email."
        : firstFailure?.status === "fulfilled"
          ? firstFailure.value.error ?? "Failed to send roster email."
          : "Failed to send roster email.";

    throw new Error(message);
  }

  return { sentCount };
}
