import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyApplicationSubmitted } from "@/lib/discord";
import { sendApplicationSubmittedConfirmation } from "@/lib/emails";
import { SITE_URL } from "@/lib/site";

type ApplicantContact = {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
};

async function resolveApplicantContact(
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
