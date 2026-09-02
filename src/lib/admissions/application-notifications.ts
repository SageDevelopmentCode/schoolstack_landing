import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatDurationLabel,
  formatOrganizationTimezoneLabel,
  formatScheduledVisitWhenLabel,
  formatVisitDayCountLabel,
} from "@/lib/admissions/admissions-availability";
import type { ScheduledVisitRecord } from "@/lib/admissions/admissions-booking";
import {
  parseApplicationFormPostSubmitConfig,
} from "@/lib/admissions/application-form-schema";
import { extractStudentLabel, formatShortDate } from "@/lib/admissions/application-submissions";
import {
  POST_SUBMIT_ACTION_TEMPLATES,
  postSubmitActionLabel,
} from "@/lib/admissions/post-submit-templates";
import {
  logNotificationFailure,
  logSettledNotificationFailures,
} from "@/lib/admissions/notification-logging";
import { notifyApplicationSubmitted, notifyPostSubmitVisitScheduled } from "@/lib/discord";
import {
  sendApplicationAcceptedEnrollmentEmail,
  sendApplicationSubmittedConfirmation,
  sendApplicationSubmittedOwnerNotification,
  sendPostSubmitVisitConfirmation,
  sendPostSubmitVisitOwnerNotification,
} from "@/lib/emails";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import {
  resolveApplicationNotificationEmails,
  resolveVisitNotificationEmails,
} from "@/lib/notifications/org-notification-settings";
import { SITE_URL } from "@/lib/site";

export type ApplicantContact = {
  email: string;
  emails: string[];
  firstName?: string;
  lastName?: string;
  displayName: string;
};

export async function resolveApplicantContact(
  admin: SupabaseClient,
  application: {
    family_id: string | null;
    created_by_user_id: string | null;
    primary_guardian_id: string | null;
  },
): Promise<ApplicantContact | null> {
  let firstName = "";
  let lastName = "";
  let displayName = "";

  if (application.primary_guardian_id) {
    const { data: guardian, error } = await admin
      .from("guardians")
      .select("first_name, last_name, email")
      .eq("id", application.primary_guardian_id)
      .maybeSingle();

    if (error) throw error;
    if (guardian) {
      firstName = String(guardian.first_name ?? "").trim();
      lastName = String(guardian.last_name ?? "").trim();
      displayName =
        [firstName, lastName].filter(Boolean).join(" ") ||
        String(guardian.email ?? "").trim();
    }
  }

  if (!displayName && application.created_by_user_id) {
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(
      application.created_by_user_id,
    );

    if (userError) throw userError;
    const user = userData.user;
    if (user) {
      const metadata = user.user_metadata ?? {};
      firstName =
        typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
      lastName =
        typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";
      displayName =
        [firstName, lastName].filter(Boolean).join(" ") ||
        String(user.email ?? "").trim();
    }
  }

  const emails = application.family_id
    ? await loadFamilyNotificationEmails(admin, application.family_id)
    : [];

  if (emails.length === 0) {
    return null;
  }

  return {
    email: emails[0],
    emails,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    displayName: displayName || emails[0],
  };
}

