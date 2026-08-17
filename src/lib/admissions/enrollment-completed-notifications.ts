import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveApplicantContact } from "@/lib/admissions/application-notifications";
import {
  logNotificationFailure,
  logSettledNotificationFailures,
} from "@/lib/admissions/notification-logging";
import { sendEnrollmentCompletedConfirmation } from "@/lib/emails";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import {
  isParentPortalEnabled,
  schoolParentPath,
} from "@/lib/organization-settings/parent-routes";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { SITE_URL } from "@/lib/site";

export async function sendEnrollmentCompletedNotifications(
  admin: SupabaseClient,
  input: {
    applicationId: string;
    enrollmentId: string;
  },
): Promise<void> {
  try {
    const { data: application, error: applicationError } = await admin
      .from("applications")
      .select(
        `
        id,
        organization_id,
        family_id,
        student_id,
        primary_guardian_id,
        created_by_user_id,
        students (first_name, last_name),
        programs (name)
      `,
      )
      .eq("id", input.applicationId)
      .maybeSingle();

    if (applicationError) throw applicationError;
    if (!application?.family_id) {
      console.warn(
        "Enrollment completed notifications: application or family not found",
        input.applicationId,
      );
      return;
    }

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("name, slug, features")
      .eq("id", application.organization_id)
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org?.slug) {
      console.warn(
        "Enrollment completed notifications: organization not found",
        input.applicationId,
      );
      return;
    }

    const emails = await loadFamilyNotificationEmails(
      admin,
      String(application.family_id),
    );
    if (emails.length === 0) {
      console.warn(
        "Enrollment completed notifications: no family email",
        input.applicationId,
      );
      return;
    }

    const contact = await resolveApplicantContact(admin, {
      family_id: String(application.family_id),
      created_by_user_id: application.created_by_user_id
        ? String(application.created_by_user_id)
        : null,
      primary_guardian_id: application.primary_guardian_id
        ? String(application.primary_guardian_id)
        : null,
    });

    const student = application.students as
      | { first_name?: string; last_name?: string }
      | { first_name?: string; last_name?: string }[]
      | null;
    const studentRow = Array.isArray(student) ? student[0] : student;
    const studentFirstName = String(studentRow?.first_name ?? "").trim();
    const studentLastName = String(studentRow?.last_name ?? "").trim();
    const studentName =
      [studentFirstName, studentLastName].filter(Boolean).join(" ") || "Student";

    const program = application.programs as
      | { name?: string }
      | { name?: string }[]
      | null;
    const programRow = Array.isArray(program) ? program[0] : program;
    const programName = programRow?.name ? String(programRow.name) : undefined;

    const features = (org.features ?? {}) as OrganizationFeatures;
    const parentPortalEnabled = isParentPortalEnabled(features);
    const schoolSlug = String(org.slug);
    const parentPortalUrl = parentPortalEnabled
      ? `${SITE_URL}${schoolParentPath(schoolSlug, "portal")}`
      : `${SITE_URL}/school/${schoolSlug}/apply`;
    const schoolName = String(org.name);
    const displayName = contact?.displayName ?? "Family";

    const notificationResults = await Promise.allSettled(
      emails.map((email) =>
        sendEnrollmentCompletedConfirmation({
          name: displayName,
          email,
          schoolName,
          studentName,
          programName,
          parentPortalUrl,
          parentPortalEnabled,
        }),
      ),
    );

    await logSettledNotificationFailures(
      admin,
      {
        organizationId: String(application.organization_id),
        operation: "enrollment_completed_notifications",
        entityType: "enrollment",
        entityId: input.enrollmentId,
        metadata: { applicationId: input.applicationId },
      },
      notificationResults,
    );
  } catch (error) {
    console.error("Enrollment completed notifications failed:", error);
    await logNotificationFailure(admin, {
      operation: "enrollment_completed_notifications",
      entityType: "enrollment",
      entityId: input.enrollmentId,
      error,
      metadata: { applicationId: input.applicationId },
    });
  }
}
