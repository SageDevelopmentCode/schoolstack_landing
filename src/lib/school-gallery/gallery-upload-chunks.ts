import { MAX_GALLERY_PHOTOS_PER_UPLOAD } from "./storage";

/** Stay under Vercel's ~4.5 MB function request body limit (multipart overhead included). */
export const MAX_GALLERY_UPLOAD_REQUEST_BYTES = 4 * 1024 * 1024;

const MULTIPART_REQUEST_OVERHEAD_BYTES = 1024;
const MULTIPART_FILE_OVERHEAD_BYTES = 512;

export type SizedGalleryUploadItem<T> = {
  item: T;
  sizeBytes: number;
};

export class GalleryUploadChunkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GalleryUploadChunkError";
  }
}

export function chunkGalleryUploadByByteBudget<T>(
  files: SizedGalleryUploadItem<T>[],
  options?: {
    maxRequestBytes?: number;
    maxFilesPerRequest?: number;
  },
): T[][] {
  const maxRequestBytes =
    options?.maxRequestBytes ?? MAX_GALLERY_UPLOAD_REQUEST_BYTES;
  const maxFilesPerRequest =
    options?.maxFilesPerRequest ?? MAX_GALLERY_PHOTOS_PER_UPLOAD;

  if (files.length === 0) {
    return [];
  }

  const chunks: T[][] = [];
  let current: T[] = [];
  let currentBytes = MULTIPART_REQUEST_OVERHEAD_BYTES;

  for (const { item, sizeBytes } of files) {
    if (sizeBytes > maxRequestBytes) {
      throw new GalleryUploadChunkError(
        "A photo is too large to upload in one request. Try a smaller image or update the app.",
      );
    }

    const fileCost = sizeBytes + MULTIPART_FILE_OVERHEAD_BYTES;
    const wouldExceedBytes =
      current.length > 0 && currentBytes + fileCost > maxRequestBytes;
    const wouldExceedCount = current.length >= maxFilesPerRequest;

    if (wouldExceedBytes || wouldExceedCount) {
      chunks.push(current);
      current = [];
      currentBytes = MULTIPART_REQUEST_OVERHEAD_BYTES;
    }

    current.push(item);
    currentBytes += fileCost;
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

export function remainingGalleryChunks<T>(
  chunks: T[][],
  fromChunkIndex: number,
): T[] {
  if (fromChunkIndex <= 0) {
    return chunks.flat();
  }
  return chunks.slice(fromChunkIndex).flat();
}
