import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
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

export async function sendGalleryPhotosUploadedExpoPush(
  admin: SupabaseClient,
  input: {
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    uploadBatchId: string;
    photoCount: number;
    uploaderName: string;
  },
  recipients?: ExpoPushRecipient[],
): Promise<void> {
  const pushRecipients =
    recipients ??
    (await resolveEnrolledFamilyGuardianPushRecipients(
      admin,
      input.organizationId,
      listAllEnrolledParentFamilyIds,
    ));

  if (pushRecipients.length === 0) return;

  const countLabel =
    input.photoCount === 1 ? "1 new photo" : `${input.photoCount} new photos`;
  const title = `${input.organizationName} — Photos`;
  const body = truncatePushBody(
    `${input.uploaderName.trim() || "Someone"} shared ${countLabel}`,
  );

  const results = await Promise.allSettled(
    pushRecipients.map((recipient) =>
      sendExpoPushToUsers(admin, {
        organizationId: input.organizationId,
        organizationName: input.organizationName,
        userIds: [recipient.userId],
        title,
        body,
        channelId: "gallery",
        recipientPortal: "parent",
        recipientEmail: recipient.email,
        notificationKind: "gallery.photos_uploaded",
        failureOperation: "gallery.photos_uploaded.expo_push",
        data: {
          kind: "gallery",
          portal: "parent",
          organizationSlug: input.organizationSlug,
          uploadBatchId: input.uploadBatchId,
        },
      }),
    ),
  );

  await logSettledNotificationFailures(
    admin,
    {
      organizationId: input.organizationId,
      operation: "gallery.photos_uploaded.expo_push",
      entityType: "school_gallery_upload_batch",
      entityId: input.uploadBatchId,
      metadata: { recipientCount: pushRecipients.length },
    },
    results,
  );
}
