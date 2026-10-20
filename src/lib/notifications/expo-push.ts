import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logSettledNotificationFailures } from "@/lib/admissions/notification-logging";
import type { CommitteeWorkspaceSection } from "@/lib/committees/types";
import { logPushNotificationDelivery } from "@/lib/notifications/push-notification-deliveries";

export type ExpoPushPortal = "parent" | "teacher" | "admin";

export type ExpoPushChannelId = "messages" | "committees";

export type MessageExpoPushData = {
  kind: "message";
  portal: ExpoPushPortal;
  organizationSlug: string;
  threadId: string;
};

export type CommitteeExpoPushData = {
  kind: "committee";
  portal: ExpoPushPortal;
  organizationSlug: string;
  committeeId: string;
  section?: CommitteeWorkspaceSection;
  /** When set, mobile opens the committees list (e.g. join request for admins). */
  intent?: "join_request";
};

export type ExpoPushData = MessageExpoPushData | CommitteeExpoPushData;

export type ExpoPushPayload = {
  organizationId: string;
  organizationName: string;
  userIds: string[];
  title: string;
  body: string;
  channelId?: ExpoPushChannelId;
  recipientPortal?: ExpoPushPortal;
  recipientEmail?: string | null;
  data: ExpoPushData;
  /** Overrides default operation name for failure logging */
  failureOperation?: string;
};

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  channelId: ExpoPushChannelId;
  data: ExpoPushData;
};

type ExpoPushTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
};

type ExpoPushTokenRow = {
  user_id: string;
  push_token: string;
};

function getExpoAccessToken(): string | null {
  const token = process.env.EXPO_ACCESS_TOKEN?.trim() ?? "";
  return token || null;
}

function isStaleExpoTokenError(ticket: ExpoPushTicket): boolean {
  if (ticket.status !== "error") return false;
  const errorCode = ticket.details?.error ?? ticket.message ?? "";
  return (
    errorCode === "DeviceNotRegistered" ||
    errorCode.includes("InvalidCredentials") ||
    errorCode.includes("Unable to retrieve the FCM server key")
  );
}

function resolveChannelId(payload: ExpoPushPayload): ExpoPushChannelId {
  if (payload.channelId) return payload.channelId;
  return payload.data.kind === "committee" ? "committees" : "messages";
}

function resolveRecipientPortal(payload: ExpoPushPayload): ExpoPushPortal {
  return payload.recipientPortal ?? payload.data.portal;
}

function resolveDeliveryThreadId(data: ExpoPushData): string | null {
  if (data.kind === "message") return data.threadId;
  return null;
}

function buildDeliveryBase(payload: ExpoPushPayload, recipientUserId: string) {
  return {
    organizationId: payload.organizationId,
    organizationName: payload.organizationName,
    organizationSlug: payload.data.organizationSlug,
    recipientUserId,
    recipientPortal: resolveRecipientPortal(payload),
    recipientEmail: payload.recipientEmail ?? null,
    title: payload.title,
    body: payload.body,
    threadId: resolveDeliveryThreadId(payload.data),
  };
}

function resolveFailureOperation(payload: ExpoPushPayload): string {
  if (payload.failureOperation) return payload.failureOperation;
  return payload.data.kind === "committee"
    ? "committees.expo_push_delivery"
    : "messages.expo_push_delivery";
}

export async function sendExpoPushToUsers(
  admin: SupabaseClient,
  payload: ExpoPushPayload,
): Promise<void> {
  if (payload.userIds.length === 0) return;

  const channelId = resolveChannelId(payload);

  const { data: tokens, error } = await admin
    .from("expo_push_tokens")
    .select("user_id, push_token")
    .in("user_id", payload.userIds);
  if (error) {
    throw new Error(error.message);
  }

  const tokenRows = (tokens ?? []) as ExpoPushTokenRow[];
  const userIdsWithTokens = new Set(
    tokenRows.map((row) => String(row.user_id)),
  );

  await Promise.all(
    payload.userIds.map(async (userId) => {
      if (userIdsWithTokens.has(userId)) return;

      await logPushNotificationDelivery(admin, {
        ...buildDeliveryBase(payload, userId),
        status: "skipped_no_token",
      });
    }),
  );

  if (tokenRows.length === 0) return;

  const messages: ExpoPushMessage[] = tokenRows.map((row) => ({
    to: String(row.push_token),
    title: payload.title,
    body: payload.body,
    sound: "default",
    channelId,
    data: payload.data,
  }));

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const expoAccessToken = getExpoAccessToken();
  if (expoAccessToken) {
    headers.Authorization = `Bearer ${expoAccessToken}`;
  }

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers,
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    const apiError = `Expo push API returned ${response.status}`;
    await Promise.all(
      tokenRows.map((row) =>
        logPushNotificationDelivery(admin, {
          ...buildDeliveryBase(payload, String(row.user_id)),
          status: "failed",
          errorMessage: apiError,
        }),
      ),
    );
    throw new Error(apiError);
  }

  const tickets = (await response.json()) as { data?: ExpoPushTicket[] };
  const ticketList = tickets.data ?? [];

  const results = await Promise.allSettled(
    ticketList.map(async (ticket, index) => {
      const tokenRow = tokenRows[index];
      if (!tokenRow) return;

      const userId = String(tokenRow.user_id);
      const deliveryBase = buildDeliveryBase(payload, userId);

      if (ticket.status === "ok") {
        await logPushNotificationDelivery(admin, {
          ...deliveryBase,
          status: "sent",
          expoTicketId: ticket.id ?? null,
        });
        return;
      }

      const errorMessage = ticket.message ?? ticket.details?.error ?? "Expo push failed";

      if (isStaleExpoTokenError(ticket)) {
        await admin
          .from("expo_push_tokens")
          .delete()
          .eq("push_token", String(tokenRow.push_token));
        await logPushNotificationDelivery(admin, {
          ...deliveryBase,
          status: "failed",
          errorMessage,
        });
        return;
      }

      await logPushNotificationDelivery(admin, {
        ...deliveryBase,
        status: "failed",
        errorMessage,
      });
      throw new Error(errorMessage);
    }),
  );

  await logSettledNotificationFailures(
    admin,
    {
      organizationId: payload.organizationId,
      operation: resolveFailureOperation(payload),
      metadata: {
        recipientCount: payload.userIds.length,
        tokenCount: tokenRows.length,
        pushKind: payload.data.kind,
      },
    },
    results,
  );
}
