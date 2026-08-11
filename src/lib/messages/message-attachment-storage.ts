import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImageForUpload } from "@/lib/images/compress-image";

export const PORTAL_MESSAGE_FILES_BUCKET = "portal-message-files";

export const MAX_MESSAGE_ATTACHMENTS = 5;
export const MAX_MESSAGE_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type MessageAttachmentMeta = {
  id: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

export type MessageAttachmentUploadContext = {
  organizationId: string;
  threadId: string;
  messageId: string;
};

export function buildMessageAttachmentStoragePath(
  organizationId: string,
  threadId: string,
  messageId: string,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${organizationId}/message-threads/${threadId}/${messageId}/${fileId}_${safeName}`;
}

export function validateMessageAttachmentFile(file: File): void {
  if (file.size > MAX_MESSAGE_ATTACHMENT_BYTES) {
    throw new Error(`"${file.name}" exceeds the 10 MB limit.`);
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`"${file.name}" is not a supported file type.`);
  }
}

export async function uploadMessageAttachment(
  supabase: SupabaseClient,
  ctx: MessageAttachmentUploadContext,
  file: File,
): Promise<MessageAttachmentMeta> {
  validateMessageAttachmentFile(file);

  const prepared =
    file.type === "image/jpeg" || file.type === "image/png"
      ? await compressImageForUpload(file, {
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 0.85,
          skipBelowBytes: 300 * 1024,
        })
      : file;

  const fileId = crypto.randomUUID();
  const storagePath = buildMessageAttachmentStoragePath(
    ctx.organizationId,
    ctx.threadId,
    ctx.messageId,
    prepared.name,
    fileId,
  );

  const { error: uploadError } = await supabase.storage
    .from(PORTAL_MESSAGE_FILES_BUCKET)
    .upload(storagePath, prepared, {
      contentType: prepared.type || undefined,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  return {
    id: fileId,
    fileName: prepared.name,
    storagePath,
    mimeType: prepared.type || null,
    sizeBytes: prepared.size,
  };
}

export async function insertMessageAttachments(
  admin: SupabaseClient,
  organizationId: string,
  threadId: string,
  messageId: string,
  attachments: MessageAttachmentMeta[],
): Promise<void> {
  if (attachments.length === 0) return;

  const rows = attachments.map((attachment) => ({
    message_id: messageId,
    thread_id: threadId,
    organization_id: organizationId,
    file_name: attachment.fileName,
    storage_path: attachment.storagePath,
    mime_type: attachment.mimeType,
    size_bytes: attachment.sizeBytes,
  }));

  const { error } = await admin.from("portal_message_attachments").insert(rows);
  if (error) throw new Error(error.message);
}

export async function deleteMessageAttachmentFiles(
  supabase: SupabaseClient,
  storagePaths: string[],
): Promise<void> {
  if (storagePaths.length === 0) return;
  const { error } = await supabase.storage
    .from(PORTAL_MESSAGE_FILES_BUCKET)
    .remove(storagePaths);
  if (error) throw error;
}

export async function getMessageAttachmentSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn = 60 * 60,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(PORTAL_MESSAGE_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) {
    throw new Error("Failed to create a download link for this file.");
  }
  return data.signedUrl;
}

export async function loadAttachmentsForMessages(
  admin: SupabaseClient,
  messageIds: string[],
): Promise<Map<string, MessageAttachmentMeta[]>> {
  const map = new Map<string, MessageAttachmentMeta[]>();
  if (messageIds.length === 0) return map;

  const { data, error } = await admin
    .from("portal_message_attachments")
    .select("*")
    .in("message_id", messageIds)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const messageId = String(row.message_id);
    const list = map.get(messageId) ?? [];
    list.push({
      id: String(row.id),
      fileName: String(row.file_name),
      storagePath: String(row.storage_path),
      mimeType: typeof row.mime_type === "string" ? row.mime_type : null,
      sizeBytes:
        row.size_bytes != null ? Number(row.size_bytes) : null,
    });
    map.set(messageId, list);
  }

  return map;
}
