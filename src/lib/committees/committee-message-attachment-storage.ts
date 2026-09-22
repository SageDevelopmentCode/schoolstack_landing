import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImageForUpload } from "@/lib/images/compress-image";
import {
  MAX_MESSAGE_ATTACHMENTS,
  MAX_MESSAGE_ATTACHMENT_BYTES,
} from "@/lib/messages/message-attachment-storage";

export {
  MAX_MESSAGE_ATTACHMENTS,
  MAX_MESSAGE_ATTACHMENT_BYTES,
} from "@/lib/messages/message-attachment-storage";

export const COMMITTEE_MESSAGE_FILES_BUCKET = "committee-message-files";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type CommitteeMessageAttachmentMeta = {
  id: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

export type CommitteeMessageAttachmentUploadContext = {
  organizationId: string;
  committeeId: string;
  messageId: string;
};

export function buildCommitteeMessageAttachmentStoragePath(
  organizationId: string,
  committeeId: string,
  messageId: string,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${organizationId}/committee-messages/${committeeId}/${messageId}/${fileId}_${safeName}`;
}

export function validateCommitteeMessageAttachmentFile(file: File): void {
  if (file.size > MAX_MESSAGE_ATTACHMENT_BYTES) {
    throw new Error(`"${file.name}" exceeds the 10 MB limit.`);
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`"${file.name}" is not a supported file type.`);
  }
}

async function prepareCommitteeMessageAttachmentUpload(file: File): Promise<File> {
  validateCommitteeMessageAttachmentFile(file);

  if (file.type === "image/jpeg" || file.type === "image/png") {
    return compressImageForUpload(file, {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.85,
      skipBelowBytes: 300 * 1024,
    });
  }

  return file;
}

export async function uploadCommitteeMessageAttachment(
  supabase: SupabaseClient,
  ctx: CommitteeMessageAttachmentUploadContext,
  file: File,
): Promise<CommitteeMessageAttachmentMeta> {
  const prepared = await prepareCommitteeMessageAttachmentUpload(file);

  const fileId = crypto.randomUUID();
  const storagePath = buildCommitteeMessageAttachmentStoragePath(
    ctx.organizationId,
    ctx.committeeId,
    ctx.messageId,
    prepared.name,
    fileId,
  );

  const { error: uploadError } = await supabase.storage
    .from(COMMITTEE_MESSAGE_FILES_BUCKET)
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

export async function insertCommitteeMessageAttachments(
  supabase: SupabaseClient,
  organizationId: string,
  committeeId: string,
  messageId: string,
  attachments: CommitteeMessageAttachmentMeta[],
): Promise<void> {
  if (attachments.length === 0) return;

  const rows = attachments.map((attachment) => ({
    message_id: messageId,
    committee_id: committeeId,
    organization_id: organizationId,
    file_name: attachment.fileName,
    storage_path: attachment.storagePath,
    mime_type: attachment.mimeType,
    size_bytes: attachment.sizeBytes,
  }));

  const { error } = await supabase.from("committee_message_attachments").insert(rows);
  if (error) throw new Error(error.message);
}

export async function deleteCommitteeMessageAttachmentFiles(
  supabase: SupabaseClient,
  storagePaths: string[],
): Promise<void> {
  if (storagePaths.length === 0) return;
  const { error } = await supabase.storage
    .from(COMMITTEE_MESSAGE_FILES_BUCKET)
    .remove(storagePaths);
  if (error) throw error;
}

export async function getCommitteeMessageAttachmentSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn = 60 * 60,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(COMMITTEE_MESSAGE_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) {
    throw new Error("Failed to create a download link for this file.");
  }
  return data.signedUrl;
}

export async function loadCommitteeMessageAttachmentsForMessages(
  supabase: SupabaseClient,
  messageIds: string[],
): Promise<Map<string, CommitteeMessageAttachmentMeta[]>> {
  const map = new Map<string, CommitteeMessageAttachmentMeta[]>();
  if (messageIds.length === 0) return map;

  const { data, error } = await supabase
    .from("committee_message_attachments")
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
      sizeBytes: row.size_bytes != null ? Number(row.size_bytes) : null,
    });
    map.set(messageId, list);
  }

  return map;
}

export async function attachSignedUrlsToCommitteeMessageAttachments(
  supabase: SupabaseClient,
  attachments: CommitteeMessageAttachmentMeta[],
): Promise<Array<CommitteeMessageAttachmentMeta & { url: string }>> {
  const withUrls: Array<CommitteeMessageAttachmentMeta & { url: string }> = [];

  for (const attachment of attachments) {
    const url = await getCommitteeMessageAttachmentSignedUrl(
      supabase,
      attachment.storagePath,
    );
    withUrls.push({ ...attachment, url });
  }

  return withUrls;
}
