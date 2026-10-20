import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImageForUpload } from "@/lib/images/compress-image";
import { reportOperationalError } from "@/lib/operational-errors";

export const SCHOOL_GALLERY_FILES_BUCKET = "school-gallery-files";

export const MAX_GALLERY_PHOTOS_PER_UPLOAD = 25;
export const MAX_GALLERY_PHOTO_BYTES = 10 * 1024 * 1024;

export const GALLERY_IMAGE_COMPRESS_OPTIONS = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85,
  skipBelowBytes: 300 * 1024,
} as const;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const GALLERY_SIGNED_URL_TTL_SECONDS = 60 * 60;

export function buildGalleryPhotoStoragePath(
  organizationId: string,
  photoId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${organizationId}/gallery/${photoId}/${safeName}`;
}

export function galleryPhotoStoragePathPrefix(
  organizationId: string,
  photoId: string,
): string {
  return `${organizationId}/gallery/${photoId}/`;
}

export function assertGalleryPhotoStoragePath(
  organizationId: string,
  photoId: string,
  storagePath: string,
): void {
  const prefix = galleryPhotoStoragePathPrefix(organizationId, photoId);
  if (!storagePath.startsWith(prefix)) {
    throw new Error("Gallery photo storage path does not match this school.");
  }
}

export function validateGalleryPhotoFile(file: File): void {
  if (file.size > MAX_GALLERY_PHOTO_BYTES) {
    throw new Error(`"${file.name}" exceeds the 10 MB limit.`);
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`"${file.name}" must be a JPEG, PNG, or WebP image.`);
  }
}

export async function prepareGalleryPhotoForUpload(file: File): Promise<File> {
  if (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp"
  ) {
    return compressImageForUpload(file, GALLERY_IMAGE_COMPRESS_OPTIONS);
  }
  return file;
}

export async function uploadPreparedGalleryPhotoFile(
  supabase: SupabaseClient,
  organizationId: string,
  photoId: string,
  prepared: File,
): Promise<{ storagePath: string; mimeType: string | null; sizeBytes: number }> {
  const storagePath = buildGalleryPhotoStoragePath(
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

export async function uploadGalleryPhotoFile(
  supabase: SupabaseClient,
  organizationId: string,
  photoId: string,
  file: File,
): Promise<{ storagePath: string; mimeType: string | null; sizeBytes: number }> {
  validateGalleryPhotoFile(file);
  const prepared = await prepareGalleryPhotoForUpload(file);
  return uploadPreparedGalleryPhotoFile(
    supabase,
    organizationId,
    photoId,
    prepared,
  );
}

export async function removeGalleryPhotoFiles(
  supabase: SupabaseClient,
  storagePaths: string[],
): Promise<void> {
  if (storagePaths.length === 0) return;
  const { error } = await supabase.storage
    .from(SCHOOL_GALLERY_FILES_BUCKET)
    .remove(storagePaths);
  if (error) throw error;
}

export async function getGalleryPhotoSignedUrl(
  supabase: SupabaseClient,
  organizationId: string,
  photoId: string,
  storagePath: string,
  expiresIn = GALLERY_SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  assertGalleryPhotoStoragePath(organizationId, photoId, storagePath);

  const { data, error } = await supabase.storage
    .from(SCHOOL_GALLERY_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) {
    throw new Error("Failed to create a download link for this photo.");
  }
  return data.signedUrl;
}

function reportGalleryPhotoSignedUrlFailure(
  supabase: SupabaseClient,
  photo: { organizationId: string; id: string; storagePath: string },
  cause: unknown,
): void {
  void reportOperationalError({
    supabase,
    surface: "system",
    organizationId: photo.organizationId,
    operation: "school_gallery.photo_signed_url",
    error:
      cause instanceof Error
        ? cause.message
        : "Failed to create a signed URL for a gallery photo.",
    entityType: "school_gallery_photo",
    entityId: photo.id,
    metadata: {
      storagePath: photo.storagePath,
      bucket: SCHOOL_GALLERY_FILES_BUCKET,
    },
    severity: "warning",
    notify: true,
    actor: { type: "system" },
    cause,
  });
}

export async function attachSignedUrlsToGalleryPhotos(
  supabase: SupabaseClient,
  photos: import("./types").GalleryPhoto[],
): Promise<import("./types").GalleryPhoto[]> {
  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      imageUrl: await getGalleryPhotoSignedUrl(
        supabase,
        photo.organizationId,
        photo.id,
        photo.storagePath,
      ).catch((err) => {
        reportGalleryPhotoSignedUrlFailure(supabase, photo, err);
        return undefined;
      }),
    })),
  );
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseGalleryPhotoDate(raw: string): string {
  const trimmed = raw.trim();
  if (!ISO_DATE_PATTERN.test(trimmed)) {
    throw new Error("Photo date must be YYYY-MM-DD.");
  }
  const parsed = new Date(`${trimmed}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Photo date is invalid.");
  }
  return trimmed;
}
