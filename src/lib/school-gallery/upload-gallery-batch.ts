import { prepareGalleryPhotoForUpload } from "@/lib/school-gallery/storage";
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

  const formData = new FormData();
  formData.set("photoDate", photoDate);
  for (const file of prepared) {
    formData.append("files", file);
  }

  const responseBody = await postFormDataWithProgress(
    uploadUrl,
    formData,
    input.onUploadProgress,
  );

  const data = JSON.parse(responseBody) as {
    photos?: GalleryPhoto[];
    error?: string;
  };

  if (!data.photos) {
    throw new Error(data.error ?? "Upload failed.");
  }

  return { photos: data.photos };
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
        reject(new Error("Upload failed."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed."));
    };

    xhr.send(formData);
  });
}
