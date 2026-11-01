import type { GalleryPhoto } from "@/lib/school-gallery/types";

export class GalleryUploadPartialFailureError extends Error {
  readonly uploadedPhotos: GalleryPhoto[];
  readonly remainingFiles: File[];

  constructor(
    message: string,
    options: {
      uploadedPhotos: GalleryPhoto[];
      remainingFiles: File[];
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "GalleryUploadPartialFailureError";
    this.uploadedPhotos = options.uploadedPhotos;
    this.remainingFiles = options.remainingFiles;
  }
}

export function isGalleryUploadPartialFailure(
  error: unknown,
): error is GalleryUploadPartialFailureError {
  return error instanceof GalleryUploadPartialFailureError;
}
