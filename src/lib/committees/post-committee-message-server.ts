import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS, type ActivitySurface } from "@/lib/activity-log";
import { sendCommitteeMessagePostedNotifications } from "@/lib/committees/committee-notifications";
import {
  deleteCommitteeMessageAttachmentFiles,
  insertCommitteeMessageAttachments,
  MAX_MESSAGE_ATTACHMENTS,
  type CommitteeMessageAttachmentMeta,
  uploadCommitteeMessageAttachment,
} from "@/lib/committees/committee-message-attachment-storage";
import { recordCommitteeActivityServer } from "@/lib/committees/record-committee-activity-server";
import { mapMessageRow, type CommitteeMessageRow } from "@/lib/committees/mappers";
import type { CommitteeMessage, CommitteeMessageAttachment } from "@/lib/committees/types";
import { SCHOOL_ADMIN_ATTRIBUTION } from "@/lib/committees/attribution";

export type PostCommitteeMessageServerInput = {
  organizationId: string;
  committeeId: string;
  committeeName: string;
  body: string;
  senderMemberId?: string | null;
  senderName: string;
  files?: File[];
  actorUserId: string;
  actorEmail?: string | null;
  actorName: string;
  actorMemberId?: string | null;
  actorType: "parent" | "teacher" | "school_admin";
  surface: ActivitySurface;
};

export async function postCommitteeMessageServer(
  supabase: SupabaseClient,
  input: PostCommitteeMessageServerInput,
): Promise<CommitteeMessage> {
  const trimmedBody = input.body.trim();
  const files = input.files ?? [];

  if (!trimmedBody && files.length === 0) {
    throw new Error("Message cannot be empty.");
  }
  if (files.length > MAX_MESSAGE_ATTACHMENTS) {
    throw new Error(`You can attach up to ${MAX_MESSAGE_ATTACHMENTS} files per message.`);
  }

  const { data, error } = await supabase
    .from("committee_messages")
    .insert({
      committee_id: input.committeeId,
      sender_member_id: input.senderMemberId ?? null,
      body: trimmedBody || "",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const messageId = String(data.id);
  const uploaded: CommitteeMessageAttachmentMeta[] = [];

  try {
    for (const file of files) {
      const meta = await uploadCommitteeMessageAttachment(
        supabase,
        {
          organizationId: input.organizationId,
          committeeId: input.committeeId,
          messageId,
        },
        file,
      );
      uploaded.push(meta);
    }

    if (uploaded.length > 0) {
      await insertCommitteeMessageAttachments(
        supabase,
        input.organizationId,
        input.committeeId,
        messageId,
        uploaded,
      );
    }
  } catch (uploadError) {
    await supabase.from("committee_messages").delete().eq("id", messageId);
    await deleteCommitteeMessageAttachmentFiles(
      supabase,
      uploaded.map((item) => item.storagePath),
    );
    throw uploadError;
  }

  const previewSource = trimmedBody || uploaded[0]?.fileName || "Attachment";
  const preview =
    previewSource.length > 80 ? `${previewSource.slice(0, 77)}…` : previewSource;

  const senderLabel =
    input.senderName.trim() || SCHOOL_ADMIN_ATTRIBUTION;

  await recordCommitteeActivityServer(supabase, {
    organizationId: input.organizationId,
    committeeId: input.committeeId,
    committeeName: input.committeeName,
    action: ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED,
    entityType: "committee_message",
    entityId: messageId,
    summary: `New message posted: "${preview}"`,
    metadata: { messagePreview: preview },
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    actorName: input.actorName,
    actorMemberId: input.senderMemberId ?? input.actorMemberId ?? null,
    actorType: input.actorType,
    surface: input.surface,
  });

  await sendCommitteeMessagePostedNotifications(supabase, {
    organizationId: input.organizationId,
    committeeId: input.committeeId,
    committeeName: input.committeeName,
    messageId,
    messagePreview: preview,
    senderName: senderLabel,
    senderMemberId: input.senderMemberId ?? null,
    actorUserId: input.actorUserId,
    actorEmail: input.actorEmail,
    actorName: input.actorName,
    actorType: input.actorType,
    surface: input.surface,
  });

  const message = mapMessageRow(data as CommitteeMessageRow, []);
  let attachments: CommitteeMessageAttachment[] | undefined;
  if (uploaded.length > 0) {
    attachments = uploaded.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      storagePath: attachment.storagePath,
    }));
  }

  return attachments ? { ...message, attachments } : message;
}
