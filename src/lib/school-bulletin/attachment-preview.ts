const BULLETIN_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isBulletinImageAttachment(mimeType: string | null): boolean {
  return mimeType !== null && BULLETIN_IMAGE_MIME_TYPES.has(mimeType);
}

export function isBulletinPdfAttachment(mimeType: string | null): boolean {
  return mimeType === "application/pdf";
}

export function canPreviewBulletinAttachment(mimeType: string | null): boolean {
  return isBulletinImageAttachment(mimeType) || isBulletinPdfAttachment(mimeType);
}
