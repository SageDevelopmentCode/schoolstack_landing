import type { SupabaseClient } from "@supabase/supabase-js";
import {
  deleteMessageAttachmentFiles,
  insertMessageAttachments,
  type MessageAttachmentMeta,
  uploadMessageAttachment,
} from "./message-attachment-storage";
import { mapMessageRow, type ParticipantDisplayContext, type PortalMessageRow } from "./mappers";
import type { PortalMessage, PortalMessageSenderKind } from "./types";

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
