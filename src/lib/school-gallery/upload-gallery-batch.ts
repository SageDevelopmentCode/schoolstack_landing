import { prepareGalleryPhotoForUpload } from "@/lib/school-gallery/storage";
import {
  chunkGalleryUploadByByteBudget,
  remainingGalleryChunks,
  type SizedGalleryUploadItem,
} from "@/lib/school-gallery/gallery-upload-chunks";
import { GalleryUploadPartialFailureError } from "@/lib/school-gallery/gallery-upload-partial-error";
import type { GalleryPhoto } from "@/lib/school-gallery/types";

export type GalleryUploadPrepareProgress = {
  index: number;
  total: number;
  fileName: string;
};

export type GalleryUploadHttpProgress = {
  loaded: number;
  total: number;
};

export type UploadGalleryBatchInput = {
  files: File[];
  photoDate: string;
  uploadUrl: string;
  onPrepareProgress?: (progress: GalleryUploadPrepareProgress) => void;
  onUploadProgress?: (progress: GalleryUploadHttpProgress) => void;
  onUploadChunk?: (chunkIndex: number, chunkCount: number) => void;
};

export type UploadGalleryBatchResult = {
  photos: GalleryPhoto[];
};

export async function uploadGalleryBatch(
  input: UploadGalleryBatchInput,
): Promise<UploadGalleryBatchResult> {
  const { files, photoDate, uploadUrl } = input;
  if (files.length === 0) {
    throw new Error("No files selected.");
  }

  const prepared: File[] = [];
  const total = files.length;

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    prepared.push(await prepareGalleryPhotoForUpload(file));
    input.onPrepareProgress?.({
      index: index + 1,
      total,
      fileName: file.name,
    });
  }

  const sized: SizedGalleryUploadItem<File>[] = prepared.map((file) => ({
    item: file,
    sizeBytes: file.size,
  }));
  const chunks = chunkGalleryUploadByByteBudget(sized);

  const allPhotos: GalleryPhoto[] = [];

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    input.onUploadChunk?.(chunkIndex + 1, chunks.length);

    const formData = new FormData();
    formData.set("photoDate", photoDate);
    for (const file of chunks[chunkIndex]) {
      formData.append("files", file);
    }

    try {
      const responseBody = await postFormDataWithProgress(
        uploadUrl,
        formData,
        input.onUploadProgress,
      );

      const data = JSON.parse(responseBody) as {
        photos?: GalleryPhoto[];
        error?: string;
      };

      if (!data.photos?.length) {
        throw new Error(data.error ?? "Upload failed.");
      }

      allPhotos.push(...data.photos);
    } catch (error) {
      throwGalleryUploadChunkFailure(error, {
        chunkIndex,
        chunks,
        uploadedPhotos: allPhotos,
      });
    }
  }

  return { photos: allPhotos };
}

function throwGalleryUploadChunkFailure(
  error: unknown,
  context: {
    chunkIndex: number;
    chunks: File[][];
    uploadedPhotos: GalleryPhoto[];
  },
): never {
  const message =
    error instanceof Error ? error.message : "Upload failed.";
  const hasPartialProgress =
    context.chunkIndex > 0 || context.uploadedPhotos.length > 0;

  if (hasPartialProgress) {
    throw new GalleryUploadPartialFailureError(message, {
      uploadedPhotos: context.uploadedPhotos,
      remainingFiles: remainingGalleryChunks(
        context.chunks,
        context.chunkIndex,
      ),
      cause: error,
    });
  }

  if (error instanceof Error) {
    throw error;
  }
  throw new Error(message);
}

function postFormDataWithProgress(
  url: string,
  formData: FormData,
  onUploadProgress?: (progress: GalleryUploadHttpProgress) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "text";

    xhr.upload.onprogress = (event) => {
      onUploadProgress?.({
        loaded: event.loaded,
        total: event.lengthComputable ? event.total : 0,
      });
    };

    xhr.onload = () => {
      const body = xhr.responseText;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body);
        return;
      }

      try {
        const parsed = JSON.parse(body) as { error?: string };
        reject(new Error(parsed.error ?? "Upload failed."));
      } catch {
        if (xhr.status === 413) {
          reject(
            new Error(
              "Too many photos at once — try fewer or upload again in smaller groups.",
            ),
          );
          return;
        }
        reject(new Error("Upload failed."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed."));
    };

    xhr.send(formData);
  });
}
