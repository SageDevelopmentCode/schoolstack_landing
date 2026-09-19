import type { BulletinAttachment } from '@/lib/school-bulletin/types';

const BULLETIN_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export function isBulletinImageAttachment(mimeType: string | null): boolean {
  return mimeType !== null && BULLETIN_IMAGE_MIME_TYPES.has(mimeType);
}

export function isBulletinPdfAttachment(mimeType: string | null): boolean {
  return mimeType === 'application/pdf';
}

export function canPreviewBulletinAttachment(mimeType: string | null): boolean {
  return isBulletinImageAttachment(mimeType) || isBulletinPdfAttachment(mimeType);
}

export function buildBulletinImageViewerState(
  attachments: BulletinAttachment[],
  attachment: BulletinAttachment,
): { attachments: BulletinAttachment[]; index: number } {
  const imageAttachments = attachments.filter(
    (item) => item.downloadUrl && isBulletinImageAttachment(item.mimeType),
  );
  const index = imageAttachments.findIndex((item) => item.id === attachment.id);
  return {
    attachments: imageAttachments,
    index: index >= 0 ? index : 0,
  };
}
