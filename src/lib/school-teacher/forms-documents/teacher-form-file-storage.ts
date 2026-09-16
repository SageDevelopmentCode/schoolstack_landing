import type { SupabaseClient } from "@supabase/supabase-js";
import type { UploadFileFormat } from "./types";

export const TEACHER_PARENT_FORM_FILES_BUCKET = "teacher-parent-form-files";

export const TEACHER_PARENT_FORM_MAX_BYTES = 10 * 1024 * 1024;
export const TEACHER_PARENT_FORM_SIGNED_URL_TTL_SECONDS = 60 * 60;

export type TeacherFormFileUploadContext = {
  organizationId: string;
  formId: string;
};

export function buildTeacherFormStoragePath(
  organizationId: string,
  formId: string,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${organizationId}/forms/${formId}/${fileId}_${safeName}`;
}

export function detectUploadFormat(file: File): UploadFileFormat | null {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/msword" ||
    name.endsWith(".docx") ||
    name.endsWith(".doc")
  ) {
    return "docx";
  }
  return null;
}

export function validateTeacherFormFile(file: File): string | null {
  if (file.size > TEACHER_PARENT_FORM_MAX_BYTES) {
    return "File must be 10 MB or smaller.";
  }
  if (!detectUploadFormat(file)) {
    return "Please upload a PDF or Word document.";
  }
  return null;
}

export async function uploadTeacherFormFile(
  supabase: SupabaseClient,
  ctx: TeacherFormFileUploadContext,
  file: File,
): Promise<{
  storagePath: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string | null;
  uploadFormat: UploadFileFormat;
}> {
  const validationError = validateTeacherFormFile(file);
  if (validationError) throw new Error(validationError);

  const uploadFormat = detectUploadFormat(file);
  if (!uploadFormat) throw new Error("Please upload a PDF or Word document.");

  const fileId = crypto.randomUUID();
  const storagePath = buildTeacherFormStoragePath(
    ctx.organizationId,
    ctx.formId,
    file.name,
    fileId,
  );

  const contentType =
    file.type ||
    (uploadFormat === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

  const { error: uploadError } = await supabase.storage
    .from(TEACHER_PARENT_FORM_FILES_BUCKET)
    .upload(storagePath, file, {
      contentType,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  return {
    storagePath,
    fileName: file.name,
    fileSizeBytes: file.size,
    mimeType: file.type || contentType,
    uploadFormat,
  };
}

export async function copyTeacherFormFile(
  supabase: SupabaseClient,
  sourcePath: string,
  targetPath: string,
): Promise<void> {
  const { error: copyError } = await supabase.storage
    .from(TEACHER_PARENT_FORM_FILES_BUCKET)
    .copy(sourcePath, targetPath);

  if (copyError) throw copyError;
}

export async function createTeacherFormSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(TEACHER_PARENT_FORM_FILES_BUCKET)
    .createSignedUrl(storagePath, TEACHER_PARENT_FORM_SIGNED_URL_TTL_SECONDS);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Failed to create download link.");
  return data.signedUrl;
}