export async function sendApplicationSubmittedNotifications(
  admin: SupabaseClient,
  applicationId: string,
): Promise<void> {
  let organizationId: string | undefined;
  try {
    const { data: application, error } = await admin
      .from("applications")
      .select(
        `
        id,
        submitted_at,
        responses,
        organization_id,
        family_id,
        created_by_user_id,
        primary_guardian_id,
        application_form_versions (title, notification_config),
        programs (name)
      `,
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (error) throw error;
    if (!application) {
      console.warn("Application submitted notifications: application not found", applicationId);
      return;
    }

    organizationId = String(application.organization_id);

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

    const formVersion = application.application_form_versions as
      | { title?: string; notification_config?: unknown }
      | { title?: string; notification_config?: unknown }[]
      | null;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
    const formTitle = form?.title ?? "Application";

    const program = application.programs as { name?: string } | { name?: string }[] | null;
    const programRow = Array.isArray(program) ? program[0] : program;
    const programName = programRow?.name ? String(programRow.name) : undefined;

    const schoolName = String(org.name);
    const schoolSlug = String(org.slug);
    const submittedAt = application.submitted_at
      ? String(application.submitted_at)
      : new Date().toISOString();
    const submittedAtLabel = formatShortDate(submittedAt);
    const applyDashboardUrl = `${SITE_URL}/school/${schoolSlug}/apply`;
    const submissionAdminUrl = `${SITE_URL}${schoolAdminPath(schoolSlug, "admissions", "submissions")}?application=${applicationId}`;

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

    const notifyEmails = await resolveApplicationNotificationEmails(
      admin,
      String(application.organization_id),
    );

    const notificationTasks: Promise<unknown>[] = [
      notifyApplicationSubmitted({
        schoolName,
        email: contact?.email ?? "unknown",
        applicationId,
        formTitle,
        firstName: contact?.firstName,
        lastName: contact?.lastName,
        submittedAt,
      }),
      ...notifyEmails.map((email) =>
        sendApplicationSubmittedOwnerNotification({
          email,
          schoolName,
          formTitle,
          studentName,
          contactName: contact?.displayName,
          contactEmail: contact?.email,
          programName,
          submittedAtLabel,
          submissionAdminUrl,
        }),
      ),
    ];

    if (contact) {
      for (const email of contact.emails) {
        notificationTasks.push(
          sendApplicationSubmittedConfirmation({
            name: contact.displayName,
            email,
            schoolName,
            formTitle,
            applyDashboardUrl,
          }),
        );
      }
    } else {
      console.warn("Application submitted notifications: no applicant contact", applicationId);
    }

    const notificationResults = await Promise.allSettled(notificationTasks);
    await logSettledNotificationFailures(admin, {
      organizationId: application.organization_id,
      operation: "application_submitted_notifications",
      entityType: "application",
      entityId: applicationId,
    }, notificationResults);
  } catch (error) {
    console.error("Application submitted notifications failed:", error);
    await logNotificationFailure(admin, {
      organizationId,
      operation: "application_submitted_notifications",
      entityType: "application",
      entityId: applicationId,
      error,
    });
  }
}

export async function sendApplicationAcceptedEnrollmentNotifications(
  admin: SupabaseClient,
  applicationId: string,
): Promise<void> {
  let organizationId: string | undefined;
  try {
    const { data: application, error } = await admin
      .from("applications")
      .select(
        `
        id,
        responses,
        organization_id,
        family_id,
        created_by_user_id,
        primary_guardian_id,
        application_form_versions (title),
        programs (name)
      `,
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (error) throw error;
    if (!application) {
      console.warn(
        "Application accepted enrollment notifications: application not found",
        applicationId,
      );
      return;
    }

    organizationId = String(application.organization_id);

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("name, slug")
      .eq("id", application.organization_id)
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org) {
      console.warn(
        "Application accepted enrollment notifications: organization not found",
        applicationId,
      );
      return;
    }

    const contact = await resolveApplicantContact(admin, application);
    if (!contact) {
      console.warn(
        "Application accepted enrollment notifications: no applicant contact",
        applicationId,
      );
      return;
    }

    const formVersion = application.application_form_versions as
      | { title?: string }
      | { title?: string }[]
      | null;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
    const formTitle = form?.title ?? "Application";

    const responses =
      application.responses &&
      typeof application.responses === "object" &&
      !Array.isArray(application.responses)
        ? (application.responses as Record<string, unknown>)
        : {};
    const stringResponses: Record<string, string> = {};
    for (const [key, value] of Object.entries(responses)) {
      if (typeof value === "string") stringResponses[key] = value;
      else if (value != null) stringResponses[key] = String(value);
    }
    const studentName = extractStudentLabel(stringResponses) ?? undefined;

    const schoolName = String(org.name);
    const schoolSlug = String(org.slug);
    const enrollmentChecklistUrl = `${SITE_URL}/school/${schoolSlug}/apply/${applicationId}/enrollment`;

    const notificationTasks = contact.emails.map((email) =>
      sendApplicationAcceptedEnrollmentEmail({
        name: contact.displayName,
        email,
        schoolName,
        formTitle,
        studentName,
        enrollmentChecklistUrl,
      }),
    );

    const notificationResults = await Promise.allSettled(notificationTasks);
    await logSettledNotificationFailures(
      admin,
      {
        organizationId: application.organization_id,
        operation: "application_accepted_enrollment_notifications",
        entityType: "application",
        entityId: applicationId,
      },
      notificationResults,
    );
  } catch (error) {
    console.error("Application accepted enrollment notifications failed:", error);
    await logNotificationFailure(admin, {
      organizationId,
      operation: "application_accepted_enrollment_notifications",
      entityType: "application",
      entityId: applicationId,
      error,
    });
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

function resolveVisitDurationLabel(booking: ScheduledVisitRecord): string {
  return booking.schedulingMode === "whole_day"
    ? formatVisitDayCountLabel(
        booking.visitDayCount ??
          Math.max(1, Math.round(booking.durationMinutes / (24 * 60))),
      )
    : formatDurationLabel(booking.durationMinutes);
}

export function buildPostSubmitVisitNotificationTasks(input: {
  booking: ScheduledVisitRecord;
  contact: ApplicantContact | null;
  notifyEmails: string[];
  schoolName: string;
  schoolSlug: string;
  stepTitle: string;
  timezoneLabel: string;
  applicationId: string;
  studentName?: string;
}): Array<() => Promise<unknown>> {
  const {
    booking,
    contact,
    notifyEmails,
    schoolName,
    schoolSlug,
    stepTitle,
    timezoneLabel,
    applicationId,
    studentName,
  } = input;

  const whenLabel = formatScheduledVisitWhenLabel(booking);
  const durationLabel = resolveVisitDurationLabel(booking);
  const applyDashboardUrl = `${SITE_URL}/school/${schoolSlug}/apply`;
  const submissionAdminUrl = `${SITE_URL}${schoolAdminPath(schoolSlug, "admissions", "submissions")}?application=${applicationId}`;

  const tasks: Array<() => Promise<unknown>> = [
    () =>
      notifyPostSubmitVisitScheduled({
        schoolName,
        email: contact?.email ?? "unknown",
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
        firstName: contact?.firstName,
        lastName: contact?.lastName,
        studentName,
      }),
    ...notifyEmails.map(
      (email) => () =>
        sendPostSubmitVisitOwnerNotification({
          email,
          schoolName,
          stepTitle,
          whenLabel,
          timezoneLabel,
          durationLabel,
          studentName,
          contactName: contact?.displayName,
          contactEmail: contact?.email,
          submissionAdminUrl,
        }),
    ),
  ];

  if (contact) {
    for (const email of contact.emails) {
      tasks.push(() =>
        sendPostSubmitVisitConfirmation({
          name: contact.displayName,
          email,
          schoolName,
          stepTitle,
          scheduledDate: booking.scheduledDate,
          endDate: booking.endDate,
          startTimeSlot: booking.startTimeSlot,
          schedulingMode: booking.schedulingMode,
          visitDayCount: booking.visitDayCount,
          timezoneLabel,
          durationMinutes: booking.durationMinutes,
          whenLabel,
          durationLabel,
          applyDashboardUrl,
        }),
      );
    }
  }

  return tasks;
}

export async function sendPostSubmitVisitScheduledNotifications(
  admin: SupabaseClient,
  applicationId: string,
  booking: ScheduledVisitRecord,
): Promise<void> {
  let organizationId: string | undefined;
  try {
    const { data: application, error } = await admin
      .from("applications")
      .select(
        `
        id,
        responses,
        organization_id,
        family_id,
        created_by_user_id,
        primary_guardian_id,
        application_form_versions (post_submit_config, notification_config)
      `,
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (error) throw error;
    if (!application) {
      console.warn("Post-submit visit notifications: application not found", applicationId);
      return;
    }

    organizationId = String(application.organization_id);

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
    }

    const formVersion = application.application_form_versions as
      | { post_submit_config?: unknown; notification_config?: unknown }
      | { post_submit_config?: unknown; notification_config?: unknown }[]
      | null;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
    const postSubmitConfig = parseApplicationFormPostSubmitConfig(form?.post_submit_config);
    const stepTitle = resolvePostSubmitStepTitle(postSubmitConfig, booking);

    const schoolName = String(org.name);
    const schoolSlug = String(org.slug);
    const timezone = typeof org.timezone === "string" ? org.timezone : "America/Chicago";
    const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

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
    const notifyEmails = await resolveVisitNotificationEmails(
      admin,
      organizationId,
    );

    const notificationTasks = buildPostSubmitVisitNotificationTasks({
      booking,
      contact,
      notifyEmails,
      schoolName,
      schoolSlug,
      stepTitle,
      timezoneLabel,
      applicationId,
      studentName,
    });

    if (notificationTasks.length === 0) {
      console.warn("Post-submit visit notifications: no notification tasks", applicationId);
      return;
    }

    const notificationResults = await Promise.allSettled(
      notificationTasks.map((task) => task()),
    );
    await logSettledNotificationFailures(admin, {
      organizationId: application.organization_id,
      operation: "post_submit_visit_notifications",
      entityType: "application",
      entityId: applicationId,
    }, notificationResults);
  } catch (error) {
    console.error("Post-submit visit notifications failed:", error);
    await logNotificationFailure(admin, {
      organizationId,
      operation: "post_submit_visit_notifications",
      entityType: "application",
      entityId: applicationId,
      error,
    });
  }
}

export async function sendPreApplicationCampusTourAdminNotifications(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    booking: ScheduledVisitRecord;
  },
): Promise<void> {
  try {
    const notifyEmails = await resolveVisitNotificationEmails(
      admin,
      input.organizationId,
    );
    if (notifyEmails.length === 0) {
      return;
    }

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("name, slug, timezone")
      .eq("id", input.organizationId)
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org?.slug) {
      console.warn(
        "Pre-application tour notifications: organization not found",
        input.organizationId,
      );
      return;
    }

    const { data: family, error: familyError } = await admin
      .from("families")
      .select("name, primary_email")
      .eq("id", input.familyId)
      .maybeSingle();

    if (familyError) throw familyError;

    const emails = await loadFamilyNotificationEmails(admin, input.familyId);
    const contactEmail =
      emails[0] ?? (family?.primary_email ? String(family.primary_email) : undefined);

    const schoolName = String(org.name);
    const schoolSlug = String(org.slug);
    const timezone =
      typeof org.timezone === "string" ? org.timezone : "America/Chicago";
    const timezoneLabel = formatOrganizationTimezoneLabel(timezone);
    const whenLabel = formatScheduledVisitWhenLabel(input.booking);
    const durationLabel = resolveVisitDurationLabel(input.booking);
    const scheduleAdminUrl = `${SITE_URL}${schoolAdminPath(schoolSlug, "schedule")}`;

    await Promise.allSettled(
      notifyEmails.map((email) =>
        sendPostSubmitVisitOwnerNotification({
          email,
          schoolName,
          stepTitle: "Campus tour",
          whenLabel,
          timezoneLabel,
          durationLabel,
          contactName: family?.name ? String(family.name) : undefined,
          contactEmail,
          submissionAdminUrl: scheduleAdminUrl,
        }),
      ),
    );
  } catch (error) {
    console.error("Pre-application tour admin notifications failed:", error);
  }
}
