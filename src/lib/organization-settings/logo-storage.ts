import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImageForUpload } from "@/lib/images/compress-image";

export const ORGANIZATION_BRANDING_BUCKET = "organization-branding";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const ALLOWED_LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export class OrganizationLogoUploadError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "OrganizationLogoUploadError";
    this.code = code;
  }
}

function logoExtensionForFile(file: File): string {
  const fromMime = EXTENSION_BY_MIME[file.type];
  if (fromMime) return fromMime;

  const match = file.name.match(/\.([a-zA-Z0-9]+)$/);
  const ext = match?.[1]?.toLowerCase();
  if (ext === "png" || ext === "jpg" || ext === "jpeg") return "jpg";
  if (ext === "webp") return "webp";
  if (ext === "svg") return "svg";

  throw new OrganizationLogoUploadError(
    "Logo must be a PNG, JPEG, WebP, or SVG image.",
    "invalid_type",
  );
}

export function validateOrganizationLogoFile(file: File): void {
  if (!ALLOWED_LOGO_MIME_TYPES.has(file.type)) {
    throw new OrganizationLogoUploadError(
      "Logo must be a PNG, JPEG, WebP, or SVG image.",
      "invalid_type",
    );
  }

  if (file.size > MAX_LOGO_BYTES) {
    throw new OrganizationLogoUploadError(
      "Logo must be 2 MB or smaller.",
      "file_too_large",
    );
  }
}

export function organizationLogoStoragePath(
  organizationId: string,
  file: File,
): string {
  const extension = logoExtensionForFile(file);
  return `${organizationId}/logo.${extension}`;
}

export async function uploadOrganizationLogo(
  supabase: SupabaseClient,
  organizationId: string,
  file: File,
): Promise<string> {
  validateOrganizationLogoFile(file);

  const prepared = await compressImageForUpload(file, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.82,
    skipBelowBytes: 100 * 1024,
  });

  const path = organizationLogoStoragePath(organizationId, prepared);

  const { error: uploadError } = await supabase.storage
    .from(ORGANIZATION_BRANDING_BUCKET)
    .upload(path, prepared, {
      upsert: true,
      contentType: prepared.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new OrganizationLogoUploadError(
      uploadError.message,
      "upload_failed",
    );
  }

  const { data } = supabase.storage
    .from(ORGANIZATION_BRANDING_BUCKET)
    .getPublicUrl(path);

  if (!data.publicUrl) {
    throw new OrganizationLogoUploadError(
      "Failed to resolve logo URL.",
      "public_url_failed",
    );
  }

  return data.publicUrl;
}
