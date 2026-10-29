import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import { truncateBulletinBodyExcerpt } from "@/lib/emails";
import { sendExpoPushToUsers } from "@/lib/notifications/expo-push";
import {
  resolveBulletinPushRecipients,
  type ExpoPushRecipient,
} from "@/lib/notifications/push-recipients";
import type { BulletinPost } from "@/lib/school-bulletin/types";

function truncatePushBody(text: string, maxLength = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

export async function sendBulletinPublishedExpoPush(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    post: Pick<BulletinPost, "id" | "title" | "body" | "audiences" | "programIds">;
  },
  recipients: ExpoPushRecipient[],
): Promise<void> {
  if (recipients.length === 0) return;

  const title = `${input.organizationName} — Bulletin`;
  const body = truncatePushBody(
    input.post.title.trim() || truncateBulletinBodyExcerpt(input.post.body),
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
        notificationKind: "bulletin.published",
        failureOperation: "bulletin.published.expo_push",
        data: {
          kind: "bulletin",
          portal: recipient.portal,
          organizationSlug: input.organizationSlug,
          postId: input.post.id,
        },
      }),
    ),
  );

  await logSettledNotificationFailures(
    admin,
    {
      organizationId: input.organizationId,
      operation: "bulletin.published.expo_push",
      entityType: "school_bulletin_post",
      entityId: input.post.id,
      metadata: { recipientCount: recipients.length },
    },
    results,
  );
}

export async function sendBulletinPublishedExpoPushForPost(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    post: Pick<BulletinPost, "id" | "title" | "body" | "audiences" | "programIds">;
  },
): Promise<void> {
  const recipients = await resolveBulletinPushRecipients(
    admin,
    input.organizationId,
    input.post.audiences,
    input.post.programIds,
  );
  await sendBulletinPublishedExpoPush(admin, input, recipients);
}
