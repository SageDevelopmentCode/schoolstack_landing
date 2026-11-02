import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import {
  buildEmailNotificationContext,
  sendNewsletterPublishedEmail,
} from "@/lib/emails";
import { weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import type { NewsletterEdition } from "@/lib/school-admin/newsletter/newsletter-types";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import { mergeFeatures } from "@/lib/organization-settings/merge";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import { reportOperationalError } from "@/lib/operational-errors";
import { listAllEnrolledParentFamilyIds } from "@/lib/school-bulletin/bulletin-notification-audience";
import { getRuntimeSiteUrl } from "@/lib/site";
import { sendNewsletterPublishedExpoPushForEdition } from "./newsletter-expo-push";

type OrganizationNewsletterContext = {
  schoolName: string;
  schoolSlug: string;
  newslettersEnabled: boolean;
};

async function loadOrganizationNewsletterContext(
  admin: SupabaseClient,
  organizationId: string,
): Promise<OrganizationNewsletterContext | null> {
  const { data: org, error } = await admin
    .from("organizations")
    .select(
      `
      name,
      slug,
      organization_settings (
        features
      )
    `,
    )
    .eq("id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!org?.slug) return null;

  const settings = org.organization_settings as
    | { features?: Record<string, unknown> }
    | { features?: Record<string, unknown> }[]
    | null;
  const settingsRow = Array.isArray(settings) ? settings[0] : settings;
  const features = mergeFeatures(
    settingsRow?.features as Record<string, unknown> | null | undefined,
  );

  return {
    schoolName: String(org.name ?? "Your school"),
    schoolSlug: String(org.slug),
    newslettersEnabled: features.parent.newsletters === true,
  };
}

export type SendNewsletterPublishedNotificationsInput = {
  organizationId: string;
  edition: NewsletterEdition;
};

export async function sendNewsletterPublishedNotifications(
  admin: SupabaseClient,
  input: SendNewsletterPublishedNotificationsInput,
): Promise<{ emailsAttempted: number; emailsSucceeded: number }> {
  const org = await loadOrganizationNewsletterContext(admin, input.organizationId);
  if (!org?.newslettersEnabled) {
    return { emailsAttempted: 0, emailsSucceeded: 0 };
  }

  void sendNewsletterPublishedExpoPushForEdition(admin, {
    organizationId: input.organizationId,
    organizationName: org.schoolName,
    organizationSlug: org.schoolSlug,
    edition: input.edition,
  }).catch((err) => {
    void reportOperationalError({
      supabase: admin,
      surface: "system",
      organizationId: input.organizationId,
      operation: "newsletter.published.expo_push",
      error:
        err instanceof Error
          ? err.message
          : "Failed to send newsletter published push notifications.",
      entityType: "school_newsletter_edition",
      entityId: input.edition.id,
      actor: { type: "system" },
      cause: err,
    });
  });

  const familyIds = await listAllEnrolledParentFamilyIds(admin, input.organizationId);
  if (familyIds.length === 0) {
    return { emailsAttempted: 0, emailsSucceeded: 0 };
  }

  const week = weekLabel(input.edition);
  const newsletterUrl = `${getRuntimeSiteUrl()}${schoolParentPath(org.schoolSlug, "newsletters")}?edition=${encodeURIComponent(input.edition.id)}`;
  const emailNotificationContext = buildEmailNotificationContext({
    organizationId: input.organizationId,
    organizationSlug: org.schoolSlug,
    surface: "web",
    entityType: "school_newsletter_edition",
    entityId: input.edition.id,
  });

  const emailSendPromises: Promise<{ ok: boolean }>[] = [];
  const seenEmails = new Set<string>();

  for (const familyId of familyIds) {
    const emails = await loadFamilyNotificationEmails(admin, familyId);
    for (const email of emails) {
      const normalized = email.trim().toLowerCase();
      if (!normalized || seenEmails.has(normalized)) continue;
      seenEmails.add(normalized);
      emailSendPromises.push(
        sendNewsletterPublishedEmail({
          to: normalized,
          schoolName: org.schoolName,
          editionTitle: input.edition.title.trim() || "Weekly newsletter",
          weekLabel: week,
          newsletterUrl,
          notificationContext: emailNotificationContext,
        }),
      );
    }
  }

  if (emailSendPromises.length === 0) {
    return { emailsAttempted: 0, emailsSucceeded: 0 };
  }

  const emailResults = await Promise.allSettled(emailSendPromises);
  await logSettledNotificationFailures(
    admin,
    {
      organizationId: input.organizationId,
      operation: "school_newsletter_published_email",
      entityType: "school_newsletter_edition",
      entityId: input.edition.id,
    },
    emailResults,
  );

  const emailsSucceeded = emailResults.filter(
    (result) => result.status === "fulfilled" && result.value.ok,
  ).length;

  return { emailsAttempted: emailSendPromises.length, emailsSucceeded };
}
