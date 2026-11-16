import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

import { MobileApiFormDataError } from '@/lib/api-form-data-error';
import { isGalleryImageCompressionAvailable } from '@/lib/images/compress-image-for-upload';
import { reportMobileOperationalError } from '@/lib/mobile-activity';
import { MAX_GALLERY_PHOTOS_PER_UPLOAD } from '@/lib/school-gallery/constants';
import {
  formatGalleryApiError,
  type GalleryBatchUploadOptions,
  type PreparedGalleryUploadFile,
} from '@/lib/school-gallery/gallery-api';
import { todayGalleryPhotoDate } from '@/lib/school-gallery/gallery-photo-date';
import { isGalleryUploadPartialFailure } from '@/lib/school-gallery/gallery-upload-partial-error';
import { GalleryPhotoPrepareError, prepareGalleryPhotoForUpload } from '@/lib/school-gallery/prepare-gallery-photo-for-upload';
import type { GalleryPhoto } from '@/lib/school-gallery/types';

export type GalleryUploadPhase = 'idle' | 'preparing' | 'uploading';

export type PendingGalleryRetry = { photoDate: string; files: PreparedGalleryUploadFile[] };

export type UseGalleryUploadOptions = {
  organizationId: string;
  onUploaded: (photos: GalleryPhoto[]) => void;
  uploadBatch: (
    photoDate: string,
    files: PreparedGalleryUploadFile[],
    options?: GalleryBatchUploadOptions,
  ) => Promise<GalleryPhoto[]>;
  uploadOperation: string;
  uploadSurface: 'school_admin' | 'teacher_portal';
  /** Every photo uploaded (first try or "Retry remaining"). */
  onComplete: (result: { uploadedCount: number; photoDate: string }) => void;
};

/**
 * Gallery upload pipeline shared by the Story and Garden upload sheets:
 * library permission → multi-select → compress each photo → chunked upload
 * with progress → partial failures keep what uploaded and offer "Retry
 * remaining". Reports through `reportMobileOperationalError` (code
 * `upload_failed`), same as before.
 */
