export const MAX_GALLERY_PHOTOS_PER_UPLOAD = 25;
export const MAX_GALLERY_PHOTO_BYTES = 10 * 1024 * 1024;

export const GALLERY_IMAGE_COMPRESS_OPTIONS = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85,
  skipBelowBytes: 300 * 1024,
} as const;

export const GALLERY_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
