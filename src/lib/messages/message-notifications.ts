import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, logActivityEvent } from "@/lib/activity-log";
import { sendNewMessageEmail } from "@/lib/emails";
import { shouldSendMessageEmail } from "@/lib/messages/message-email-debounce";
import { sendWebPushToUsers } from "@/lib/messages/web-push";
import { loadFamilyNotificationEmails } from "@/lib/notifications/family-notification-emails";
import type { PortalMessage } from "./types";

export type MessageNotificationContext = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  threadId: string;
  senderUserId: string;
  senderName: string;
  message: PortalMessage;
  viewer: "parent" | "teacher" | "admin";
};

type Recipient = {
  userId: string;
  email: string | null;
  familyId?: string;
  portal: "parent" | "teacher" | "admin";
};

function portalPath(
  slug: string,
  portal: Recipient["portal"],
  threadId: string,
): string {
  return `/school/${slug}/${portal}/messages?thread=${threadId}`;
}

export async function resolveThreadRecipients(
  admin: SupabaseClient,
  organizationId: string,
  threadId: string,
  senderUserId: string,
): Promise<Recipient[]> {
  const { data: participants, error } = await admin
    .from("message_thread_participants")
    .select("participant_kind, family_id, staff_member_id")
    .eq("thread_id", threadId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  const recipients = new Map<string, Recipient>();
  const addRecipient = (
    userId: string | null | undefined,
    email: string | null,
    portal: Recipient["portal"],
    familyId?: string,
  ) => {
    if (!userId || userId === senderUserId) return;
    if (!recipients.has(userId)) {
      recipients.set(userId, { userId, email, portal, familyId });
    }
  };

  for (const participant of participants ?? []) {
    if (participant.participant_kind === "family" && participant.family_id) {
      const { data: guardians } = await admin
        .from("guardians")
        .select("user_id, email")
        .eq("family_id", participant.family_id)
        .eq("organization_id", organizationId);

      for (const guardian of guardians ?? []) {
        addRecipient(
          guardian.user_id ? String(guardian.user_id) : null,
          typeof guardian.email === "string" ? guardian.email : null,
          "parent",
          String(participant.family_id),
        );
      }
    }

    if (participant.participant_kind === "staff_member" && participant.staff_member_id) {
      const { data: staff } = await admin
        .from("staff_members")
        .select("user_id, email")
        .eq("id", participant.staff_member_id)
        .maybeSingle();

      addRecipient(
        staff?.user_id ? String(staff.user_id) : null,
        typeof staff?.email === "string" ? staff.email : null,
        "teacher",
      );
    }

    if (participant.participant_kind === "school_office") {
      const { data: admins } = await admin
        .from("organization_memberships")
        .select("user_id")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .in("role", ["owner", "admin"]);

      for (const adminMembership of admins ?? []) {
        const userId = String(adminMembership.user_id);
        const { data: authUser } = await admin.auth.admin.getUserById(userId);
        addRecipient(userId, authUser.user?.email ?? null, "admin");
      }
    }
  }

  return [...recipients.values()];
}

type ThreadReadState = {
  lastReadAt: string | null;
  lastEmailNotifiedAt: string | null;
};

async function loadThreadReadStates(
  admin: SupabaseClient,
  threadId: string,
  userIds: string[],
): Promise<Map<string, ThreadReadState>> {
  const states = new Map<string, ThreadReadState>();
  if (userIds.length === 0) return states;

  const { data, error } = await admin
    .from("message_thread_reads")
    .select("user_id, last_read_at, last_email_notified_at")
    .eq("thread_id", threadId)
    .in("user_id", userIds);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    states.set(String(row.user_id), {
      lastReadAt: row.last_read_at ? String(row.last_read_at) : null,
      lastEmailNotifiedAt:
        row.last_email_notified_at != null
          ? String(row.last_email_notified_at)
          : null,
    });
  }

  return states;
}

async function stampMessageEmailNotified(
  admin: SupabaseClient,
  threadId: string,
  userId: string,
  notifiedAt: string,
): Promise<void> {
  const { error } = await admin.from("message_thread_reads").upsert(
    {
      thread_id: threadId,
      user_id: userId,
      last_email_notified_at: notifiedAt,
    },
    { onConflict: "thread_id,user_id" },
  );

  if (error) throw new Error(error.message);
}

export async function dispatchMessageNotifications(
  admin: SupabaseClient,
  context: MessageNotificationContext,
): Promise<void> {
  const recipients = await resolveThreadRecipients(
    admin,
    context.organizationId,
    context.threadId,
    context.senderUserId,
  );

  if (recipients.length === 0) return;

  const preview =
    context.message.body.trim() ||
    (context.message.attachments.length > 0
      ? `Sent ${context.message.attachments.length} attachment(s)`
      : "New message");

  const now = new Date();
  const readStates = await loadThreadReadStates(
    admin,
    context.threadId,
    recipients.map((recipient) => recipient.userId),
  );

  const familyEmailCache = new Map<string, string[]>();
  const emailedFamilies = new Set<string>();

  await Promise.allSettled(
    recipients.map(async (recipient) => {
      const threadUrl = portalPath(
        context.organizationSlug,
        recipient.portal,
        context.threadId,
      );

      const readState = readStates.get(recipient.userId);
      const emailDecision = shouldSendMessageEmail({
        now,
        lastReadAt: readState?.lastReadAt ?? null,
        lastEmailNotifiedAt: readState?.lastEmailNotifiedAt ?? null,
      });

      if (emailDecision.send) {
        let emailsToNotify: string[] = [];

        if (recipient.portal === "parent" && recipient.familyId) {
          if (!emailedFamilies.has(recipient.familyId)) {
            if (!familyEmailCache.has(recipient.familyId)) {
              familyEmailCache.set(
                recipient.familyId,
                await loadFamilyNotificationEmails(
                  admin,
                  recipient.familyId,
                ),
              );
            }
            emailsToNotify = familyEmailCache.get(recipient.familyId) ?? [];
            if (emailsToNotify.length > 0) {
              emailedFamilies.add(recipient.familyId);
            }
          }
        } else if (recipient.email) {
          emailsToNotify = [recipient.email];
        }

        let emailed = false;
        for (const email of emailsToNotify) {
          const result = await sendNewMessageEmail({
            email,
            schoolName: context.schoolName,
            senderName: context.senderName,
            preview,
            threadUrl,
          });

          if (result.ok) {
            emailed = true;
          }
        }

        if (emailed) {
          const familyRecipientIds = [...recipients.values()]
            .filter((entry) =>
              recipient.familyId
                ? entry.familyId === recipient.familyId
                : entry.userId === recipient.userId,
            )
            .map((entry) => entry.userId);

          await Promise.all(
            familyRecipientIds.map((userId) =>
              stampMessageEmailNotified(
                admin,
                context.threadId,
                userId,
                now.toISOString(),
              ),
            ),
          );
        }
      }

      await sendWebPushToUsers(admin, {
        organizationId: context.organizationId,
        userIds: [recipient.userId],
        title: `${context.schoolName} — ${context.senderName}`,
        body: preview,
        url: threadUrl,
      });
    }),
  );

  if (context.viewer !== "admin") {
    await logActivityEvent(admin, {
      organizationId: context.organizationId,
      actorType: "system",
      surface: "api",
      action: ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
      summary: `${context.senderName}: ${preview}`,
      metadata: {
        threadId: context.threadId,
        senderUserId: context.senderUserId,
        preview,
      },
    });
  }
}
