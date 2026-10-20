import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrganizationTimezone } from "@/lib/admissions/admissions-availability";
import { listScheduledVisitsForApplications } from "@/lib/admissions/admissions-booking";
import { resolveApplicantContact } from "@/lib/admissions/application-notifications";
import { extractStudentLabel } from "@/lib/admissions/application-submissions";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import {
  applicationHasPendingRequiredPostSubmit,
  isEligibleForPostSubmitRequiredReminder,
  listPendingRequiredPostSubmitActions,
} from "@/lib/admissions/post-submit-required-work";
import { notifyPostSubmitRequiredReminderSent } from "@/lib/discord";
import {
  buildEmailNotificationContext,
  buildPostSubmitRequiredReminderHtml,
  buildPostSubmitRequiredReminderSubject,
  sendPostSubmitRequiredReminderEmail,
} from "@/lib/emails";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import { SITE_URL } from "@/lib/site";

type ApplicationReminderRow = {
  id: string;
  family_id: string | null;
  submitted_at: string | null;
  responses: unknown;
  post_submit_reminder_count: number;
  post_submit_reminder_sent_at: string | null;
  application_form_versions:
    | { title?: string | null; post_submit_config?: unknown }
    | { title?: string | null; post_submit_config?: unknown }[]
    | null;
};

export type PostSubmitRequiredFamilyApplication = {
  applicationId: string;
  reminderCount: number;
  reminderSentAt: string | null;
  formTitle: string;
  studentLabel: string;
  stepTitles: string[];
};

export type PostSubmitRequiredFamilyWork = {
  familyId: string;
  applications: PostSubmitRequiredFamilyApplication[];
  reminderNumber: number;
};

type ReminderDeps = {
  sendEmail?: typeof sendPostSubmitRequiredReminderEmail;
  notifyDiscord?: typeof notifyPostSubmitRequiredReminderSent;
  listScheduledVisitsForApplications?: typeof listScheduledVisitsForApplications;
  loadFamilyNotificationEmails?: typeof loadFamilyNotificationEmails;
  resolveApplicantContact?: typeof resolveApplicantContact;
  getOrganizationTimezone?: typeof getOrganizationTimezone;
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
  joined: ApplicationReminderRow["application_form_versions"],
): string {
  if (!joined) return "your application";
  const row = Array.isArray(joined) ? joined[0] : joined;
  return String(row?.title ?? "your application").trim() || "your application";
}

function resolvePostSubmitConfig(
  joined: ApplicationReminderRow["application_form_versions"],
): unknown {
  if (!joined) return null;
  const row = Array.isArray(joined) ? joined[0] : joined;
  return row?.post_submit_config ?? null;
}

type ClaimedPostSubmitReminderApplication = {
  applicationId: string;
  previousCount: number;
  previousSentAt: string | null;
};

async function revertClaimedPostSubmitReminderApplications(
  supabase: SupabaseClient,
  organizationId: string,
  claimedApplications: ClaimedPostSubmitReminderApplication[],
): Promise<void> {
  for (const application of claimedApplications) {
    const { error: revertError } = await supabase
      .from("applications")
      .update({
        post_submit_reminder_count: application.previousCount,
        post_submit_reminder_sent_at: application.previousSentAt,
      })
      .eq("id", application.applicationId)
      .eq("organization_id", organizationId)
      .eq("post_submit_reminder_count", application.previousCount + 1);

    if (revertError) throw revertError;
  }
}

