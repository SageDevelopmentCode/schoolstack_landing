import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_ACTIONS,
  logActivityEvent,
} from "@/lib/activity-log";
import {
  APPLICATION_FILES_BUCKET,
  DEFAULT_APPLICATION_FILE_ACCEPT,
  DEFAULT_APPLICATION_FILE_MAX_BYTES,
  DEFAULT_APPLICATION_FILE_MAX_COUNT,
  type ApplicationFileUploadMeta,
  validateApplicationFileSelection,
} from "./application-file-storage";
import type { AdminPostSubmitStep } from "./admin-post-submit-steps";
import type { ApplicationFormPostSubmitConfig } from "./application-form-schema";
import { buildAdminPostSubmitSteps } from "./admin-post-submit-steps";
import type { ScheduledVisitRecord } from "./admissions-booking";

export const MAX_POST_SUBMIT_STEP_COMPLETION_NOTES_LENGTH = 2000;
export const MAX_POST_SUBMIT_STEP_FILES = DEFAULT_APPLICATION_FILE_MAX_COUNT;
export const POST_SUBMIT_STEP_FILE_ACCEPT = DEFAULT_APPLICATION_FILE_ACCEPT;
export const POST_SUBMIT_STEP_FILE_MAX_BYTES = DEFAULT_APPLICATION_FILE_MAX_BYTES;

const FIELD_ID_PREFIX = "post_submit_step:";

export function postSubmitStepDocumentationFieldId(actionId: string): string {
  return `${FIELD_ID_PREFIX}${actionId}`;
}

export function isPostSubmitStepDocumentationFieldId(fieldId: string): boolean {
  return fieldId.startsWith(FIELD_ID_PREFIX);
}

export function postSubmitActionIdFromDocumentationFieldId(
  fieldId: string,
): string | null {
  if (!isPostSubmitStepDocumentationFieldId(fieldId)) return null;
  const actionId = fieldId.slice(FIELD_ID_PREFIX.length).trim();
  return actionId || null;
}

export type PostSubmitStepDocumentationContext = {
  organizationId: string;
  applicationId: string;
  actionId: string;
};

