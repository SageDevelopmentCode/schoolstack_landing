import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveApplicantContact } from "@/lib/admissions/application-notifications";
import { extractStudentLabel } from "@/lib/admissions/application-submissions";
import { listEnrollmentProgressForApplications } from "@/lib/admissions/enrollment-checklist-materialization";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { notifyIncompleteAdmissionsReminderSent } from "@/lib/discord";
import {
  buildIncompleteAdmissionsReminderHtml,
  buildIncompleteAdmissionsReminderSubject,
  sendIncompleteAdmissionsReminderEmail,
} from "@/lib/emails";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import {
  isIncompleteAdmissionsRemindersEnabled,
  resolveApplicationNotificationEmails,
} from "@/lib/notifications/org-notification-settings";
import { SITE_URL } from "@/lib/site";

export const FIRST_INCOMPLETE_REMINDER_DELAY_HOURS = 72;
export const SECOND_INCOMPLETE_REMINDER_DELAY_DAYS = 7;
export const MAX_INCOMPLETE_ADMISSIONS_REMINDERS = 2;

export type IncompleteDraftApplication = {
  id: string;
  formTitle: string;
  updatedAt: string;
  applyUrl: string;
};

export type IncompleteEnrollmentChecklist = {
  applicationId: string;
  label: string;
  progressLabel: string;
  updatedAt: string;
  enrollmentUrl: string;
};

export type IncompleteAdmissionsFamilyWork = {
  familyId: string;
  draftApplications: IncompleteDraftApplication[];
  incompleteEnrollments: IncompleteEnrollmentChecklist[];
};

type FamilyReminderRow = {
  id: string;
  incomplete_admissions_reminder_count: number;
  incomplete_admissions_reminder_sent_at: string | null;
};

type ReminderDeps = {
  sendEmail?: typeof sendIncompleteAdmissionsReminderEmail;
  notifyDiscord?: typeof notifyIncompleteAdmissionsReminderSent;
  loadIncompleteAdmissionsWork?: typeof loadIncompleteAdmissionsWork;
  loadFamilyNotificationEmails?: typeof loadFamilyNotificationEmails;
  resolveApplicationNotificationEmails?: typeof resolveApplicationNotificationEmails;
  resolveApplicantContact?: typeof resolveApplicantContact;
  isIncompleteAdmissionsRemindersEnabled?: typeof isIncompleteAdmissionsRemindersEnabled;
  now?: Date;
};

function parseResponses(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}

function resolveFormTitle(
  joined:
    | { title: string | null }
    | { title: string | null }[]
    | null
    | undefined,
): string {
  if (!joined) return "your application";
  const row = Array.isArray(joined) ? joined[0] : joined;
  return String(row?.title ?? "your application").trim() || "your application";
}

function maxTimestamp(...values: Array<string | null | undefined>): string | null {
  let bestMs = Number.NEGATIVE_INFINITY;
  let bestValue: string | null = null;

  for (const value of values) {
    if (!value) continue;
    const ms = new Date(value).getTime();
    if (!Number.isFinite(ms)) continue;
    if (ms > bestMs) {
      bestMs = ms;
      bestValue = value;
    }
  }

  return bestValue;
}

export function isEligibleForIncompleteAdmissionsReminder(input: {
  count: number;
  lastSentAt: string | null;
  lastActivityAt: string | null;
  now: Date;
}): boolean {
  const { count, lastSentAt, lastActivityAt, now } = input;

  if (count >= MAX_INCOMPLETE_ADMISSIONS_REMINDERS) {
    return false;
  }

  if (!lastActivityAt) {
    return false;
  }

  const activityMs = new Date(lastActivityAt).getTime();
  if (!Number.isFinite(activityMs)) {
    return false;
  }

  const activityCutoffMs =
    now.getTime() - FIRST_INCOMPLETE_REMINDER_DELAY_HOURS * 60 * 60 * 1000;

  if (count === 0) {
    return activityMs <= activityCutoffMs;
  }

  if (!lastSentAt) {
    return false;
  }

  const sentMs = new Date(lastSentAt).getTime();
  if (!Number.isFinite(sentMs)) {
    return false;
  }

  const secondSentCutoffMs =
    now.getTime() - SECOND_INCOMPLETE_REMINDER_DELAY_DAYS * 24 * 60 * 60 * 1000;
  return sentMs <= secondSentCutoffMs && activityMs <= activityCutoffMs;
}

