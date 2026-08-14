import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImageForUpload } from "@/lib/images/compress-image";

export const STAFF_PHOTOS_BUCKET = "staff-photos";

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

export class StaffPhotoUploadError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "StaffPhotoUploadError";
    this.code = code;
  }
}

export type StaffPhotoUploadContext = {
  organizationId: string;
  staffMemberId: string;
};

function photoExtensionForFile(file: File): string {
  const fromMime = EXTENSION_BY_MIME[file.type];
  if (fromMime) return fromMime;

  const match = file.name.match(/\.([a-zA-Z0-9]+)$/);
  const ext = match?.[1]?.toLowerCase();
  if (ext === "png") return "png";
  if (ext === "jpg" || ext === "jpeg") return "jpg";
  if (ext === "webp") return "webp";

  throw new StaffPhotoUploadError(
    "Photo must be a PNG, JPEG, or WebP image.",
    "invalid_type",
  );
}

export function validateStaffPhotoFile(file: File): void {
  if (!ALLOWED_PHOTO_MIME_TYPES.has(file.type)) {
    throw new StaffPhotoUploadError(
      "Photo must be a PNG, JPEG, or WebP image.",
      "invalid_type",
    );
  }

  if (file.size > MAX_PHOTO_BYTES_BEFORE_COMPRESSION) {
    throw new StaffPhotoUploadError(
      "Photo must be 5 MB or smaller.",
      "file_too_large",
    );
  }
}

export function staffPhotoStoragePath(
  organizationId: string,
  staffMemberId: string,
  file: File,
): string {
  const extension = photoExtensionForFile(file);
  return `${organizationId}/${staffMemberId}/photo.${extension}`;
}

export async function uploadStaffProfilePhoto(
  supabase: SupabaseClient,
  ctx: StaffPhotoUploadContext,
  file: File,
): Promise<string> {
  validateStaffPhotoFile(file);

  const prepared = await compressImageForUpload(file, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.82,
    skipBelowBytes: 80 * 1024,
  });

  const path = staffPhotoStoragePath(
    ctx.organizationId,
    ctx.staffMemberId,
    prepared,
  );

  const { error: uploadError } = await supabase.storage
    .from(STAFF_PHOTOS_BUCKET)
    .upload(path, prepared, {
      upsert: true,
      contentType: prepared.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new StaffPhotoUploadError(uploadError.message, "upload_failed");
  }

  const { data } = supabase.storage
    .from(STAFF_PHOTOS_BUCKET)
    .getPublicUrl(path);

  if (!data.publicUrl) {
    throw new StaffPhotoUploadError(
      "Failed to resolve photo URL.",
      "public_url_failed",
    );
  }

  return data.publicUrl;
}
