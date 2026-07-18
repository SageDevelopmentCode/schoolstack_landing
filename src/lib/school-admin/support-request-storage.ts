import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImageForUpload } from "@/lib/images/compress-image";

export const ADMIN_SUPPORT_FILES_BUCKET = "admin-support-files";

export const MAX_SUPPORT_REQUEST_FILES = 5;
export const MAX_SUPPORT_REQUEST_FILE_BYTES = 10 * 1024 * 1024;

export type SupportRequestAttachmentMeta = {
  id: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

export type SupportRequestUploadContext = {
  organizationId: string;
  requestId: string;
};

export function buildSupportRequestStoragePath(
  organizationId: string,
  requestId: string,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${organizationId}/support-requests/${requestId}/${fileId}_${safeName}`;
}

export async function uploadSupportRequestFile(
  supabase: SupabaseClient,
  ctx: SupportRequestUploadContext,
  file: File,
): Promise<SupportRequestAttachmentMeta> {
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
  const storagePath = buildSupportRequestStoragePath(
    ctx.organizationId,
    ctx.requestId,
    prepared.name,
    fileId,
  );

  const { error: uploadError } = await supabase.storage
    .from(ADMIN_SUPPORT_FILES_BUCKET)
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

export async function deleteSupportRequestFiles(
  supabase: SupabaseClient,
  storagePaths: string[],
): Promise<void> {
  if (storagePaths.length === 0) return;

  const { error } = await supabase.storage
    .from(ADMIN_SUPPORT_FILES_BUCKET)
    .remove(storagePaths);

  if (error) throw error;
}

const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function getSupportRequestFileSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn = DEFAULT_SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(ADMIN_SUPPORT_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) {
    throw new Error("Failed to create a download link for this file.");
  }

  return data.signedUrl;
}
