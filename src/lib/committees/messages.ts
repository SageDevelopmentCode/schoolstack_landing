import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { logCommitteeActivityEvent } from "@/lib/committees/committee-activity-log";
import {
  deleteCommitteeMessageAttachmentFiles,
  insertCommitteeMessageAttachments,
  MAX_MESSAGE_ATTACHMENTS,
  type CommitteeMessageAttachmentMeta,
  uploadCommitteeMessageAttachment,
} from "@/lib/committees/committee-message-attachment-storage";
import { getCommittee } from "./committees";
import { mapMessageRow, type CommitteeMessageRow } from "./mappers";
import type { CommitteeMessage, CommitteeMessageAttachment } from "./types";

export async function postMessage(
  supabase: SupabaseClient,
  committeeId: string,
  body: string,
  senderMemberId?: string,
  options?: {
    organizationId: string;
    files?: File[];
  },
): Promise<CommitteeMessage> {
  const trimmedBody = body.trim();
  const files = options?.files ?? [];

  if (!trimmedBody && files.length === 0) {
    throw new Error("Message cannot be empty.");
  }
  if (files.length > MAX_MESSAGE_ATTACHMENTS) {
    throw new Error(`You can attach up to ${MAX_MESSAGE_ATTACHMENTS} files per message.`);
  }
  if (!options?.organizationId) {
    throw new Error("Organization is required to send committee messages.");
  }

  const { data, error } = await supabase
    .from("committee_messages")
    .insert({
      committee_id: committeeId,
      sender_member_id: senderMemberId ?? null,
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
          organizationId: options.organizationId,
          committeeId,
          messageId,
        },
        file,
      );
      uploaded.push(meta);
    }

    await insertCommitteeMessageAttachments(
      supabase,
      options.organizationId,
      committeeId,
      messageId,
      uploaded,
    );
  } catch (uploadError) {
    await supabase.from("committee_messages").delete().eq("id", messageId);
    await deleteCommitteeMessageAttachmentFiles(
      supabase,
      uploaded.map((item) => item.storagePath),
    );
    throw uploadError;
  }

  const message = mapMessageRow(data as CommitteeMessageRow, []);
  const previewSource = trimmedBody || uploaded[0]?.fileName || "Attachment";
  const preview =
    previewSource.length > 80 ? `${previewSource.slice(0, 77)}…` : previewSource;
  logCommitteeActivityEvent(supabase, {
    committeeId,
    action: ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED,
    entityType: "committee_message",
    entityId: message.id,
    summary: `New message posted: "${preview}"`,
    metadata: { messagePreview: preview },
    actor: senderMemberId
      ? { type: "parent", memberId: senderMemberId }
      : undefined,
  });

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

export async function refreshCommitteeAfterMessageChange(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
) {
  const committee = await getCommittee(supabase, organizationId, committeeId);
  if (!committee) throw new Error("Committee not found");
  return committee;
}
