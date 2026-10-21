import { compressImageForUpload, type PickerImageAsset } from '@/lib/images/compress-image-for-upload';
import {
  GALLERY_ALLOWED_MIME_TYPES,
  GALLERY_IMAGE_COMPRESS_OPTIONS,
  MAX_GALLERY_PHOTO_BYTES,
} from '@/lib/school-gallery/constants';
import type { PreparedGalleryUploadFile } from '@/lib/school-gallery/gallery-api';

export class GalleryPhotoPrepareError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'GalleryPhotoPrepareError';
    this.code = code;
  }
}

function resolveMimeType(asset: PickerImageAsset): string {
  if (asset.mimeType?.trim()) {
    return asset.mimeType.trim();
  }
  return 'image/jpeg';
}

export function validateGalleryPickerAsset(asset: PickerImageAsset, displayName: string): void {
  const mimeType = resolveMimeType(asset);
  if (!GALLERY_ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new GalleryPhotoPrepareError(
      `"${displayName}" must be a JPEG, PNG, or WebP image.`,
      'invalid_type',
    );
  }

  if (asset.fileSize != null && asset.fileSize > MAX_GALLERY_PHOTO_BYTES) {
    throw new GalleryPhotoPrepareError(`"${displayName}" exceeds the 10 MB limit.`, 'too_large');
  }
}

export async function prepareGalleryPhotoForUpload(
  asset: PickerImageAsset,
  index: number,
): Promise<PreparedGalleryUploadFile> {
  const displayName = asset.fileName?.trim() || `photo-${index + 1}.jpg`;
  validateGalleryPickerAsset(asset, displayName);

  const compressed = await compressImageForUpload(asset, GALLERY_IMAGE_COMPRESS_OPTIONS);
  return {
    uri: compressed.uri,
    name: compressed.fileName,
    type: compressed.mimeType,
  };
}
