import type { SupabaseClient } from "@supabase/supabase-js";

export const FRIDAY_BRANCH_CLASS_FLYER_BUCKET = "friday-branch-class-flyers";

export const FRIDAY_BRANCH_CLASS_FLYER_MAX_BYTES = 10 * 1024 * 1024;
export const FRIDAY_BRANCH_CLASS_FLYER_SIGNED_URL_TTL_SECONDS = 60 * 60;
export const FRIDAY_BRANCH_CLASS_FLYER_PDF_ACCEPT = ".pdf,application/pdf";

export type FridayBranchClassFlyerUploadContext = {
  organizationId: string;
  classId: string;
};

export function buildFridayBranchClassFlyerStoragePath(
  organizationId: string,
  classId: string,
  fileName: string,
  fileId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${organizationId}/classes/${classId}/${fileId}_${safeName}`;
}

export function validateFridayBranchClassFlyerFile(file: File): string | null {
  if (file.size > FRIDAY_BRANCH_CLASS_FLYER_MAX_BYTES) {
    return "File must be 10 MB or smaller.";
  }

  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return null;
  }

  return "Please upload a PDF file.";
}

function errorMessageFromUnknown(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return "";
}

export function formatFridayBranchClassFlyerUploadError(
  err: unknown,
  fallback = "Failed to upload flyer.",
): string {
  const message = errorMessageFromUnknown(err);

  if (
    /maximum allowed size|entitytoolarge|payload too large|\b413\b/i.test(message)
  ) {
    return "This file exceeds the 10 MB upload limit. Please use a smaller PDF.";
  }

  return message || fallback;
}

export async function uploadFridayBranchClassFlyer(
  supabase: SupabaseClient,
  ctx: FridayBranchClassFlyerUploadContext,
  file: File,
): Promise<{ storagePath: string; fileName: string; fileSizeBytes: number }> {
  const validationError = validateFridayBranchClassFlyerFile(file);
  if (validationError) throw new Error(validationError);

  const fileId = crypto.randomUUID();
  const storagePath = buildFridayBranchClassFlyerStoragePath(
    ctx.organizationId,
    ctx.classId,
    file.name,
    fileId,
  );

  const { error: uploadError } = await supabase.storage
    .from(FRIDAY_BRANCH_CLASS_FLYER_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "application/pdf",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  return {
    storagePath,
    fileName: file.name,
    fileSizeBytes: file.size,
  };
}

export async function removeFridayBranchClassFlyer(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(FRIDAY_BRANCH_CLASS_FLYER_BUCKET)
    .remove([storagePath]);

  if (error) throw error;
}

export async function createFridayBranchClassFlyerSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(FRIDAY_BRANCH_CLASS_FLYER_BUCKET)
    .createSignedUrl(storagePath, FRIDAY_BRANCH_CLASS_FLYER_SIGNED_URL_TTL_SECONDS);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Failed to create download link.");
  return data.signedUrl;
}

export type FridayBranchClassFlyerRecord = {
  classId: string;
  organizationId: string;
  storagePath: string;
  fileName: string;
  fileSizeBytes: number | null;
};

type FridayBranchClassFlyerRow = {
  id: string;
  organization_id: string;
  flyer_storage_path: string | null;
  flyer_file_name: string | null;
  flyer_file_size_bytes: number | null;
};

export async function getFridayBranchClassFlyer(
  supabase: SupabaseClient,
  organizationId: string,
  classId: string,
): Promise<FridayBranchClassFlyerRecord | null> {
  const { data, error } = await supabase
    .from("friday_branch_classes")
    .select("id, organization_id, flyer_storage_path, flyer_file_name, flyer_file_size_bytes")
    .eq("id", classId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as FridayBranchClassFlyerRow;
  if (!row.flyer_storage_path) return null;

  return {
    classId: row.id,
    organizationId: row.organization_id,
    storagePath: row.flyer_storage_path,
    fileName: row.flyer_file_name?.trim() || "Flyer.pdf",
    fileSizeBytes: row.flyer_file_size_bytes,
  };
}
