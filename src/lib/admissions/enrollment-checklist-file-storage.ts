import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import { compressImageForUpload } from "@/lib/images/compress-image";
import { APPLICATION_FILES_BUCKET } from "./application-file-storage";
import type { ApplicationFileUploadMeta } from "./application-file-storage";
import { validateApplicationFileSelection } from "./application-file-storage";

export type ChecklistFileUploadContext = {
  organizationId: string;
  checklistId: string;
  instanceId: string;
};

export function buildChecklistFileStoragePath(
  ctx: ChecklistFileUploadContext,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${ctx.organizationId}/enrollment-checklists/${ctx.checklistId}/${ctx.instanceId}/${fileId}_${safeName}`;
}

export function parseChecklistFileResponses(
  responses: Record<string, unknown> | null | undefined,
): ApplicationFileUploadMeta[] {
  const files = responses?.files;
  if (!Array.isArray(files)) return [];
  return files.filter(
    (item): item is ApplicationFileUploadMeta =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as ApplicationFileUploadMeta).storagePath === "string" &&
      typeof (item as ApplicationFileUploadMeta).fileName === "string",
  );
}

export async function uploadChecklistFile(
  supabase: SupabaseClient,
  ctx: ChecklistFileUploadContext,
  file: File,
  options?: { accept?: string; maxBytes?: number },
): Promise<ApplicationFileUploadMeta> {
  const validationError = validateApplicationFileSelection(file, options);
  if (validationError) {
    throw new Error(validationError);
  }

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
  const storagePath = buildChecklistFileStoragePath(ctx, prepared.name, fileId);

  const { error: uploadError } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .upload(storagePath, prepared, {
      contentType: prepared.type || undefined,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const meta: ApplicationFileUploadMeta = {
    id: fileId,
    fileName: prepared.name,
    storagePath,
    mimeType: prepared.type || null,
    sizeBytes: prepared.size,
  };

  void logActivityEvent(supabase, {
    organizationId: ctx.organizationId,
    actorType: "parent",
    surface: "parent_portal",
    action: ACTIVITY_ACTIONS.APPLICATION_FILE_UPLOADED,
    entityType: "enrollment_checklist_item",
    entityId: ctx.instanceId,
    summary: `Uploaded file “${meta.fileName}” for enrollment checklist`,
    metadata: {
      checklistId: ctx.checklistId,
      fileName: meta.fileName,
      sizeBytes: meta.sizeBytes,
    },
  });

  return meta;
}

export async function removeChecklistFile(
  supabase: SupabaseClient,
  file: ApplicationFileUploadMeta,
): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .remove([file.storagePath]);

  if (storageError) throw storageError;
}