export function useGalleryUpload({
  organizationId,
  onUploaded,
  uploadBatch,
  uploadOperation,
  uploadSurface,
  onComplete,
}: UseGalleryUploadOptions) {
  const compressionAvailable = isGalleryImageCompressionAvailable();
  const uploadSubcopy = compressionAvailable
    ? 'Photos are compressed before upload to save space.'
    : 'Photos upload at original size on this app version. Update MudKitchen from the App Store for automatic compression.';

  const [photoDate, setPhotoDate] = useState(todayGalleryPhotoDate());
  const [phase, setPhase] = useState<GalleryUploadPhase>('idle');
  const [prepareIndex, setPrepareIndex] = useState(0);
  const [prepareTotal, setPrepareTotal] = useState(0);
  const [chunk, setChunk] = useState<{ index: number; count: number } | null>(null);
  const [statusLine, setStatusLine] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingRetry, setPendingRetry] = useState<PendingGalleryRetry | null>(null);
  const [uploadedSoFar, setUploadedSoFar] = useState(0);
  const busy = phase !== 'idle';

  const resetProgress = useCallback(() => {
    setPhase('idle');
    setPrepareIndex(0);
    setPrepareTotal(0);
    setChunk(null);
    setStatusLine('');
    setError(null);
  }, []);

  const reportUploadFailure = useCallback(
    (uploadError: unknown, message: string) => {
      if (uploadError instanceof GalleryPhotoPrepareError) return;
      if (isGalleryUploadPartialFailure(uploadError)) return;
      const responseStatus = uploadError instanceof MobileApiFormDataError ? uploadError.status : undefined;
      void reportMobileOperationalError(
        {
          organizationId,
          surface: uploadSurface,
          operation: uploadOperation,
          error: message,
          code: 'upload_failed',
          details: uploadError instanceof MobileApiFormDataError ? uploadError.responsePreview : undefined,
          metadata:
            uploadError instanceof MobileApiFormDataError
              ? { httpStatus: uploadError.status, ...(uploadError.code ? { apiCode: uploadError.code } : {}) }
              : undefined,
        },
        uploadError,
        responseStatus,
      );
    },
    [organizationId, uploadOperation, uploadSurface],
  );

  const handleUploadFailure = useCallback(
    (uploadError: unknown, uploadPhotoDate: string) => {
      if (isGalleryUploadPartialFailure(uploadError)) {
        if (uploadError.cause !== undefined) {
          reportUploadFailure(uploadError.cause, formatGalleryApiError(uploadError, 'Could not upload photos.'));
        }
        onUploaded(uploadError.uploadedPhotos);
        setUploadedSoFar((count) => count + uploadError.uploadedPhotos.length);
        setPendingRetry({ photoDate: uploadPhotoDate, files: uploadError.remainingFiles });
        setError(
          `${formatGalleryApiError(uploadError, 'Could not upload photos.')} ${uploadError.remainingFiles.length} photo(s) still need to upload.`,
        );
        setPhase('idle');
        setChunk(null);
        return;
      }
      const message = formatGalleryApiError(uploadError, 'Could not upload photos.');
      setError(message);
      setPhase('idle');
      setChunk(null);
      reportUploadFailure(uploadError, message);
    },
    [onUploaded, reportUploadFailure],
  );

  const uploadPrepared = useCallback(
    async (trimmedDate: string, prepared: PreparedGalleryUploadFile[], priorCount: number) => {
      setPhase('uploading');
      setStatusLine('Uploading photos…');
      try {
        const photos = await uploadBatch(trimmedDate, prepared, {
          onChunkProgress: ({ chunkIndex, chunkCount }) => {
            setChunk({ index: chunkIndex, count: chunkCount });
            setStatusLine(chunkCount > 1 ? `Uploading batch ${chunkIndex} of ${chunkCount}…` : 'Uploading photos…');
          },
        });
        onUploaded(photos);
        setPendingRetry(null);
        setUploadedSoFar(0);
        resetProgress();
        onComplete({ uploadedCount: priorCount + photos.length, photoDate: trimmedDate });
      } catch (uploadError) {
        handleUploadFailure(uploadError, trimmedDate);
      }
    },
    [handleUploadFailure, onComplete, onUploaded, resetProgress, uploadBatch],
  );

  /** Clears progress, errors and any pending retry (sheet closed). */
  const reset = useCallback(() => {
    resetProgress();
    setPendingRetry(null);
    setUploadedSoFar(0);
  }, [resetProgress]);

  const retryRemaining = useCallback(async () => {
    if (!pendingRetry || pendingRetry.files.length === 0) return;
    setError(null);
    await uploadPrepared(pendingRetry.photoDate, pendingRetry.files, uploadedSoFar);
  }, [pendingRetry, uploadPrepared, uploadedSoFar]);

  const pickAndUpload = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library access is required to upload photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_GALLERY_PHOTOS_PER_UPLOAD,
      quality: compressionAvailable ? 1 : 0.75,
    });
    if (result.canceled || result.assets.length === 0) return;
    setError(null);
    setPendingRetry(null);
    setUploadedSoFar(0);
    const trimmedDate = photoDate.trim();
    if (!trimmedDate) {
      setError('Photo date is required.');
      return;
    }
    setPhase('preparing');
    setPrepareTotal(result.assets.length);
    setPrepareIndex(0);
    try {
      const prepared = [];
      for (let index = 0; index < result.assets.length; index++) {
        const asset = result.assets[index];
        setStatusLine(`Compressing ${index + 1} of ${result.assets.length}…`);
        prepared.push(
          await prepareGalleryPhotoForUpload(
            {
              uri: asset.uri,
              width: asset.width,
              height: asset.height,
              fileSize: asset.fileSize,
              mimeType: asset.mimeType,
              fileName: asset.fileName,
            },
            index,
          ),
        );
        setPrepareIndex(index + 1);
      }
      await uploadPrepared(trimmedDate, prepared, 0);
    } catch (uploadError) {
      handleUploadFailure(uploadError, trimmedDate);
    }
  }, [compressionAvailable, handleUploadFailure, photoDate, uploadPrepared]);

  return {
    compressionAvailable,
    uploadSubcopy,
    photoDate,
    setPhotoDate,
    phase,
    busy,
    prepareIndex,
    prepareTotal,
    chunk,
    statusLine,
    error,
    pendingRetry,
    reset,
    retryRemaining,
    pickAndUpload,
  };
}