export async function loadIncompleteAdmissionsWork(
  supabase: SupabaseClient,
  organizationId: string,
  schoolSlug: string,
): Promise<Map<string, IncompleteAdmissionsFamilyWork>> {
  const siteBase = SITE_URL.replace(/\/$/, "");
  const applyDashboardUrl = schoolSlug
    ? `${siteBase}/school/${schoolSlug}/apply`
    : siteBase;

  const workByFamilyId = new Map<string, IncompleteAdmissionsFamilyWork>();

  const ensureFamily = (familyId: string): IncompleteAdmissionsFamilyWork => {
    const existing = workByFamilyId.get(familyId);
    if (existing) return existing;
    const created: IncompleteAdmissionsFamilyWork = {
      familyId,
      draftApplications: [],
      incompleteEnrollments: [],
    };
    workByFamilyId.set(familyId, created);
    return created;
  };

  const { data: draftRows, error: draftError } = await supabase
    .from("applications")
    .select(
      `
        id,
        family_id,
        updated_at,
        application_form_versions ( title )
      `,
    )
    .eq("organization_id", organizationId)
    .eq("status", "draft")
    .not("family_id", "is", null);

  if (draftError) throw draftError;

  for (const row of draftRows ?? []) {
    const familyId = row.family_id ? String(row.family_id) : "";
    if (!familyId) continue;

    const familyWork = ensureFamily(familyId);
    familyWork.draftApplications.push({
      id: String(row.id),
      formTitle: resolveFormTitle(row.application_form_versions),
      updatedAt: String(row.updated_at),
      applyUrl: applyDashboardUrl,
    });
  }

  const { data: enrollingRows, error: enrollingError } = await supabase
    .from("applications")
    .select(
      `
        id,
        family_id,
        updated_at,
        responses,
        student_id,
        program_id,
        students ( first_name, last_name ),
        programs ( name ),
        enrollment_checklists ( status, updated_at )
      `,
    )
    .eq("organization_id", organizationId)
    .eq("status", "enrolling")
    .not("family_id", "is", null);

  if (enrollingError) throw enrollingError;

  const enrollingApplicationIds: string[] = [];
  const enrollingMeta = new Map<
    string,
    {
      familyId: string;
      label: string;
      updatedAt: string;
    }
  >();

  for (const row of enrollingRows ?? []) {
    const familyId = row.family_id ? String(row.family_id) : "";
    if (!familyId) continue;

    const checklists = row.enrollment_checklists;
    const checklist = Array.isArray(checklists) ? checklists[0] : checklists;
    if (!checklist || String(checklist.status) === "completed") {
      continue;
    }

    const applicationId = String(row.id);
    enrollingApplicationIds.push(applicationId);

    const responses = parseResponses(row.responses);
    const studentFromTable = (() => {
      const students = row.students;
      const student = Array.isArray(students) ? students[0] : students;
      if (!student) return null;
      const first = String(student.first_name ?? "").trim();
      const last = String(student.last_name ?? "").trim();
      return [first, last].filter(Boolean).join(" ") || null;
    })();

    const programs = row.programs;
    const program = Array.isArray(programs) ? programs[0] : programs;
    const programName = String(program?.name ?? "").trim();

    const studentLabel =
      studentFromTable ?? extractStudentLabel(responses) ?? "your student";
    const label = programName
      ? `${studentLabel} — ${programName}`
      : studentLabel;

    const updatedAt =
      maxTimestamp(String(row.updated_at), String(checklist.updated_at)) ??
      String(row.updated_at);

    enrollingMeta.set(applicationId, {
      familyId,
      label,
      updatedAt,
    });
  }

  const progressByApplicationId = await listEnrollmentProgressForApplications(
    supabase,
    organizationId,
    enrollingApplicationIds,
  );

  for (const applicationId of enrollingApplicationIds) {
    const meta = enrollingMeta.get(applicationId);
    if (!meta) continue;

    const progress = progressByApplicationId.get(applicationId);
    const familyWork = ensureFamily(meta.familyId);
    const enrollmentUrl = schoolSlug
      ? `${siteBase}/school/${schoolSlug}/apply/${applicationId}/enrollment`
      : applyDashboardUrl;

    familyWork.incompleteEnrollments.push({
      applicationId,
      label: meta.label,
      progressLabel: progress?.label ?? "In progress",
      updatedAt: meta.updatedAt,
      enrollmentUrl,
    });
  }

  return workByFamilyId;
}

