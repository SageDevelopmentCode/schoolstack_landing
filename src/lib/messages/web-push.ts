import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import webpush from "web-push";

type PushPayload = {
  organizationId: string;
  userIds: string[];
  title: string;
  body: string;
  url: string;
};

function getVapidConfig() {
  const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY?.trim() ?? "";
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY?.trim() ?? "";
  const subject = process.env.WEB_PUSH_VAPID_SUBJECT?.trim() ?? "mailto:support@schoolstack.app";

  if (!publicKey || !privateKey) return null;

  return { publicKey, privateKey, subject };
}

export function getWebPushPublicKey(): string | null {
  return getVapidConfig()?.publicKey ?? null;
}

export async function sendWebPushToUsers(
  admin: SupabaseClient,
  payload: PushPayload,
): Promise<void> {
  const vapid = getVapidConfig();
  if (!vapid || payload.userIds.length === 0) return;

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  let query = admin
    .from("web_push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", payload.userIds);

  if (payload.organizationId) {
    query = query.or(
      `organization_id.eq.${payload.organizationId},organization_id.is.null`,
    );
  }

  const { data: subscriptions, error } = await query;
  if (error || !subscriptions?.length) return;

  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url,
  });

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: String(subscription.endpoint),
            keys: {
              p256dh: String(subscription.p256dh),
              auth: String(subscription.auth),
            },
          },
          notification,
        );
      } catch (err) {
        const statusCode =
          err && typeof err === "object" && "statusCode" in err
            ? Number((err as { statusCode?: number }).statusCode)
            : null;
        if (statusCode === 404 || statusCode === 410) {
          await admin
            .from("web_push_subscriptions")
            .delete()
            .eq("id", subscription.id);
        }
      }
    }),
  );
}
