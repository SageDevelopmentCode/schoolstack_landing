import type { SupabaseClient } from '@supabase/supabase-js';

export const FRIDAY_BRANCH_CLASS_FLYER_BUCKET = 'friday-branch-class-flyers';

export const FRIDAY_BRANCH_CLASS_FLYER_MAX_BYTES = 10 * 1024 * 1024;
export const FRIDAY_BRANCH_CLASS_FLYER_SIGNED_URL_TTL_SECONDS = 60 * 60;

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
  const safeName = fileName.replace(/[/\\]/g, '_');
  return `${organizationId}/classes/${classId}/${fileId}_${safeName}`;
}

export function validateFridayBranchClassFlyerFile(
  fileName: string,
  mimeType: string | null | undefined,
  sizeBytes: number | null | undefined,
): string | null {
  if (sizeBytes != null && sizeBytes > FRIDAY_BRANCH_CLASS_FLYER_MAX_BYTES) {
    return 'File must be 10 MB or smaller.';
  }

  const name = fileName.toLowerCase();
  if (mimeType === 'application/pdf' || name.endsWith('.pdf')) {
    return null;
  }

  return 'Please upload a PDF file.';
}

export async function uploadFridayBranchClassFlyer(
  supabase: SupabaseClient,
  ctx: FridayBranchClassFlyerUploadContext,
  file: { uri: string; name: string; mimeType?: string | null; size?: number | null },
): Promise<{ storagePath: string; fileName: string; fileSizeBytes: number }> {
  const validationError = validateFridayBranchClassFlyerFile(
    file.name,
    file.mimeType,
    file.size,
  );
  if (validationError) throw new Error(validationError);

  const fileId = crypto.randomUUID();
  const storagePath = buildFridayBranchClassFlyerStoragePath(
    ctx.organizationId,
    ctx.classId,
    file.name,
    fileId,
  );

  const response = await fetch(file.uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from(FRIDAY_BRANCH_CLASS_FLYER_BUCKET)
    .upload(storagePath, blob, {
      contentType: file.mimeType || 'application/pdf',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  return {
    storagePath,
    fileName: file.name,
    fileSizeBytes: file.size ?? blob.size,
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
  if (!data?.signedUrl) throw new Error('Failed to create download link.');
  return data.signedUrl;
}