function computeFamilyLastActivityAt(
  work: IncompleteAdmissionsFamilyWork,
): string | null {
  const timestamps = [
    ...work.draftApplications.map((item) => item.updatedAt),
    ...work.incompleteEnrollments.map((item) => item.updatedAt),
  ];
  return maxTimestamp(...timestamps);
}

export async function sendIncompleteAdmissionsReminders(
  supabase: SupabaseClient,
  organizationId: string,
  deps: ReminderDeps = {},
): Promise<number> {
  const sendEmail = deps.sendEmail ?? sendIncompleteAdmissionsReminderEmail;
  const notifyDiscord = deps.notifyDiscord ?? notifyIncompleteAdmissionsReminderSent;
  const loadWork = deps.loadIncompleteAdmissionsWork ?? loadIncompleteAdmissionsWork;
  const loadFamilyEmails =
    deps.loadFamilyNotificationEmails ?? loadFamilyNotificationEmails;
  const resolveSchoolContactEmails =
    deps.resolveApplicationNotificationEmails ?? resolveApplicationNotificationEmails;
  const resolveContact = deps.resolveApplicantContact ?? resolveApplicantContact;
  const checkRemindersEnabled =
    deps.isIncompleteAdmissionsRemindersEnabled ??
    isIncompleteAdmissionsRemindersEnabled;
  const now = deps.now ?? new Date();

  if (!(await checkRemindersEnabled(supabase, organizationId))) {
    return 0;
  }

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) throw orgError;

  const schoolName = String(org?.name ?? "Your school");
  const schoolSlug = String(org?.slug ?? "");

  const workByFamilyId = await loadWork(supabase, organizationId, schoolSlug);

  const { data: trackedFamilies, error: trackedFamiliesError } = await supabase
    .from("families")
    .select(
      "id, incomplete_admissions_reminder_count, incomplete_admissions_reminder_sent_at",
    )
    .eq("organization_id", organizationId)
    .gt("incomplete_admissions_reminder_count", 0);

  if (trackedFamiliesError) throw trackedFamiliesError;

  const familyIdsToProcess = new Set<string>(workByFamilyId.keys());
  for (const family of trackedFamilies ?? []) {
    familyIdsToProcess.add(String(family.id));
  }

  const schoolContactEmails = await resolveSchoolContactEmails(
    supabase,
    organizationId,
  );
  const schoolContactEmail = schoolContactEmails[0] ?? "";

  let sent = 0;

  for (const familyId of familyIdsToProcess) {
    const work = workByFamilyId.get(familyId);
    const hasIncompleteWork =
      (work?.draftApplications.length ?? 0) > 0 ||
      (work?.incompleteEnrollments.length ?? 0) > 0;

    const { data: familyRow, error: familyError } = await supabase
      .from("families")
      .select(
        "id, incomplete_admissions_reminder_count, incomplete_admissions_reminder_sent_at",
      )
      .eq("id", familyId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (familyError) throw familyError;
    if (!familyRow) continue;

    const family = familyRow as FamilyReminderRow;
    const reminderCount = Number(family.incomplete_admissions_reminder_count ?? 0);

    if (!hasIncompleteWork) {
      if (reminderCount > 0) {
        const { error: resetError } = await supabase
          .from("families")
          .update({
            incomplete_admissions_reminder_count: 0,
            incomplete_admissions_reminder_sent_at: null,
          })
          .eq("id", familyId)
          .eq("organization_id", organizationId);

        if (resetError) throw resetError;
      }
      continue;
    }

    if (!work) continue;

    const lastActivityAt = computeFamilyLastActivityAt(work);
    const lastSentAt = family.incomplete_admissions_reminder_sent_at;

    if (
      !isEligibleForIncompleteAdmissionsReminder({
        count: reminderCount,
        lastSentAt,
        lastActivityAt,
        now,
      })
    ) {
      continue;
    }

    const recipientEmails = await loadFamilyEmails(supabase, familyId);
    if (recipientEmails.length === 0) continue;

    const applicationIds = [
      ...work.draftApplications.map((item) => item.id),
      ...work.incompleteEnrollments.map((item) => item.applicationId),
    ];

    const { data: contactApplication, error: contactApplicationError } =
      await supabase
        .from("applications")
        .select("primary_guardian_id, created_by_user_id")
        .eq("organization_id", organizationId)
        .eq("family_id", familyId)
        .in("id", applicationIds)
        .limit(1)
        .maybeSingle();

    if (contactApplicationError) throw contactApplicationError;

    const contact = await resolveContact(supabase, {
      family_id: familyId,
      created_by_user_id: contactApplication?.created_by_user_id ?? null,
      primary_guardian_id: contactApplication?.primary_guardian_id ?? null,
    });

    const displayName = contact?.displayName || "there";
    const subject = buildIncompleteAdmissionsReminderSubject({
      schoolName,
      hasDraftApplications: work.draftApplications.length > 0,
      hasIncompleteEnrollments: work.incompleteEnrollments.length > 0,
    });

    const html = buildIncompleteAdmissionsReminderHtml({
      name: displayName,
      schoolName,
      contactEmail: schoolContactEmail,
      draftApplications: work.draftApplications,
      incompleteEnrollments: work.incompleteEnrollments,
      applyDashboardUrl: schoolSlug
        ? `${SITE_URL.replace(/\/$/, "")}/school/${schoolSlug}/apply`
        : SITE_URL,
    });

    const { data: claimedRows, error: claimError } = await supabase
      .from("families")
      .update({
        incomplete_admissions_reminder_count: reminderCount + 1,
        incomplete_admissions_reminder_sent_at: now.toISOString(),
      })
      .eq("id", familyId)
      .eq("organization_id", organizationId)
      .eq("incomplete_admissions_reminder_count", reminderCount)
      .select("id");

    if (claimError) throw claimError;
    if (!claimedRows?.length) continue;

    let delivered = false;
    for (const email of recipientEmails) {
      const result = await sendEmail({
        to: email,
        schoolName,
        subject,
        html,
      });
      if (result.ok) {
        delivered = true;
      } else {
        await logNotificationFailure(supabase, {
          organizationId,
          operation: "incomplete_admissions_reminder_email",
          error: `Failed to send incomplete admissions reminder to ${email}`,
          entityType: "family",
          entityId: familyId,
        });
      }
    }

    if (!delivered) {
      const { error: revertError } = await supabase
        .from("families")
        .update({
          incomplete_admissions_reminder_count: reminderCount,
          incomplete_admissions_reminder_sent_at: lastSentAt,
        })
        .eq("id", familyId)
        .eq("organization_id", organizationId)
        .eq("incomplete_admissions_reminder_count", reminderCount + 1);

      if (revertError) throw revertError;
      continue;
    }

    void notifyDiscord({
      schoolName,
      schoolSlug,
      familyId,
      reminderNumber: reminderCount + 1,
      contactName: displayName,
      recipientEmails,
      schoolContactEmail,
      draftApplicationTitles: work.draftApplications.map(
        (application) => application.formTitle,
      ),
      incompleteEnrollmentItems: work.incompleteEnrollments.map(
        (enrollment) => `${enrollment.label} (${enrollment.progressLabel})`,
      ),
      sentAt: now.toISOString(),
    }).catch((error) => {
      console.error("Incomplete admissions reminder Discord notification failed:", error);
    });

    sent += 1;
  }

  return sent;
}
