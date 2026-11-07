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

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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
): Promise<{
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number;
}> {
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
): Promise<{
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number;
}> {
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

type SignedUrlFailure = {
  photo: { organizationId: string; id: string; storagePath: string };
  cause: unknown;
};

/** One report per organization per batch, not one per photo. */
function reportGalleryPhotoSignedUrlFailures(
  supabase: SupabaseClient,
  failures: SignedUrlFailure[],
  totalPhotos: number,
): void {
  const byOrganization = new Map<string, SignedUrlFailure[]>();
  for (const failure of failures) {
    const list = byOrganization.get(failure.photo.organizationId) ?? [];
    list.push(failure);
    byOrganization.set(failure.photo.organizationId, list);
  }

  for (const [organizationId, orgFailures] of byOrganization) {
    const first = orgFailures[0];
    const cause = first.cause;
    void reportOperationalError({
      supabase,
      surface: "system",
      organizationId,
      operation: "school_gallery.photo_signed_url",
      error:
        cause instanceof Error
          ? cause.message
          : typeof (cause as { message?: unknown } | null)?.message === "string"
            ? String((cause as { message: string }).message)
            : "Failed to create a signed URL for a gallery photo.",
      entityType: "school_gallery_photo",
      entityId: first.photo.id,
      metadata: {
        bucket: SCHOOL_GALLERY_FILES_BUCKET,
        failedCount: orgFailures.length,
        totalPhotos: totalPhotos,
        photoIds: orgFailures.slice(0, 20).map((entry) => entry.photo.id),
        storagePaths: orgFailures
          .slice(0, 5)
          .map((entry) => entry.photo.storagePath),
      },
      severity: "warning",
      notify: true,
      actor: { type: "system" },
      cause,
    });
  }
}

/**
 * Signs every photo with one `createSignedUrls` call (instead of one storage request per photo)
 * and reports failures once per batch. Photos that fail to sign keep `imageUrl: undefined`.
 */
export async function attachSignedUrlsToGalleryPhotos(
  supabase: SupabaseClient,
  photos: import("./types").GalleryPhoto[],
): Promise<import("./types").GalleryPhoto[]> {
  if (photos.length === 0) return photos;

  const failures: SignedUrlFailure[] = [];
  const signable: import("./types").GalleryPhoto[] = [];

  for (const photo of photos) {
    try {
      assertGalleryPhotoStoragePath(
        photo.organizationId,
        photo.id,
        photo.storagePath,
      );
      signable.push(photo);
    } catch (cause) {
      failures.push({ photo, cause });
    }
  }

  const urlByPath = new Map<string, string>();

  if (signable.length > 0) {
    const paths = [...new Set(signable.map((photo) => photo.storagePath))];
    const { data, error } = await supabase.storage
      .from(SCHOOL_GALLERY_FILES_BUCKET)
      .createSignedUrls(paths, GALLERY_SIGNED_URL_TTL_SECONDS);

    if (error) {
      for (const photo of signable) failures.push({ photo, cause: error });
    } else {
      for (const entry of data ?? []) {
        if (entry.path && entry.signedUrl && !entry.error) {
          urlByPath.set(entry.path, entry.signedUrl);
        }
      }
      for (const photo of signable) {
        if (urlByPath.has(photo.storagePath)) continue;
        const entry = (data ?? []).find(
          (row) => row.path === photo.storagePath,
        );
        failures.push({
          photo,
          cause: new Error(
            entry?.error ?? "Failed to create a download link for this photo.",
          ),
        });
      }
    }
  }

  if (failures.length > 0) {
    reportGalleryPhotoSignedUrlFailures(supabase, failures, photos.length);
  }

  return photos.map((photo) => ({
    ...photo,
    imageUrl: urlByPath.get(photo.storagePath),
  }));
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
