import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import type { NewsletterEdition } from "@/lib/school-admin/newsletter/newsletter-types";
import { sendExpoPushToUsers } from "@/lib/notifications/expo-push";
import {
  resolveEnrolledFamilyGuardianPushRecipients,
  type ExpoPushRecipient,
} from "@/lib/notifications/push-recipients";
import { listAllEnrolledParentFamilyIds } from "@/lib/school-bulletin/bulletin-notification-audience";

function truncatePushBody(text: string, maxLength = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export async function sendNewsletterPublishedExpoPush(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    edition: Pick<NewsletterEdition, "id" | "title" | "week" | "weekEnd">;
  },
  recipients: ExpoPushRecipient[],
): Promise<void> {
  if (recipients.length === 0) return;

  const title = `${input.organizationName} — Newsletter`;
  const week = weekLabel(input.edition as NewsletterEdition);
  const body = truncatePushBody(
    input.edition.title.trim() ? `${input.edition.title.trim()} · ${week}` : week,
  );

  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      sendExpoPushToUsers(admin, {
        organizationId: input.organizationId,
        organizationName: input.organizationName,
        userIds: [recipient.userId],
        title,
        body,
        channelId: "bulletin",
        recipientPortal: recipient.portal,
        recipientEmail: recipient.email,
        notificationKind: "newsletter.published",
        failureOperation: "newsletter.published.expo_push",
        data: {
          kind: "newsletter",
          portal: "parent",
          organizationSlug: input.organizationSlug,
          editionId: input.edition.id,
        },
      }),
    ),
  );

  await logSettledNotificationFailures(
    admin,
    {
      organizationId: input.organizationId,
      operation: "newsletter.published.expo_push",
      entityType: "school_newsletter_edition",
      entityId: input.edition.id,
      metadata: { recipientCount: recipients.length },
    },
    results,
  );
}

export async function sendNewsletterPublishedExpoPushForEdition(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    edition: Pick<NewsletterEdition, "id" | "title" | "week" | "weekEnd">;
  },
): Promise<void> {
  const recipients = await resolveEnrolledFamilyGuardianPushRecipients(
    admin,
    input.organizationId,
    listAllEnrolledParentFamilyIds,
  );
  await sendNewsletterPublishedExpoPush(admin, input, recipients);
}
