import type { PreparedGalleryUploadFile } from '@/lib/school-gallery/gallery-api';
import {
  chunkGalleryUploadByByteBudget,
  type SizedGalleryUploadItem,
} from '@/lib/school-gallery/gallery-upload-chunks';
import type { GalleryPhoto } from '@/lib/school-gallery/types';
import { readLocalFileBlob } from '@/lib/upload/append-local-file-to-form-data';

export type GalleryBlobUploadPart = PreparedGalleryUploadFile & {
  blob: Blob;
  sizeBytes: number;
};

export type GalleryUploadChunkProgress = {
  chunkIndex: number;
  chunkCount: number;
};

export async function loadGalleryUploadBlobParts(
  files: PreparedGalleryUploadFile[],
): Promise<GalleryBlobUploadPart[]> {
  const parts: GalleryBlobUploadPart[] = [];
  for (const file of files) {
    const blob = await readLocalFileBlob(file.uri);
    parts.push({
      ...file,
      blob,
      sizeBytes: blob.size,
    });
  }
  return parts;
}

export function chunkGalleryBlobUploadParts(
  parts: GalleryBlobUploadPart[],
): GalleryBlobUploadPart[][] {
  const sized: SizedGalleryUploadItem<GalleryBlobUploadPart>[] = parts.map((part) => ({
    item: part,
    sizeBytes: part.sizeBytes,
  }));
  return chunkGalleryUploadByByteBudget(sized);
}

export async function postGalleryFormDataChunks<T extends { photos?: GalleryPhoto[] }>(options: {
  path: string;
  photoDate: string;
  parts: GalleryBlobUploadPart[];
  postFormData: (path: string, formData: FormData) => Promise<T>;
  onChunkProgress?: (progress: GalleryUploadChunkProgress) => void;
}): Promise<GalleryPhoto[]> {
  const chunks = chunkGalleryBlobUploadParts(options.parts);
  if (chunks.length === 0) {
    throw new Error('Upload failed.');
  }

  const uploaded: GalleryPhoto[] = [];

  for (let index = 0; index < chunks.length; index++) {
    options.onChunkProgress?.({
      chunkIndex: index + 1,
      chunkCount: chunks.length,
    });

    const formData = new FormData();
    formData.append('photoDate', options.photoDate);
    for (const part of chunks[index]) {
      formData.append('files', part.blob, part.name);
    }

    const payload = await options.postFormData(options.path, formData);
    if (!payload.photos?.length) {
      throw new Error('Upload failed.');
    }
    uploaded.push(...payload.photos);
  }

  return uploaded;
}
