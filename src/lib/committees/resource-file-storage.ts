import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommitteeResourceType } from "./types";

export const COMMITTEE_RESOURCE_FILES_BUCKET = "committee-resource-files";

export const COMMITTEE_RESOURCE_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const COMMITTEE_RESOURCE_SIGNED_URL_TTL_SECONDS = 60 * 60;

export const COMMITTEE_RESOURCE_PDF_ACCEPT = ".pdf,application/pdf";
export const COMMITTEE_RESOURCE_DOC_ACCEPT =
  ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type CommitteeResourceUploadContext = {
  organizationId: string;
  committeeId: string;
};

export function buildCommitteeResourceStoragePath(
  organizationId: string,
  committeeId: string,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${organizationId}/committees/${committeeId}/${fileId}_${safeName}`;
}

export function acceptForResourceType(type: CommitteeResourceType): string | undefined {
  if (type === "pdf") return COMMITTEE_RESOURCE_PDF_ACCEPT;
  if (type === "doc") return COMMITTEE_RESOURCE_DOC_ACCEPT;
  return undefined;
}

export function validateCommitteeResourceFile(
  file: File,
  type: CommitteeResourceType,
): string | null {
  if (type !== "pdf" && type !== "doc") return null;

  if (file.size > COMMITTEE_RESOURCE_FILE_MAX_BYTES) {
    return "File must be 10 MB or smaller.";
  }

  const name = file.name.toLowerCase();
  if (type === "pdf") {
    if (file.type === "application/pdf" || name.endsWith(".pdf")) return null;
    return "Please upload a PDF file.";
  }

  const docTypes = new Set([
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);
  if (docTypes.has(file.type) || name.endsWith(".doc") || name.endsWith(".docx")) {
    return null;
  }
  return "Please upload a Word document (.doc or .docx).";
}

export async function uploadCommitteeResourceFile(
  supabase: SupabaseClient,
  ctx: CommitteeResourceUploadContext,
  file: File,
  resourceType: CommitteeResourceType,
): Promise<{ storagePath: string; fileName: string }> {
  const validationError = validateCommitteeResourceFile(file, resourceType);
  if (validationError) throw new Error(validationError);

  const fileId = crypto.randomUUID();
  const storagePath = buildCommitteeResourceStoragePath(
    ctx.organizationId,
    ctx.committeeId,
    file.name,
    fileId,
  );

  const { error: uploadError } = await supabase.storage
    .from(COMMITTEE_RESOURCE_FILES_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  return { storagePath, fileName: file.name };
}

export async function deleteCommitteeResourceFile(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(COMMITTEE_RESOURCE_FILES_BUCKET)
    .remove([storagePath]);

  if (error) throw error;
}

export async function createCommitteeResourceSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(COMMITTEE_RESOURCE_FILES_BUCKET)
    .createSignedUrl(storagePath, COMMITTEE_RESOURCE_SIGNED_URL_TTL_SECONDS);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Failed to create download link.");
  return data.signedUrl;
}
