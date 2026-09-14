/**
 * Resend application-submitted notifications (Zoho email + Discord) for submitted applications.
 *
 * Usage:
 *   APPLICATION_ID=b9b46e4a-ec46-4f3f-a8d8-dee319f00e0c \
 *   npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-application-submitted-notification.ts
 *
 * Dry run (no send):
 *   DRY_RUN=1 APPLICATION_ID=... npx tsx --require ./src/test/integration/mock-server-only.cjs scripts/resend-application-submitted-notification.ts
 */

import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

const PRODUCTION_SITE_URL = "https://trymudkitchen.com";

function log(message: string) {
  console.log(`[resend-application-submitted-notification] ${message}`);
}

function ensureProductionSiteUrl(): string {
  const current = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (!current || current.includes("localhost")) {
    process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_SITE_URL;
  }
  return process.env.NEXT_PUBLIC_SITE_URL!;
}

function isDryRun(): boolean {
  const value = process.env.DRY_RUN?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function isZohoReady(): boolean {
  const disabled =
    process.env.DISABLE_OUTBOUND_EMAIL === "1" ||
    process.env.DISABLE_OUTBOUND_EMAIL === "true";
  if (disabled) return false;

  return !!(
    process.env.ZOHO_CLIENT_ID &&
    process.env.ZOHO_CLIENT_SECRET &&
    process.env.ZOHO_REDIRECT_URI &&
    process.env.ZOHO_REFRESH_TOKEN
  );
}

function parseApplicationIds(): string[] {
  const fromList = process.env.APPLICATION_IDS?.trim();
  if (fromList) {
    return fromList
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }

  const single = process.env.APPLICATION_ID?.trim();
  if (single) return [single];

  return [];
}

async function main() {
  const siteUrl = ensureProductionSiteUrl();
  log(`Using site URL: ${siteUrl}`);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error(
      "[resend-application-submitted-notification] Supabase credentials not configured in .env.local",
    );
    process.exit(1);
  }

  const applicationIds = parseApplicationIds();
  if (applicationIds.length === 0) {
    console.error(
      "[resend-application-submitted-notification] No application IDs provided (APPLICATION_ID or APPLICATION_IDS)",
    );
    process.exit(1);
  }

  const dryRun = isDryRun();
  if (dryRun) {
    log("DRY_RUN enabled — will not send notifications");
  } else if (!isZohoReady()) {
    console.error(
      "[resend-application-submitted-notification] Zoho email is not configured — emails would not send",
    );
    process.exit(1);
  }

  const { createAdminClient } = await import("@/utils/supabase/admin");
  const { sendApplicationSubmittedNotifications } = await import(
    "@/lib/admissions/application-notifications"
  );
  const { resolveApplicationNotificationEmails } = await import(
    "@/lib/notifications/org-notification-settings"
  );
  const { resolveApplicantContact } = await import(
    "@/lib/admissions/application-notifications"
  );
  const { schoolAdminPath } = await import(
    "@/lib/organization-settings/admin-routes"
  );

  const admin = createAdminClient();

  for (const applicationId of applicationIds) {
    const { data: application, error } = await admin
      .from("applications")
      .select(
        `
        id,
        status,
        submitted_at,
        organization_id,
        family_id,
        created_by_user_id,
        primary_guardian_id,
        application_form_versions (title)
      `,
      )
      .eq("id", applicationId)
      .maybeSingle();

    if (error) throw error;
    if (!application) {
      console.error(
        `[resend-application-submitted-notification] Application not found: ${applicationId}`,
      );
      process.exit(1);
    }

    if (application.status !== "submitted") {
      console.error(
        `[resend-application-submitted-notification] Application ${applicationId} is "${application.status}", not "submitted"`,
      );
      process.exit(1);
    }

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("name, slug")
      .eq("id", application.organization_id)
      .maybeSingle();

    if (orgError) throw orgError;
    if (!org?.slug) {
      console.error(
        `[resend-application-submitted-notification] Organization not found for application ${applicationId}`,
      );
      process.exit(1);
    }

    const notifyEmails = await resolveApplicationNotificationEmails(
      admin,
      String(application.organization_id),
    );
    const contact = await resolveApplicantContact(admin, application);

    const formVersion = application.application_form_versions as
      | { title?: string }
      | { title?: string }[]
      | null;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
    const submissionAdminUrl = `${siteUrl}${schoolAdminPath(String(org.slug), "admissions", "submissions")}?application=${applicationId}`;

    log(`Application: ${applicationId}`);
    log(`School: ${org.name} (${org.slug})`);
    log(`Form: ${form?.title ?? "Application"}`);
    log(`Submitted: ${application.submitted_at ?? "unknown"}`);
    log(
      `Admin recipients: ${notifyEmails.length > 0 ? notifyEmails.join(", ") : "(none)"}`,
    );
    log(
      `Parent recipients: ${contact?.emails.length ? contact.emails.join(", ") : "(none)"}`,
    );
    log(`Submission URL: ${submissionAdminUrl}`);

    if (notifyEmails.length === 0) {
      console.error(
        `[resend-application-submitted-notification] No admin notification recipients configured for org ${application.organization_id}`,
      );
      process.exit(1);
    }

    if (submissionAdminUrl.includes("localhost")) {
      console.error(
        `[resend-application-submitted-notification] Refusing to send with localhost URL: ${submissionAdminUrl}`,
      );
      process.exit(1);
    }

    if (!dryRun) {
      await sendApplicationSubmittedNotifications(admin, applicationId);
      log(`Sent application-submitted notifications for ${applicationId}`);
    }
  }

  log(dryRun ? "Dry run completed." : "All application-submitted notifications sent.");
}

void main().catch((error) => {
  console.error("[resend-application-submitted-notification] Failed:", error);
  process.exit(1);
});
