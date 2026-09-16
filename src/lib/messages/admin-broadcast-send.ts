import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { userIsOrgAdmin } from "@/lib/admissions/application-auth";
import {
  ADMIN_BROADCAST_MAX_RECIPIENTS,
  ADMIN_BROADCAST_SEND_CONCURRENCY,
} from "@/lib/messages/admin-broadcast-constants";
import {
  loadBroadcastDeliveries,
  recordBroadcastDelivery,
} from "@/lib/messages/admin-broadcast-deliveries";
import {
  findOrCreateThread,
  resolveParticipantsForContact,
} from "@/lib/messages/api-helpers";
import {
  resolveAdminBroadcastGuardians,
  type AdminBroadcastAudienceInput,
} from "@/lib/messages/admin-broadcast-audience";
import { dispatchMessageNotifications } from "@/lib/messages/message-notifications";
import {
  deleteMessageAttachmentFiles,
  type MessageAttachmentMeta,
  uploadBroadcastStagingAttachments,
} from "@/lib/messages/message-attachment-storage";
import { mapWithConcurrency } from "@/lib/messages/map-with-concurrency";
import {
  postPortalMessage,
  postPortalMessageWithStagingAttachments,
} from "@/lib/messages/messages";
import { getThreadParticipantKinds, markThreadRead } from "@/lib/messages/threads";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import type { MessageContact } from "@/lib/messages/types";

export type AdminBroadcastFailure = {
  guardianId: string;
  name: string;
  error: string;
};

export type AdminBroadcastSendResult = {
  sentCount: number;
  failedCount: number;
  failures: AdminBroadcastFailure[];
};

export type AdminBroadcastSendInput = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  body: string;
  files?: File[];
  audience: AdminBroadcastAudienceInput;
  userId: string;
  staffMemberId?: string | null;
  broadcastBatchId?: string | null;
  activityMetadata?: Record<string, unknown>;
};

function hasMessageContent(body: string, files?: File[]): boolean {
  return Boolean(body.trim() || (files?.length ?? 0) > 0);
}

export async function resolveAdminBroadcastContacts(
  admin: SupabaseClient,
  organizationId: string,
  audience: AdminBroadcastAudienceInput,
): Promise<MessageContact[]> {
  return resolveAdminBroadcastGuardians(admin, organizationId, audience);
}

export async function adminBroadcastSend(
  admin: SupabaseClient,
  input: AdminBroadcastSendInput,
): Promise<AdminBroadcastSendResult> {
  if (!hasMessageContent(input.body, input.files)) {
    throw new Error("Message content is required.");
  }

  const contacts = await resolveAdminBroadcastContacts(
    admin,
    input.organizationId,
    input.audience,
  );

  if (contacts.length === 0) {
    throw new Error("Select at least one parent to message.");
  }

  if (contacts.length > ADMIN_BROADCAST_MAX_RECIPIENTS) {
    throw new Error(
      `You can message up to ${ADMIN_BROADCAST_MAX_RECIPIENTS} parents at a time.`,
    );
  }

  const broadcastBatchId = input.broadcastBatchId ?? crypto.randomUUID();
  const schoolOfficeLabel = `${input.schoolName} Office`;
  const failures: AdminBroadcastFailure[] = [];
  let sentCount = 0;

  const isAdmin = await userIsOrgAdmin(admin, input.userId, input.organizationId);
  if (!isAdmin) {
    throw new Error("Admin access required.");
  }

  let senderStaffMemberId = input.staffMemberId ?? null;
  if (!senderStaffMemberId) {
    senderStaffMemberId = await getStaffMemberIdForUser(
      admin,
      input.userId,
      input.organizationId,
    );
  }

  const files = input.files ?? [];
  let stagingAttachments: MessageAttachmentMeta[] = [];
  if (files.length > 0) {
    stagingAttachments = await uploadBroadcastStagingAttachments(
      admin,
      input.organizationId,
      broadcastBatchId,
      files,
    );
  }

  const existingDeliveries = await loadBroadcastDeliveries(admin, broadcastBatchId);

  const messageContext = {
    families: new Map(),
    staffMembers: new Map(),
    guardians: new Map(),
    familyPrimaryGuardianIds: new Map(),
    familyFirstGuardianIds: new Map(),
    familyEnrolledStudents: new Map(),
    schoolOfficeLabel,
    currentUserId: input.userId,
  };

  const guardianContacts = contacts.filter(
    (contact): contact is MessageContact & { guardianId: string } =>
      contact.kind === "guardian" && Boolean(contact.guardianId),
  );

  try {
    const recipientResults = await mapWithConcurrency(
      guardianContacts,
      ADMIN_BROADCAST_SEND_CONCURRENCY,
      async (contact) => {
        if (existingDeliveries.has(contact.guardianId)) {
          return { status: "sent" as const };
        }

        try {
          const participants = await resolveParticipantsForContact(
            admin,
            input.organizationId,
            contact,
            {
              staffMemberId: senderStaffMemberId,
              viewer: "admin",
            },
          );
          const threadId = await findOrCreateThread(
            admin,
            input.organizationId,
            participants,
          );

          const participantKinds = await getThreadParticipantKinds(admin, threadId);
          const hasOffice = participantKinds.includes("school_office");
          const senderKind = hasOffice ? "org_admin" : "staff_member";

          const message =
            stagingAttachments.length > 0
              ? await postPortalMessageWithStagingAttachments(
                  admin,
                  {
                    organizationId: input.organizationId,
                    threadId,
                    body: input.body,
                    senderUserId: input.userId,
                    senderKind,
                    senderStaffMemberId,
                  },
                  messageContext,
                  stagingAttachments,
                )
              : await postPortalMessage(
                  admin,
                  {
                    organizationId: input.organizationId,
                    threadId,
                    body: input.body,
                    senderUserId: input.userId,
                    senderKind,
                    senderStaffMemberId,
                  },
                  messageContext,
                );

          await markThreadRead(admin, threadId, input.userId);

          await recordBroadcastDelivery(admin, {
            broadcastBatchId,
            organizationId: input.organizationId,
            guardianId: contact.guardianId,
            threadId,
            messageId: message.id,
          });

          void dispatchMessageNotifications(admin, {
            organizationId: input.organizationId,
            organizationSlug: input.organizationSlug,
            schoolName: input.schoolName,
            threadId,
            senderUserId: input.userId,
            senderName: message.senderName,
            message,
            viewer: "admin",
            activityMetadata: input.activityMetadata,
          }).catch((err) => {
            void logNotificationFailure(admin, {
              organizationId: input.organizationId,
              operation: "messages.dispatch_notification",
              error: err,
              entityType: "message_thread",
              entityId: threadId,
            });
          });

          return { status: "sent" as const };
        } catch (err) {
          return {
            status: "failed" as const,
            failure: {
              guardianId: contact.guardianId,
              name: contact.name,
              error: err instanceof Error ? err.message : "Failed to send message.",
            },
          };
        }
      },
    );

    for (const result of recipientResults) {
      if (result.status === "sent") {
        sentCount += 1;
      } else {
        failures.push(result.failure);
      }
    }
  } finally {
    if (stagingAttachments.length > 0) {
      await deleteMessageAttachmentFiles(
        admin,
        stagingAttachments.map((attachment) => attachment.storagePath),
      ).catch(() => undefined);
    }
  }

  return {
    sentCount,
    failedCount: failures.length,
    failures,
  };
}
