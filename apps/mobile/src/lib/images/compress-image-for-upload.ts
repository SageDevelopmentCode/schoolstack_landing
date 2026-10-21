import * as ImageManipulator from 'expo-image-manipulator';

import {
  computeScaledDimensions,
  shouldSkipImageCompression,
} from '@/lib/images/compress-image-dimensions';

export type CompressImageOptions = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  skipBelowBytes?: number;
};

export type PickerImageAsset = {
  uri: string;
  width?: number | null;
  height?: number | null;
  fileSize?: number | null;
  mimeType?: string | null;
  fileName?: string | null;
};

export type CompressedImageResult = {
  uri: string;
  width: number;
  height: number;
  mimeType: string;
  fileName: string;
};

const RASTER_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function extensionForMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
    default:
      return 'jpg';
  }
}

function fileNameWithJpegExtension(fileName: string): string {
  const base = fileName.replace(/\.[^/.]+$/, '') || 'image';
  return `${base}.jpg`;
}

function resolveMimeType(mimeType: string | null | undefined): string {
  if (mimeType && RASTER_MIME_TYPES.has(mimeType)) {
    return mimeType;
  }
  return 'image/jpeg';
}

export async function compressImageForUpload(
  asset: PickerImageAsset,
  options: CompressImageOptions,
): Promise<CompressedImageResult> {
  const mimeType = resolveMimeType(asset.mimeType);
  const originalName = asset.fileName?.trim() || `photo-${Date.now()}.jpg`;

  if (!RASTER_MIME_TYPES.has(mimeType)) {
    return {
      uri: asset.uri,
      width: asset.width ?? 0,
      height: asset.height ?? 0,
      mimeType,
      fileName: originalName,
    };
  }

  if (shouldSkipImageCompression(asset.fileSize, options.skipBelowBytes)) {
    return {
      uri: asset.uri,
      width: asset.width ?? 0,
      height: asset.height ?? 0,
      mimeType,
      fileName: originalName,
    };
  }

  const sourceWidth = asset.width ?? options.maxWidth;
  const sourceHeight = asset.height ?? options.maxHeight;
  const { width, height } = computeScaledDimensions(
    sourceWidth,
    sourceHeight,
    options.maxWidth,
    options.maxHeight,
  );

  const actions: ImageManipulator.Action[] = [];
  if (width !== sourceWidth || height !== sourceHeight) {
    actions.push({ resize: { width, height } });
  }

  const result = await ImageManipulator.manipulateAsync(
    asset.uri,
    actions,
    {
      compress: options.quality,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    mimeType: 'image/jpeg',
    fileName: fileNameWithJpegExtension(originalName),
  };
}

export function extensionForCompressedMime(mimeType: string): string {
  return extensionForMimeType(mimeType);
}