export function buildPostSubmitStepFileStoragePath(
  ctx: PostSubmitStepDocumentationContext,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${ctx.organizationId}/applications/${ctx.applicationId}/post-submit/${ctx.actionId}/${fileId}_${safeName}`;
}

export function normalizePostSubmitStepCompletionNotes(
  notes: string | null | undefined,
): string | null {
  const trimmed = notes?.trim() ?? "";
  if (!trimmed) return null;
  if (trimmed.length > MAX_POST_SUBMIT_STEP_COMPLETION_NOTES_LENGTH) {
    throw new Error(
      `Notes cannot exceed ${MAX_POST_SUBMIT_STEP_COMPLETION_NOTES_LENGTH} characters.`,
    );
  }
  return trimmed;
}

function fileMetaFromRow(row: {
  id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
}): ApplicationFileUploadMeta {
  return {
    id: String(row.id),
    fileName: String(row.file_name),
    storagePath: String(row.storage_path),
    mimeType: row.mime_type ? String(row.mime_type) : null,
    sizeBytes:
      row.size_bytes === null || row.size_bytes === undefined
        ? null
        : Number(row.size_bytes),
  };
}

export async function listPostSubmitStepCompletionFilesForApplication(
  supabase: SupabaseClient,
  applicationId: string,
  actionIds: string[],
): Promise<Map<string, ApplicationFileUploadMeta[]>> {
  const result = new Map<string, ApplicationFileUploadMeta[]>();
  if (actionIds.length === 0) return result;

  const fieldIds = actionIds.map(postSubmitStepDocumentationFieldId);
  const { data, error } = await supabase
    .from("application_files")
    .select("id, field_id, file_name, storage_path, mime_type, size_bytes")
    .eq("application_id", applicationId)
    .in("field_id", fieldIds)
    .order("created_at", { ascending: true });

  if (error) throw error;

  for (const row of data ?? []) {
    const actionId = postSubmitActionIdFromDocumentationFieldId(String(row.field_id));
    if (!actionId) continue;
    const list = result.get(actionId) ?? [];
    list.push(
      fileMetaFromRow({
        id: String(row.id),
        file_name: String(row.file_name),
        storage_path: String(row.storage_path),
        mime_type: row.mime_type as string | null,
        size_bytes: row.size_bytes as number | null,
      }),
    );
    result.set(actionId, list);
  }

  return result;
}

export function isPostSubmitStepDocumentationClientError(
  error: unknown,
): error is Error {
  if (!(error instanceof Error)) return false;
  const { message } = error;
  if (message === `You can attach up to ${MAX_POST_SUBMIT_STEP_FILES} files.`) {
    return true;
  }
  if (message.includes(" exceeds the ") && message.includes(" MB limit.")) {
    return true;
  }
  if (message.endsWith(" is not an allowed file type.")) {
    return true;
  }
  return false;
}

export async function uploadPostSubmitStepCompletionFile(
  supabase: SupabaseClient,
  ctx: PostSubmitStepDocumentationContext,
  file: File,
  actorUserId: string,
): Promise<ApplicationFileUploadMeta> {
  const validationError = validateApplicationFileSelection(file, {
    accept: POST_SUBMIT_STEP_FILE_ACCEPT,
    maxBytes: POST_SUBMIT_STEP_FILE_MAX_BYTES,
  });
  if (validationError) {
    throw new Error(validationError);
  }

  const existing = await listPostSubmitStepCompletionFilesForApplication(
    supabase,
    ctx.applicationId,
    [ctx.actionId],
  );
  const currentCount = existing.get(ctx.actionId)?.length ?? 0;
  if (currentCount >= MAX_POST_SUBMIT_STEP_FILES) {
    throw new Error(`You can attach up to ${MAX_POST_SUBMIT_STEP_FILES} files.`);
  }

  const fileId = crypto.randomUUID();
  const storagePath = buildPostSubmitStepFileStoragePath(ctx, file.name, fileId);
  const fieldId = postSubmitStepDocumentationFieldId(ctx.actionId);

  const { error: uploadError } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: row, error: insertError } = await supabase
    .from("application_files")
    .insert({
      organization_id: ctx.organizationId,
      application_id: ctx.applicationId,
      field_id: fieldId,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      size_bytes: file.size,
      uploaded_by_user_id: actorUserId,
    })
    .select("id, file_name, storage_path, mime_type, size_bytes")
    .single();

  if (insertError) {
    await supabase.storage.from(APPLICATION_FILES_BUCKET).remove([storagePath]);
    throw insertError;
  }

  const meta = fileMetaFromRow({
    id: String(row.id),
    file_name: String(row.file_name),
    storage_path: String(row.storage_path),
    mime_type: row.mime_type as string | null,
    size_bytes: row.size_bytes as number | null,
  });

  void logActivityEvent(supabase, {
    organizationId: ctx.organizationId,
    actorType: "school_admin",
    actorUserId,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.APPLICATION_FILE_UPLOADED,
    entityType: "application_file",
    entityId: meta.id,
    summary: `Uploaded file “${meta.fileName}” for post-application step`,
    metadata: {
      applicationId: ctx.applicationId,
      actionId: ctx.actionId,
      fieldId,
      fileName: meta.fileName,
      sizeBytes: meta.sizeBytes,
    },
  });

  return meta;
}

export async function removePostSubmitStepCompletionFile(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    applicationId: string;
    actionId: string;
    fileId: string;
    actorUserId?: string;
  },
): Promise<void> {
  const fieldId = postSubmitStepDocumentationFieldId(params.actionId);
  const { data, error } = await supabase
    .from("application_files")
    .select("id, file_name, storage_path, field_id, application_id, organization_id")
    .eq("id", params.fileId)
    .eq("application_id", params.applicationId)
    .eq("organization_id", params.organizationId)
    .eq("field_id", fieldId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error("File not found.");
  }

  const { error: storageError } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .remove([String(data.storage_path)]);

  if (storageError) throw storageError;

  const { error: deleteError } = await supabase
    .from("application_files")
    .delete()
    .eq("id", data.id);

  if (deleteError) throw deleteError;

  void logActivityEvent(supabase, {
    organizationId: params.organizationId,
    actorType: "school_admin",
    actorUserId: params.actorUserId,
    surface: "school_admin",
    action: ACTIVITY_ACTIONS.APPLICATION_FILE_REMOVED,
    entityType: "application_file",
    entityId: String(data.id),
    summary: `Removed file “${data.file_name}” from post-application step`,
    metadata: {
      applicationId: params.applicationId,
      actionId: params.actionId,
      fileName: data.file_name,
      storagePath: data.storage_path,
    },
  });
}

export async function deleteAllPostSubmitStepCompletionFiles(
  supabase: SupabaseClient,
  organizationId: string,
  applicationId: string,
  actionId: string,
): Promise<void> {
  const fieldId = postSubmitStepDocumentationFieldId(actionId);
  const { data, error } = await supabase
    .from("application_files")
    .select("id, storage_path")
    .eq("application_id", applicationId)
    .eq("organization_id", organizationId)
    .eq("field_id", fieldId);

  if (error) throw error;

  const rows = data ?? [];
  if (rows.length === 0) return;

  const paths = rows.map((row) => String(row.storage_path));
  const { error: storageError } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .remove(paths);

  if (storageError) throw storageError;

  const { error: deleteError } = await supabase
    .from("application_files")
    .delete()
    .eq("application_id", applicationId)
    .eq("organization_id", organizationId)
    .eq("field_id", fieldId);

  if (deleteError) throw deleteError;
}

export function mergePostSubmitStepDocumentation(
  steps: AdminPostSubmitStep[],
  filesByActionId: Map<string, ApplicationFileUploadMeta[]>,
): AdminPostSubmitStep[] {
  return steps.map((step) => {
    if (!step.booking) return step;
    const completionFiles = filesByActionId.get(step.actionId) ?? [];
    return {
      ...step,
      booking: {
        ...step.booking,
        completionFiles,
      },
    };
  });
}

export function buildAdminPostSubmitStepsWithDocumentation(
  config: ApplicationFormPostSubmitConfig,
  visits: ScheduledVisitRecord[],
  applicationStatus: string,
  filesByActionId: Map<string, ApplicationFileUploadMeta[]>,
): AdminPostSubmitStep[] {
  const steps = buildAdminPostSubmitSteps(config, visits, applicationStatus);
  return mergePostSubmitStepDocumentation(steps, filesByActionId);
}

export function postSubmitStepDocumentationSummary(
  step: AdminPostSubmitStep,
): string | null {
  if (step.status !== "scheduled" || !step.booking) return null;

  const hasNote = Boolean(step.booking.adminCompletionNotes?.trim());
  const fileCount = step.booking.completionFiles?.length ?? 0;

  if (!hasNote && fileCount === 0) return null;

  const parts: string[] = [];
  if (hasNote) parts.push("Internal note");
  if (fileCount > 0) {
    parts.push(`${fileCount} file${fileCount === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
}
