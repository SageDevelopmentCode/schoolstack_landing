import type { SupabaseClient } from "@supabase/supabase-js";
import { compressImageForUpload } from "@/lib/images/compress-image";
import { NEWSLETTER_UPLOAD_COMPRESS_OPTIONS } from "./newsletter-photos";

export const SCHOOL_NEWSLETTER_FILES_BUCKET = "school-newsletter-files";

export const MAX_NEWSLETTER_ASSET_BYTES = 10 * 1024 * 1024;

const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/;

export function buildNewsletterAssetStoragePath(
  organizationId: string,
  editionId: string,
  fileName: string,
  assetId = crypto.randomUUID(),
): string {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${organizationId}/editions/${editionId}/${assetId}_${safeName}`;
}

export function parseNewsletterDataUrl(
  dataUrl: string,
): { mimeType: string; bytes: Uint8Array; fileName: string } | null {
  const match = DATA_URL_PATTERN.exec(dataUrl.trim());
  if (!match) return null;
  const mimeType = match[1] ?? "image/jpeg";
  const base64 = match[2];
  if (!base64) return null;
  const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
  if (bytes.byteLength > MAX_NEWSLETTER_ASSET_BYTES) {
    throw new Error("Image exceeds the 10 MB limit.");
  }
  const ext =
    mimeType === "image/png"
      ? "png"
      : mimeType === "image/webp"
        ? "webp"
        : mimeType === "image/gif"
          ? "gif"
          : "jpg";
  return { mimeType, bytes, fileName: `cover.${ext}` };
}

export async function compressNewsletterImageBytes(
  bytes: Uint8Array,
  mimeType: string,
  fileName: string,
): Promise<{ body: Uint8Array | File; mimeType: string; fileName: string }> {
  if (mimeType !== "image/jpeg" && mimeType !== "image/png") {
    return { body: bytes, mimeType, fileName };
  }
  const blob = new Blob([Buffer.from(bytes)], { type: mimeType });
  const file = new File([blob], fileName, { type: mimeType });
  const compressed = await compressImageForUpload(file, NEWSLETTER_UPLOAD_COMPRESS_OPTIONS);
  return {
    body: compressed,
    mimeType: compressed.type || mimeType,
    fileName: compressed.name || fileName,
  };
}

export async function uploadNewsletterAsset(
  supabase: SupabaseClient,
  organizationId: string,
  editionId: string,
  body: Uint8Array | File | Blob,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const storagePath = buildNewsletterAssetStoragePath(organizationId, editionId, fileName);
  const { error } = await supabase.storage
    .from(SCHOOL_NEWSLETTER_FILES_BUCKET)
    .upload(storagePath, body, {
      contentType: mimeType || undefined,
      upsert: false,
    });
  if (error) throw error;
  return storagePath;
}

export async function deleteNewsletterAssetFiles(
  supabase: SupabaseClient,
  storagePaths: string[],
): Promise<void> {
  const paths = storagePaths.filter(Boolean);
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(SCHOOL_NEWSLETTER_FILES_BUCKET).remove(paths);
  if (error) throw error;
}

export async function getNewsletterAssetSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn = 60 * 60,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(SCHOOL_NEWSLETTER_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) {
    throw new Error("Failed to create a download link for this image.");
  }
  return data.signedUrl;
}
