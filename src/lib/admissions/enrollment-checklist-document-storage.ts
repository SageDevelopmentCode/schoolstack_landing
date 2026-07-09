import type { SupabaseClient } from "@supabase/supabase-js";
import { APPLICATION_FILES_BUCKET } from "./application-file-storage";

export const CHECKLIST_TEMPLATE_PDF_MAX_BYTES = 10 * 1024 * 1024;
export const CHECKLIST_TEMPLATE_PDF_SIGNED_URL_TTL_SECONDS = 60 * 60;

export type EnrollmentChecklistPdfUploadContext = {
  organizationId: string;
  templateId: string;
  itemId: string;
};

export type EnrollmentChecklistPdfUploadMeta = {
  fileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
};

export function buildEnrollmentChecklistPdfStoragePath(
  ctx: EnrollmentChecklistPdfUploadContext,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${ctx.organizationId}/checklist-templates/${ctx.templateId}/${ctx.itemId}/${fileId}_${safeName}`;
}

export async function getEnrollmentChecklistPdfSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn = CHECKLIST_TEMPLATE_PDF_SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) {
    throw new Error("Failed to create a preview link for this PDF.");
  }

  return data.signedUrl;
}

export function buildEmbeddedPdfViewerUrl(signedUrl: string): string {
  const fragment = "navpanes=0&view=FitH";
  if (signedUrl.includes("#")) {
    return `${signedUrl}&${fragment}`;
  }
  return `${signedUrl}#${fragment}`;
}

export async function uploadEnrollmentChecklistPdf(
  supabase: SupabaseClient,
  ctx: EnrollmentChecklistPdfUploadContext,
  file: File,
): Promise<EnrollmentChecklistPdfUploadMeta> {
  if (file.size > CHECKLIST_TEMPLATE_PDF_MAX_BYTES) {
    throw new Error("PDF must be 10 MB or smaller.");
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    throw new Error("Only PDF files are supported.");
  }

  const storagePath = buildEnrollmentChecklistPdfStoragePath(ctx, file.name);
  const { error } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "application/pdf",
      upsert: false,
    });

  if (error) throw error;

  return {
    fileName: file.name,
    storagePath,
    mimeType: file.type || "application/pdf",
    sizeBytes: file.size,
  };
}

export async function deleteEnrollmentChecklistPdf(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(APPLICATION_FILES_BUCKET)
    .remove([storagePath]);

  if (error) throw error;
}
