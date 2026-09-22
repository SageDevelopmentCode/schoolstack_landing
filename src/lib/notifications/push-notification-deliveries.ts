import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyMobilePushNotificationDelivered } from "@/lib/discord";
import { reportOperationalError } from "@/lib/operational-errors";

export type PushDeliveryStatus = "sent" | "failed" | "skipped_no_token";

export type PushDeliveryInput = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  recipientUserId: string;
  recipientPortal: "parent" | "teacher" | "admin";
  recipientEmail?: string | null;
  title: string;
  body: string;
  threadId?: string | null;
  status: PushDeliveryStatus;
  expoTicketId?: string | null;
  errorMessage?: string | null;
};

type LogPushNotificationDeliveryOptions = {
  notifyDelivered?: (input: PushDeliveryInput) => Promise<void>;
};

async function notifyPushDeliveryDiscord(
  input: PushDeliveryInput,
  notifyDelivered: (input: PushDeliveryInput) => Promise<void>,
): Promise<void> {
  if (!input.organizationName.trim() || !input.organizationSlug.trim()) {
    return;
  }

  try {
    await notifyDelivered(input);
  } catch (error) {
    console.error("Failed to send mobile push delivery Discord notification.", error);
  }
}

export async function logPushNotificationDelivery(
  admin: SupabaseClient,
  input: PushDeliveryInput,
  options?: LogPushNotificationDeliveryOptions,
): Promise<void> {
  const notifyDelivered =
    options?.notifyDelivered ?? notifyMobilePushNotificationDelivered;

  try {
    const { error } = await admin.from("push_notification_deliveries").insert({
      organization_id: input.organizationId,
      recipient_user_id: input.recipientUserId,
      recipient_portal: input.recipientPortal,
      recipient_email: input.recipientEmail ?? null,
      channel: "expo_push",
      status: input.status,
      title: input.title,
      body: input.body,
      thread_id: input.threadId ?? null,
      expo_ticket_id: input.expoTicketId ?? null,
      error_message: input.errorMessage ?? null,
    });

    if (error) {
      throw error;
    }

    await notifyPushDeliveryDiscord(input, notifyDelivered);
  } catch (error) {
    await reportOperationalError({
      supabase: admin,
      surface: "system",
      operation: "push_notification_delivery.log",
      organizationId: input.organizationId,
      error: "Failed to record push notification delivery.",
      notify: false,
      actor: { type: "system" },
      cause: error,
      metadata: {
        recipientUserId: input.recipientUserId,
        status: input.status,
        threadId: input.threadId ?? null,
      },
    });
  }
}
