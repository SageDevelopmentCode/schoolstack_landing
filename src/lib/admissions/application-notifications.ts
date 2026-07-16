import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatDurationLabel,
  formatOrganizationTimezoneLabel,
  formatScheduledVisitWhenLabel,
  formatVisitDayCountLabel,
} from "@/lib/admissions/admissions-availability";
import type { ScheduledVisitRecord } from "@/lib/admissions/admissions-booking";
import { parseApplicationFormPostSubmitConfig } from "@/lib/admissions/application-form-schema";
import { extractStudentLabel } from "@/lib/admissions/application-submissions";
import {
  POST_SUBMIT_ACTION_TEMPLATES,
  postSubmitActionLabel,
} from "@/lib/admissions/post-submit-templates";
import { notifyApplicationSubmitted, notifyPostSubmitVisitScheduled } from "@/lib/discord";
import {
  sendApplicationSubmittedConfirmation,
  sendPostSubmitVisitConfirmation,
} from "@/lib/emails";
import { SITE_URL } from "@/lib/site";

export type ApplicantContact = {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
};

export async function resolveApplicantContact(
  admin: SupabaseClient,
  application: {
    created_by_user_id: string | null;
    primary_guardian_id: string | null;
  },
): Promise<ApplicantContact | null> {
  if (application.primary_guardian_id) {
    const { data: guardian, error } = await admin
      .from("guardians")
      .select("first_name, last_name, email")
      .eq("id", application.primary_guardian_id)
      .maybeSingle();

    if (error) throw error;
    if (guardian?.email) {
      const firstName = String(guardian.first_name ?? "").trim();
      const lastName = String(guardian.last_name ?? "").trim();
      return {
        email: String(guardian.email).trim().toLowerCase(),
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        displayName: [firstName, lastName].filter(Boolean).join(" ") || guardian.email,
      };
    }
  }

  if (!application.created_by_user_id) {
    return null;
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(
    application.created_by_user_id,
  );

  if (userError) throw userError;
  const user = userData.user;
  if (!user?.email) return null;

  const metadata = user.user_metadata ?? {};
  const firstName =
    typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const lastName =
    typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";

  return {
    email: user.email.trim().toLowerCase(),
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    displayName: [firstName, lastName].filter(Boolean).join(" ") || user.email,
  };
}

export async function sendApplicationSubmittedNotifications(
  admin: SupabaseClient,
  applicationId: string,
): Promise<void> {
  try {
    const { data: application, error } = await admin
      .from("applications")
      .select(
        `
        id,
        submitted_at,
        organization_id,
        created_by_user_id,
        primary_guardian_id,
        application_form_versions (title)
      `,
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (error) throw error;
    if (!application) {
      console.warn("Application submitted notifications: application not found", applicationId);
      return;
    }

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("name, slug")
      .eq("id", application.organization_id)
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org) {
      console.warn("Application submitted notifications: organization not found", applicationId);
      return;
    }

    const contact = await resolveApplicantContact(admin, application);
    if (!contact) {
      console.warn("Application submitted notifications: no applicant contact", applicationId);
      return;
    }

    const formVersion = application.application_form_versions as
      | { title?: string }
      | { title?: string }[]
      | null;
    const formTitle =
      (Array.isArray(formVersion) ? formVersion[0]?.title : formVersion?.title) ??
      "Application";

    const schoolName = String(org.name);
    const schoolSlug = String(org.slug);
    const submittedAt = application.submitted_at
      ? String(application.submitted_at)
      : new Date().toISOString();
    const applyDashboardUrl = `${SITE_URL}/school/${schoolSlug}/apply`;

    await Promise.allSettled([
      notifyApplicationSubmitted({
        schoolName,
        email: contact.email,
        applicationId,
        formTitle,
        firstName: contact.firstName,
        lastName: contact.lastName,
        submittedAt,
      }),
      sendApplicationSubmittedConfirmation({
        name: contact.displayName,
        email: contact.email,
        schoolName,
        formTitle,
        applyDashboardUrl,
      }),
    ]);
  } catch (error) {
    console.error("Application submitted notifications failed:", error);
  }
}

function resolvePostSubmitStepTitle(
  postSubmitConfig: ReturnType<typeof parseApplicationFormPostSubmitConfig>,
  booking: ScheduledVisitRecord,
): string {
  const action = postSubmitConfig.actions.find(
    (entry) => entry.id === booking.postSubmitActionId,
  );
  if (action) {
    return postSubmitActionLabel(action);
  }
  return POST_SUBMIT_ACTION_TEMPLATES[booking.actionType]?.label ?? "Scheduled visit";
}

export async function sendPostSubmitVisitScheduledNotifications(
  admin: SupabaseClient,
  applicationId: string,
  booking: ScheduledVisitRecord,
): Promise<void> {
  try {
    const { data: application, error } = await admin
      .from("applications")
      .select(
        `
        id,
        responses,
        organization_id,
        created_by_user_id,
        primary_guardian_id,
        application_form_versions (post_submit_config)
      `,
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (error) throw error;
    if (!application) {
      console.warn("Post-submit visit notifications: application not found", applicationId);
      return;
    }

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("name, slug, timezone")
      .eq("id", application.organization_id)
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org) {
      console.warn("Post-submit visit notifications: organization not found", applicationId);
      return;
    }

    const contact = await resolveApplicantContact(admin, application);
    if (!contact) {
      console.warn("Post-submit visit notifications: no applicant contact", applicationId);
      return;
    }

    const formVersion = application.application_form_versions as
      | { post_submit_config?: unknown }
      | { post_submit_config?: unknown }[]
      | null;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
    const postSubmitConfig = parseApplicationFormPostSubmitConfig(form?.post_submit_config);
    const stepTitle = resolvePostSubmitStepTitle(postSubmitConfig, booking);

    const schoolName = String(org.name);
    const schoolSlug = String(org.slug);
    const timezone = typeof org.timezone === "string" ? org.timezone : "America/Chicago";
    const timezoneLabel = formatOrganizationTimezoneLabel(timezone);
    const applyDashboardUrl = `${SITE_URL}/school/${schoolSlug}/apply`;

    const responses =
      application.responses && typeof application.responses === "object" && !Array.isArray(application.responses)
        ? (application.responses as Record<string, unknown>)
        : {};
    const stringResponses: Record<string, string> = {};
    for (const [key, value] of Object.entries(responses)) {
      if (typeof value === "string") stringResponses[key] = value;
      else if (value != null) stringResponses[key] = String(value);
    }
    const studentName = extractStudentLabel(stringResponses) ?? undefined;

    await Promise.allSettled([
      notifyPostSubmitVisitScheduled({
        schoolName,
        email: contact.email,
        applicationId,
        actionType: booking.actionType,
        stepTitle,
        scheduledDate: booking.scheduledDate,
        endDate: booking.endDate,
        startTimeSlot: booking.startTimeSlot,
        schedulingMode: booking.schedulingMode,
        visitDayCount: booking.visitDayCount,
        visitDates: booking.visitDates,
        timezoneLabel,
        firstName: contact.firstName,
        lastName: contact.lastName,
        studentName,
      }),
      sendPostSubmitVisitConfirmation({
        name: contact.displayName,
        email: contact.email,
        schoolName,
        stepTitle,
        scheduledDate: booking.scheduledDate,
        endDate: booking.endDate,
        startTimeSlot: booking.startTimeSlot,
        schedulingMode: booking.schedulingMode,
        visitDayCount: booking.visitDayCount,
        timezoneLabel,
        durationMinutes: booking.durationMinutes,
        whenLabel: formatScheduledVisitWhenLabel(booking),
        durationLabel:
          booking.schedulingMode === "whole_day"
            ? formatVisitDayCountLabel(
                booking.visitDayCount ??
                  Math.max(1, Math.round(booking.durationMinutes / (24 * 60))),
              )
            : formatDurationLabel(booking.durationMinutes),
        applyDashboardUrl,
      }),
    ]);
  } catch (error) {
    console.error("Post-submit visit notifications failed:", error);
  }
}
