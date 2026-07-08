import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { compressImageForUpload } from "@/lib/images/compress-image";

export const APPLICATION_FILES_BUCKET = "application-files";

export const DEFAULT_APPLICATION_FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png";
export const DEFAULT_APPLICATION_FILE_MAX_COUNT = 5;
export const DEFAULT_APPLICATION_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const DEFAULT_APPLICATION_FILE_SIGNED_URL_TTL_SECONDS = 60 * 60;

export type ApplicationFileUploadMeta = {
  id: string;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

export type ApplicationFileUploadContext = {
  organizationId: string;
  applicationId: string;
};

export function buildApplicationFileStoragePath(
  ctx: ApplicationFileUploadContext,
  fieldId: string,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${ctx.organizationId}/applications/${ctx.applicationId}/${fieldId}/${fileId}_${safeName}`;
}

export function parseApplicationFileFieldValue(
  value: string,
): ApplicationFileUploadMeta[] {
  if (!value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ApplicationFileUploadMeta =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as ApplicationFileUploadMeta).storagePath === "string" &&
        typeof (item as ApplicationFileUploadMeta).fileName === "string",
    );
  } catch {
    return [];
  }
}

export function serializeApplicationFileFieldValue(
  files: ApplicationFileUploadMeta[],
): string {
  return JSON.stringify(files);
}

export function formatApplicationFileSize(bytes: number | null): string | null {
  if (bytes === null || bytes < 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function getApplicationFileSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn = DEFAULT_APPLICATION_FILE_SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) {
    throw new Error("Failed to create a download link for this file.");
  }

  return data.signedUrl;
}

export async function uploadApplicationFile(
  supabase: SupabaseClient,
  ctx: ApplicationFileUploadContext,
  fieldId: string,
  file: File,
): Promise<ApplicationFileUploadMeta> {
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
  const storagePath = buildApplicationFileStoragePath(
    ctx,
    fieldId,
    prepared.name,
    fileId,
  );

  const { error: uploadError } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .upload(storagePath, prepared, {
      contentType: prepared.type || undefined,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: row, error: insertError } = await supabase
    .from("application_files")
    .insert({
      organization_id: ctx.organizationId,
      application_id: ctx.applicationId,
      field_id: fieldId,
      file_name: prepared.name,
      storage_path: storagePath,
      mime_type: prepared.type || null,
      size_bytes: prepared.size,
    })
    .select("id, file_name, storage_path, mime_type, size_bytes")
    .single();

  if (insertError) {
    await supabase.storage.from(APPLICATION_FILES_BUCKET).remove([storagePath]);
    throw insertError;
  }

  const meta = {
    id: String(row.id),
    fileName: String(row.file_name),
    storagePath: String(row.storage_path),
    mimeType: row.mime_type ? String(row.mime_type) : null,
    sizeBytes:
      row.size_bytes === null || row.size_bytes === undefined
        ? null
        : Number(row.size_bytes),
  };

  void logActivityEvent(supabase, {
    organizationId: ctx.organizationId,
    actorType: "parent",
    surface: "public_apply",
    action: ACTIVITY_ACTIONS.APPLICATION_FILE_UPLOADED,
    entityType: "application_file",
    entityId: meta.id,
    summary: `Uploaded file “${meta.fileName}”`,
    metadata: {
      applicationId: ctx.applicationId,
      fieldId,
      fileName: meta.fileName,
      sizeBytes: meta.sizeBytes,
    },
  });

  return meta;
}

export async function removeApplicationFile(
  supabase: SupabaseClient,
  file: ApplicationFileUploadMeta,
): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .remove([file.storagePath]);

  if (storageError) throw storageError;

  const { error: deleteError } = await supabase
    .from("application_files")
    .delete()
    .eq("id", file.id);

  if (deleteError) throw deleteError;

  void logActivityEvent(supabase, {
    actorType: "parent",
    surface: "public_apply",
    action: ACTIVITY_ACTIONS.APPLICATION_FILE_REMOVED,
    entityType: "application_file",
    entityId: file.id,
    summary: `Removed file “${file.fileName}”`,
    metadata: {
      fileName: file.fileName,
      storagePath: file.storagePath,
    },
  });
}

export function validateApplicationFileSelection(
  file: File,
  options?: { accept?: string; maxBytes?: number },
): string | null {
  const maxBytes = options?.maxBytes ?? DEFAULT_APPLICATION_FILE_MAX_BYTES;

  if (file.size > maxBytes) {
    return `${file.name} exceeds the ${Math.round(maxBytes / (1024 * 1024))} MB limit.`;
  }

  if (options?.accept) {
    const allowed = options.accept
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean);
    const fileName = file.name.toLowerCase();
    const mime = file.type.toLowerCase();
    const matches = allowed.some((rule) => {
      if (rule.startsWith(".")) return fileName.endsWith(rule);
      if (rule.includes("/")) return mime === rule;
      return false;
    });
    if (!matches) {
      return `${file.name} is not an allowed file type.`;
    }
  }

  return null;
}
