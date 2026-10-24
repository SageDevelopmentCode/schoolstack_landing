import {
  cacheDirectory,
  deleteAsync,
  downloadAsync,
} from 'expo-file-system/legacy';
import { Platform, Share } from 'react-native';

import type { GalleryPhoto } from '@/lib/school-gallery/types';

const DEFAULT_IMAGE_EXTENSION = '.jpg';

export function sanitizeGalleryPhotoFileName(fileName: string): string {
  const trimmed = fileName.trim();
  const base = trimmed.replace(/[/\\]/g, '_').replace(/\.\./g, '_');
  const sanitized = base.replace(/[^\w.\- ()]/g, '_');
  return sanitized.length > 0 ? sanitized : 'photo';
}

export function galleryPhotoCacheFileUri(photoId: string, fileName: string): string {
  const safeName = sanitizeGalleryPhotoFileName(fileName);
  const base = cacheDirectory ?? '';
  return `${base}gallery-${photoId}-${safeName}`;
}

function fileExtensionFromMimeType(mimeType: string | null | undefined): string {
  switch (mimeType) {
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/jpeg':
      return '.jpg';
    default:
      return DEFAULT_IMAGE_EXTENSION;
  }
}

function ensureFileExtension(fileName: string, mimeType: string | null | undefined): string {
  if (/\.[a-zA-Z0-9]+$/.test(fileName)) {
    return fileName;
  }
  return `${fileName}${fileExtensionFromMimeType(mimeType)}`;
}

export type ShareGalleryPhotoResult =
  | { outcome: 'shared' }
  | { outcome: 'dismissed' };

export async function shareGalleryPhoto(photo: GalleryPhoto): Promise<ShareGalleryPhotoResult> {
  const imageUrl = photo.imageUrl?.trim();
  if (!imageUrl) {
    throw new Error('Image unavailable.');
  }

  const cachePath = galleryPhotoCacheFileUri(
    photo.id,
    ensureFileExtension(photo.fileName, photo.mimeType),
  );

  await deleteAsync(cachePath, { idempotent: true });

  const download = await downloadAsync(imageUrl, cachePath);
  if (download.status < 200 || download.status >= 300) {
    await deleteAsync(cachePath, { idempotent: true });
    throw new Error('Could not download this photo.');
  }

  try {
    const shareResult = await Share.share(
      Platform.OS === 'android'
        ? { url: download.uri, title: photo.fileName }
        : { url: download.uri },
    );

    if (shareResult.action === Share.dismissedAction) {
      return { outcome: 'dismissed' };
    }
    return { outcome: 'shared' };
  } catch (error) {
    if (Platform.OS === 'android') {
      try {
        const fallback = await Share.share({ message: imageUrl, title: photo.fileName });
        if (fallback.action === Share.dismissedAction) {
          return { outcome: 'dismissed' };
        }
        return { outcome: 'shared' };
      } catch {
        throw error;
      }
    }
    throw error;
  }
}
