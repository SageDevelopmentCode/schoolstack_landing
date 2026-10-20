import type { SupabaseClient } from "@supabase/supabase-js";
import {
  prepareGalleryPhotoForUpload,
  SCHOOL_GALLERY_FILES_BUCKET,
  validateGalleryPhotoFile,
} from "@/lib/school-gallery/storage";

export function buildSchoolProfilePhotoStoragePath(
  organizationId: string,
  photoId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${organizationId}/school-profile/${photoId}/${safeName}`;
}

export async function prepareSchoolProfilePhotoForUpload(
  file: File,
): Promise<File> {
  return prepareGalleryPhotoForUpload(file);
}

export function validateSchoolProfilePhotoFile(file: File): void {
  validateGalleryPhotoFile(file);
}

export async function uploadSchoolProfilePhotoFile(
  supabase: SupabaseClient,
  organizationId: string,
  photoId: string,
  file: File,
): Promise<{ storagePath: string; mimeType: string | null; sizeBytes: number }> {
  validateSchoolProfilePhotoFile(file);
  const prepared = await prepareSchoolProfilePhotoForUpload(file);
  const storagePath = buildSchoolProfilePhotoStoragePath(
    organizationId,
    photoId,
    prepared.name,
  );

  const { error: uploadError } = await supabase.storage
    .from(SCHOOL_GALLERY_FILES_BUCKET)
    .upload(storagePath, prepared, {
      contentType: prepared.type || undefined,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  return {
    storagePath,
    mimeType: prepared.type || null,
    sizeBytes: prepared.size,
  };
}

export async function removeSchoolProfilePhotoFile(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(SCHOOL_GALLERY_FILES_BUCKET)
    .remove([storagePath]);
  if (error) throw error;
}

export async function getSchoolProfilePhotoSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn = 60 * 60,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(SCHOOL_GALLERY_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) {
    throw new Error("Failed to create a download link for this photo.");
  }
  return data.signedUrl;
}
