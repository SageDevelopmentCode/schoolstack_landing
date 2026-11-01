import type { PreparedGalleryUploadFile } from '@/lib/school-gallery/gallery-api';
import { remainingGalleryChunks } from '@/lib/school-gallery/gallery-upload-chunks';
import type { GalleryPhoto } from '@/lib/school-gallery/types';

export class GalleryUploadPartialFailureError extends Error {
  readonly uploadedPhotos: GalleryPhoto[];
  readonly remainingFiles: PreparedGalleryUploadFile[];

  constructor(
    message: string,
    options: {
      uploadedPhotos: GalleryPhoto[];
      remainingFiles: PreparedGalleryUploadFile[];
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = 'GalleryUploadPartialFailureError';
    this.uploadedPhotos = options.uploadedPhotos;
    this.remainingFiles = options.remainingFiles;
  }
}

export function isGalleryUploadPartialFailure(
  error: unknown,
): error is GalleryUploadPartialFailureError {
  return error instanceof GalleryUploadPartialFailureError;
}

function preparedFileFromBlobPart(part: {
  uri: string;
  name: string;
  type: string;
}): PreparedGalleryUploadFile {
  return {
    uri: part.uri,
    name: part.name,
    type: part.type,
  };
}

type GalleryBlobUploadPartLike = PreparedGalleryUploadFile & {
  blob?: Blob;
  sizeBytes?: number;
};

export function remainingPreparedGalleryFilesFromParts(
  fromChunkIndex: number,
  chunks: GalleryBlobUploadPartLike[][],
): PreparedGalleryUploadFile[] {
  const remaining = remainingGalleryChunks(chunks, fromChunkIndex);
  return remaining.map(preparedFileFromBlobPart);
}
