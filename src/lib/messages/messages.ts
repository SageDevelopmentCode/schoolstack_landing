import type { SupabaseClient } from "@supabase/supabase-js";
import { PortalRouteError } from "@/lib/api/portal-route-errors";
import {
  buildMessageAttachmentStoragePath,
  copyMessageAttachment,
  deleteMessageAttachmentFiles,
  insertMessageAttachments,
  type MessageAttachmentMeta,
  uploadMessageAttachment,
} from "./message-attachment-storage";
import { mapMessageRow, type ParticipantDisplayContext, type PortalMessageRow } from "./mappers";
import type { PortalMessage, PortalMessageSenderKind } from "./types";

export type EditPortalMessageInput = {
  organizationId: string;
  threadId: string;
  messageId: string;
  userId: string;
  body: string;
};

export type PostMessageInput = {
  organizationId: string;
  threadId: string;
  body: string;
  senderUserId: string;
  senderKind: PortalMessageSenderKind;
  senderGuardianId?: string | null;
  senderStaffMemberId?: string | null;
  files?: File[];
};

export async function postPortalMessage(
  admin: SupabaseClient,
  input: PostMessageInput,
  context: ParticipantDisplayContext,
): Promise<PortalMessage> {
  const body = input.body.trim();
  const files = input.files ?? [];

  if (!body && files.length === 0) {
    throw new Error("Message cannot be empty.");
  }

  const { data, error } = await admin
    .from("portal_messages")
    .insert({
      thread_id: input.threadId,
      organization_id: input.organizationId,
      body: body || "",
      sender_user_id: input.senderUserId,
      sender_kind: input.senderKind,
      sender_guardian_id: input.senderGuardianId ?? null,
      sender_staff_member_id: input.senderStaffMemberId ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const messageId = String(data.id);
  const uploaded: MessageAttachmentMeta[] = [];

  try {
    for (const file of files) {
      const meta = await uploadMessageAttachment(admin, {
        organizationId: input.organizationId,
        threadId: input.threadId,
        messageId,
      }, file);
      uploaded.push(meta);
    }

    await insertMessageAttachments(
      admin,
      input.organizationId,
      input.threadId,
      messageId,
      uploaded,
    );
  } catch (uploadError) {
    await admin.from("portal_messages").delete().eq("id", messageId);
    await deleteMessageAttachmentFiles(
      admin,
      uploaded.map((item) => item.storagePath),
    );
    throw uploadError;
  }

  const message = mapMessageRow(data as PortalMessageRow, context);
  message.attachments = uploaded.map((item) => ({
    id: item.id,
    fileName: item.fileName,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
  }));

  return message;
}

export async function postPortalMessageWithStagingAttachments(
  admin: SupabaseClient,
  input: PostMessageInput,
  context: ParticipantDisplayContext,
  stagingAttachments: MessageAttachmentMeta[],
): Promise<PortalMessage> {
  const body = input.body.trim();

  if (!body && stagingAttachments.length === 0) {
    throw new Error("Message cannot be empty.");
  }

  const { data, error } = await admin
    .from("portal_messages")
    .insert({
      thread_id: input.threadId,
      organization_id: input.organizationId,
      body: body || "",
      sender_user_id: input.senderUserId,
      sender_kind: input.senderKind,
      sender_guardian_id: input.senderGuardianId ?? null,
      sender_staff_member_id: input.senderStaffMemberId ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const messageId = String(data.id);
  const uploaded: MessageAttachmentMeta[] = [];

  try {
    for (const stagingAttachment of stagingAttachments) {
      const targetPath = buildMessageAttachmentStoragePath(
        input.organizationId,
        input.threadId,
        messageId,
        stagingAttachment.fileName,
        stagingAttachment.id,
      );
      await copyMessageAttachment(admin, stagingAttachment.storagePath, targetPath);
      uploaded.push({
        ...stagingAttachment,
        storagePath: targetPath,
      });
    }

    await insertMessageAttachments(
      admin,
      input.organizationId,
      input.threadId,
      messageId,
      uploaded,
    );
  } catch (uploadError) {
    await admin.from("portal_messages").delete().eq("id", messageId);
    await deleteMessageAttachmentFiles(
      admin,
      uploaded.map((item) => item.storagePath),
    );
    throw uploadError;
  }

  const message = mapMessageRow(data as PortalMessageRow, context);
  message.attachments = uploaded.map((item) => ({
    id: item.id,
    fileName: item.fileName,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
  }));

  return message;
}

export async function editPortalMessage(
  admin: SupabaseClient,
  input: EditPortalMessageInput,
): Promise<void> {
  const body = input.body.trim();
  if (!body) {
    throw new PortalRouteError("Message cannot be empty.", 400, "invalid_request");
  }

  const { data: row, error } = await admin
    .from("portal_messages")
    .select("*")
    .eq("id", input.messageId)
    .eq("thread_id", input.threadId)
    .eq("organization_id", input.organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) {
    throw new PortalRouteError("Message not found.", 404, "not_found");
  }

  const messageRow = row as PortalMessageRow;
  if (String(messageRow.sender_user_id) !== input.userId) {
    throw new PortalRouteError("You can only edit your own messages.", 403, "forbidden");
  }

  const { count, error: attachmentCountError } = await admin
    .from("portal_message_attachments")
    .select("id", { count: "exact", head: true })
    .eq("message_id", input.messageId);

  if (attachmentCountError) throw new Error(attachmentCountError.message);
  if ((count ?? 0) > 0) {
    throw new PortalRouteError(
      "Messages with attachments cannot be edited.",
      400,
      "not_editable",
    );
  }

  if (!messageRow.body.trim()) {
    throw new PortalRouteError("This message cannot be edited.", 400, "not_editable");
  }

  if (messageRow.body.trim() === body) {
    return;
  }

  const { error: updateError } = await admin
    .from("portal_messages")
    .update({
      body,
      edited_at: new Date().toISOString(),
    })
    .eq("id", input.messageId);

  if (updateError) throw new Error(updateError.message);
}

export async function getGuardianIdForUser(
  admin: SupabaseClient,
  userId: string,
  organizationId: string,
  familyId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("guardians")
    .select("id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("family_id", familyId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.id ? String(data.id) : null;
}

export async function getGuardianIdsForUser(
  admin: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<string[]> {
  const { data, error } = await admin
    .from("guardians")
    .select("id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => String(row.id));
}