export async function sendPostSubmitRequiredReminders(
  supabase: SupabaseClient,
  organizationId: string,
  deps: ReminderDeps = {},
): Promise<number> {
  const sendEmail = deps.sendEmail ?? sendPostSubmitRequiredReminderEmail;
  const notifyDiscord = deps.notifyDiscord ?? notifyPostSubmitRequiredReminderSent;
  const listVisits =
    deps.listScheduledVisitsForApplications ?? listScheduledVisitsForApplications;
  const loadFamilyEmails =
    deps.loadFamilyNotificationEmails ?? loadFamilyNotificationEmails;
  const resolveContact = deps.resolveApplicantContact ?? resolveApplicantContact;
  const loadTimezone = deps.getOrganizationTimezone ?? getOrganizationTimezone;
  const now = deps.now ?? new Date();

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("name, slug")
    .eq("id", organizationId)
    .maybeSingle();

  if (orgError) throw orgError;

  const schoolName = String(org?.name ?? "Your school");
  const schoolSlug = String(org?.slug ?? "");
  const timezone = await loadTimezone(supabase, organizationId);
  const applyDashboardUrl = schoolSlug
    ? `${SITE_URL.replace(/\/$/, "")}/school/${schoolSlug}/apply`
    : SITE_URL.replace(/\/$/, "");

  const { data: applicationRows, error: applicationsError } = await supabase
    .from("applications")
    .select(
      `
        id,
        family_id,
        submitted_at,
        responses,
        post_submit_reminder_count,
        post_submit_reminder_sent_at,
        application_form_versions ( title, post_submit_config )
      `,
    )
    .eq("organization_id", organizationId)
    .neq("status", "draft")
    .not("submitted_at", "is", null)
    .not("family_id", "is", null);

  if (applicationsError) throw applicationsError;

  const rows = (applicationRows ?? []) as ApplicationReminderRow[];
  const applicationIds = rows.map((row) => String(row.id));
  const visits = await listVisits(supabase, applicationIds);

  const bookedActionIdsByApplicationId = new Map<string, Set<string>>();
  for (const visit of visits) {
    const applicationId = String(visit.applicationId);
    const existing = bookedActionIdsByApplicationId.get(applicationId) ?? new Set();
    existing.add(String(visit.postSubmitActionId));
    bookedActionIdsByApplicationId.set(applicationId, existing);
  }

  const workByFamilyId = new Map<string, PostSubmitRequiredFamilyWork>();

  for (const row of rows) {
    const applicationId = String(row.id);
    const familyId = row.family_id ? String(row.family_id) : "";
    if (!familyId) continue;

    const postSubmitConfig = resolvePostSubmitConfig(row.application_form_versions);
    const bookedActionIds = bookedActionIdsByApplicationId.get(applicationId) ?? new Set();
    const hasPendingRequired = applicationHasPendingRequiredPostSubmit(
      postSubmitConfig,
      bookedActionIds,
    );
    const reminderCount = Number(row.post_submit_reminder_count ?? 0);

    if (!hasPendingRequired) {
      if (reminderCount > 0) {
        const { error: resetError } = await supabase
          .from("applications")
          .update({
            post_submit_reminder_count: 0,
            post_submit_reminder_sent_at: null,
          })
          .eq("id", applicationId)
          .eq("organization_id", organizationId);

        if (resetError) throw resetError;
      }
      continue;
    }

    const submittedAt = row.submitted_at ? String(row.submitted_at) : null;
    if (
      !isEligibleForPostSubmitRequiredReminder({
        count: reminderCount,
        submittedAt,
        hasPendingRequired: true,
        now,
        timezone,
      })
    ) {
      continue;
    }

    const pendingSteps = listPendingRequiredPostSubmitActions(
      postSubmitConfig,
      bookedActionIds,
    );
    const responses = parseResponses(row.responses);
    const studentLabel =
      extractStudentLabel(responses) ?? "your student";

    const familyWork = workByFamilyId.get(familyId) ?? {
      familyId,
      applications: [],
      reminderNumber: 0,
    };

    const nextReminderNumber = reminderCount + 1;
    familyWork.reminderNumber = Math.max(
      familyWork.reminderNumber,
      nextReminderNumber,
    );
    familyWork.applications.push({
      applicationId,
      reminderCount,
      reminderSentAt: row.post_submit_reminder_sent_at
        ? String(row.post_submit_reminder_sent_at)
        : null,
      formTitle: resolveFormTitle(row.application_form_versions),
      studentLabel,
      stepTitles: pendingSteps.map((step) => step.title),
    });
    workByFamilyId.set(familyId, familyWork);
  }

  let sent = 0;

  for (const familyWork of workByFamilyId.values()) {
    const recipientEmails = await loadFamilyEmails(supabase, familyWork.familyId);
    if (recipientEmails.length === 0) continue;

    const claimedApplications: ClaimedPostSubmitReminderApplication[] = [];

    for (const application of familyWork.applications) {
      const { data: claimedRows, error: claimError } = await supabase
        .from("applications")
        .update({
          post_submit_reminder_count: application.reminderCount + 1,
          post_submit_reminder_sent_at: now.toISOString(),
        })
        .eq("id", application.applicationId)
        .eq("organization_id", organizationId)
        .eq("post_submit_reminder_count", application.reminderCount)
        .select("id");

      if (claimError) throw claimError;
      if (!claimedRows?.length) {
        continue;
      }

      claimedApplications.push({
        applicationId: application.applicationId,
        previousCount: application.reminderCount,
        previousSentAt: application.reminderSentAt,
      });
    }

    if (claimedApplications.length === 0) {
      continue;
    }

    const claimedApplicationIds = new Set(
      claimedApplications.map((application) => application.applicationId),
    );
    const emailedApplications = familyWork.applications.filter((application) =>
      claimedApplicationIds.has(application.applicationId),
    );
    const emailedReminderNumber = Math.max(
      ...emailedApplications.map(
        (application) => application.reminderCount + 1,
      ),
    );

    let delivered = false;
    let displayName = "there";

    try {
      const { data: contactApplication, error: contactApplicationError } =
        await supabase
          .from("applications")
          .select("primary_guardian_id, created_by_user_id")
          .eq("organization_id", organizationId)
          .eq("family_id", familyWork.familyId)
          .in(
            "id",
            claimedApplications.map((application) => application.applicationId),
          )
          .limit(1)
          .maybeSingle();

      if (contactApplicationError) throw contactApplicationError;

      const contact = await resolveContact(supabase, {
        family_id: familyWork.familyId,
        created_by_user_id: contactApplication?.created_by_user_id ?? null,
        primary_guardian_id: contactApplication?.primary_guardian_id ?? null,
      });

      displayName = contact?.displayName || "there";
      const subject = buildPostSubmitRequiredReminderSubject({
        schoolName,
        reminderNumber: emailedReminderNumber,
      });
      const html = buildPostSubmitRequiredReminderHtml({
        name: displayName,
        schoolName,
        applyDashboardUrl,
        reminderNumber: emailedReminderNumber,
        applications: emailedApplications.map((application) => ({
          label: application.studentLabel,
          formTitle: application.formTitle,
          stepTitles: application.stepTitles,
        })),
      });

      for (const email of recipientEmails) {
        const result = await sendEmail({
          to: email,
          schoolName,
          subject,
          html,
          notificationContext: buildEmailNotificationContext({
            organizationId,
            organizationSlug: schoolSlug,
            surface: "cron",
            entityType: "family",
            entityId: familyWork.familyId,
          }),
        });
        if (result.ok) {
          delivered = true;
        } else {
          await logNotificationFailure(supabase, {
            organizationId,
            operation: "post_submit_required_reminder_email",
            error: `Failed to send post-submit required reminder to ${email}`,
            entityType: "family",
            entityId: familyWork.familyId,
          });
        }
      }
    } catch (error) {
      await revertClaimedPostSubmitReminderApplications(
        supabase,
        organizationId,
        claimedApplications,
      );
      throw error;
    }

    if (!delivered) {
      await revertClaimedPostSubmitReminderApplications(
        supabase,
        organizationId,
        claimedApplications,
      );
      continue;
    }

    void notifyDiscord({
      schoolName,
      schoolSlug,
      familyId: familyWork.familyId,
      reminderNumber: emailedReminderNumber,
      contactName: displayName,
      recipientEmails,
      applicationSummaries: emailedApplications.map(
        (application) =>
          `${application.studentLabel} — ${application.formTitle}: ${application.stepTitles.join(", ")}`,
      ),
      sentAt: now.toISOString(),
    }).catch((error) => {
      void logNotificationFailure(supabase, {
        organizationId,
        operation: "post_submit_required_reminder.discord_notification",
        error,
        entityType: "family",
        entityId: familyWork.familyId,
      });
    });

    sent += 1;
  }

  return sent;
}
