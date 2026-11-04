import {
  compressImageForUpload,
  type PickerImageAsset,
} from '@/lib/images/compress-image-for-upload';
import type { LocalUploadFile } from '@/lib/upload/append-local-file-to-form-data';

const PROFILE_IMAGE_COMPRESS_OPTIONS = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.85,
  skipBelowBytes: 100 * 1024,
} as const;

export async function prepareProfilePhotoForUpload(
  uri: string,
  mimeType?: string,
  fileName?: string,
): Promise<LocalUploadFile> {
  const asset: PickerImageAsset = {
    uri,
    mimeType: mimeType ?? 'image/jpeg',
    fileName: fileName ?? 'profile-photo.jpg',
  };
  const compressed = await compressImageForUpload(asset, PROFILE_IMAGE_COMPRESS_OPTIONS);
  return {
    uri: compressed.uri,
    name: compressed.fileName,
    type: compressed.mimeType,
  };
}
