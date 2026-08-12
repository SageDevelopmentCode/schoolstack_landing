import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImageForUpload } from "@/lib/images/compress-image";

export const STUDENT_PHOTOS_BUCKET = "student-photos";

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

export class StudentPhotoUploadError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "StudentPhotoUploadError";
    this.code = code;
  }
}

export type StudentPhotoUploadContext = {
  organizationId: string;
  studentId: string;
};

function photoExtensionForFile(file: File): string {
  const fromMime = EXTENSION_BY_MIME[file.type];
  if (fromMime) return fromMime;

  const match = file.name.match(/\.([a-zA-Z0-9]+)$/);
  const ext = match?.[1]?.toLowerCase();
  if (ext === "png") return "png";
  if (ext === "jpg" || ext === "jpeg") return "jpg";
  if (ext === "webp") return "webp";

  throw new StudentPhotoUploadError(
    "Photo must be a PNG, JPEG, or WebP image.",
    "invalid_type",
  );
}

export function validateStudentPhotoFile(file: File): void {
  if (!ALLOWED_PHOTO_MIME_TYPES.has(file.type)) {
    throw new StudentPhotoUploadError(
      "Photo must be a PNG, JPEG, or WebP image.",
      "invalid_type",
    );
  }

  if (file.size > MAX_PHOTO_BYTES_BEFORE_COMPRESSION) {
    throw new StudentPhotoUploadError(
      "Photo must be 5 MB or smaller.",
      "file_too_large",
    );
  }
}

export function studentPhotoStoragePath(
  organizationId: string,
  studentId: string,
  file: File,
): string {
  const extension = photoExtensionForFile(file);
  return `${organizationId}/${studentId}/photo.${extension}`;
}

export async function uploadStudentProfilePhoto(
  supabase: SupabaseClient,
  ctx: StudentPhotoUploadContext,
  file: File,
): Promise<string> {
  validateStudentPhotoFile(file);

  const prepared = await compressImageForUpload(file, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.82,
    skipBelowBytes: 80 * 1024,
  });

  const path = studentPhotoStoragePath(
    ctx.organizationId,
    ctx.studentId,
    prepared,
  );

  const { error: uploadError } = await supabase.storage
    .from(STUDENT_PHOTOS_BUCKET)
    .upload(path, prepared, {
      upsert: true,
      contentType: prepared.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new StudentPhotoUploadError(uploadError.message, "upload_failed");
  }

  const { data } = supabase.storage
    .from(STUDENT_PHOTOS_BUCKET)
    .getPublicUrl(path);

  if (!data.publicUrl) {
    throw new StudentPhotoUploadError(
      "Failed to resolve photo URL.",
      "public_url_failed",
    );
  }

  return data.publicUrl;
}
