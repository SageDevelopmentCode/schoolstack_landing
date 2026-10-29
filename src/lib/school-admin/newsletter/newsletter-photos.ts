import {
  compressImageForUpload,
  type CompressImageOptions,
} from "@/lib/images/compress-image";

export const NEWSLETTER_UPLOAD_COMPRESS_OPTIONS: CompressImageOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85,
  skipBelowBytes: 300 * 1024,
};

const MAX_NEWSLETTER_INLINE_IMAGE_BYTES = 10 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/** @deprecated Use prepareNewsletterImageFileForUpload */
export async function resizeImageFileToDataUrl(file: File): Promise<string> {
  return prepareNewsletterImageFileForUpload(file);
}

export async function prepareNewsletterImageFileForUpload(file: File): Promise<string> {
  if (file.size > MAX_NEWSLETTER_INLINE_IMAGE_BYTES) {
    throw new Error("Image exceeds the 10 MB limit.");
  }

  let prepared = file;
  try {
    prepared = await compressImageForUpload(file, NEWSLETTER_UPLOAD_COMPRESS_OPTIONS);
  } catch {
    prepared = file;
  }

  if (prepared.size > MAX_NEWSLETTER_INLINE_IMAGE_BYTES) {
    throw new Error("Image exceeds the 10 MB limit.");
  }

  return fileToDataUrl(prepared);
}
