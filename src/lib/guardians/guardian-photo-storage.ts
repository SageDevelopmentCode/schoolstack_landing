import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImageForUpload } from "@/lib/images/compress-image";

export const GUARDIAN_PHOTOS_BUCKET = "guardian-photos";

const MAX_PHOTO_BYTES_BEFORE_COMPRESSION = 5 * 1024 * 1024;

const ALLOWED_PHOTO_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export class GuardianPhotoUploadError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "GuardianPhotoUploadError";
    this.code = code;
  }
}

export type GuardianPhotoUploadContext = {
  organizationId: string;
  guardianId: string;
};

function photoExtensionForFile(file: File): string {
  const fromMime = EXTENSION_BY_MIME[file.type];
  if (fromMime) return fromMime;

  const match = file.name.match(/\.([a-zA-Z0-9]+)$/);
  const ext = match?.[1]?.toLowerCase();
  if (ext === "png") return "png";
  if (ext === "jpg" || ext === "jpeg") return "jpg";
  if (ext === "webp") return "webp";

  throw new GuardianPhotoUploadError(
    "Photo must be a PNG, JPEG, or WebP image.",
    "invalid_type",
  );
}

export function validateGuardianPhotoFile(file: File): void {
  if (!ALLOWED_PHOTO_MIME_TYPES.has(file.type)) {
    throw new GuardianPhotoUploadError(
      "Photo must be a PNG, JPEG, or WebP image.",
      "invalid_type",
    );
  }

  if (file.size > MAX_PHOTO_BYTES_BEFORE_COMPRESSION) {
    throw new GuardianPhotoUploadError(
      "Photo must be 5 MB or smaller.",
      "file_too_large",
    );
  }
}

export function guardianPhotoStoragePath(
  organizationId: string,
  guardianId: string,
  file: File,
): string {
  const extension = photoExtensionForFile(file);
  return `${organizationId}/${guardianId}/photo.${extension}`;
}

export async function uploadGuardianProfilePhoto(
  supabase: SupabaseClient,
  ctx: GuardianPhotoUploadContext,
  file: File,
): Promise<string> {
  validateGuardianPhotoFile(file);

  const prepared = await compressImageForUpload(file, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.82,
    skipBelowBytes: 80 * 1024,
  });

  const path = guardianPhotoStoragePath(
    ctx.organizationId,
    ctx.guardianId,
    prepared,
  );

  const { error: uploadError } = await supabase.storage
    .from(GUARDIAN_PHOTOS_BUCKET)
    .upload(path, prepared, {
      upsert: true,
      contentType: prepared.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new GuardianPhotoUploadError(uploadError.message, "upload_failed");
  }

  const { data } = supabase.storage
    .from(GUARDIAN_PHOTOS_BUCKET)
    .getPublicUrl(path);

  if (!data.publicUrl) {
    throw new GuardianPhotoUploadError(
      "Failed to resolve photo URL.",
      "public_url_failed",
    );
  }

  return data.publicUrl;
}
