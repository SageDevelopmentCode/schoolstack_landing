import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryButton } from '@/components/story/story-button';
import { StoryTextField } from '@/components/story/story-text-field';
import { ThemedText } from '@/components/themed-text';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import { MobileApiFormDataError } from '@/lib/api-form-data-error';
import { reportMobileOperationalError } from '@/lib/mobile-activity';
import { MAX_GALLERY_PHOTOS_PER_UPLOAD } from '@/lib/school-gallery/constants';
import {
  formatGalleryApiError,
  type GalleryBatchUploadOptions,
  type PreparedGalleryUploadFile,
} from '@/lib/school-gallery/gallery-api';
import { isGalleryUploadPartialFailure } from '@/lib/school-gallery/gallery-upload-partial-error';
import {
  GalleryPhotoPrepareError,
  prepareGalleryPhotoForUpload,
} from '@/lib/school-gallery/prepare-gallery-photo-for-upload';
import type { GalleryPhoto } from '@/lib/school-gallery/types';

type UploadPhase = 'idle' | 'preparing' | 'uploading';

type PendingGalleryRetry = {
  photoDate: string;
  files: PreparedGalleryUploadFile[];
};

type GalleryUploadSheetProps = {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  onUploaded: (photos: GalleryPhoto[]) => void;
  uploadBatch: (
    photoDate: string,
    files: PreparedGalleryUploadFile[],
    options?: GalleryBatchUploadOptions,
  ) => Promise<GalleryPhoto[]>;
  uploadOperation: string;
  uploadSurface: 'school_admin' | 'teacher_portal';
};

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function GalleryUploadSheet({
  visible,
  onClose,
  organizationId,
  onUploaded,
  uploadBatch,
  uploadOperation,
  uploadSurface,
}: GalleryUploadSheetProps) {
  const theme = useParentTheme();
  const [photoDate, setPhotoDate] = useState(todayIsoDate());
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [prepareIndex, setPrepareIndex] = useState(0);
  const [prepareTotal, setPrepareTotal] = useState(0);
  const [statusLine, setStatusLine] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingRetry, setPendingRetry] = useState<PendingGalleryRetry | null>(null);
  const busy = phase !== 'idle';

  const resetProgress = useCallback(() => {
    setPhase('idle');
    setPrepareIndex(0);
    setPrepareTotal(0);
    setStatusLine('');
    setError(null);
  }, []);

  const reportUploadFailure = useCallback(
    (uploadError: unknown, message: string) => {
      if (uploadError instanceof GalleryPhotoPrepareError) {
        return;
      }
      if (isGalleryUploadPartialFailure(uploadError)) {
        return;
      }
      const responseStatus =
        uploadError instanceof MobileApiFormDataError ? uploadError.status : undefined;
      void reportMobileOperationalError(
        {
          organizationId,
          surface: uploadSurface,
          operation: uploadOperation,
          error: message,
          code: 'upload_failed',
          details:
            uploadError instanceof MobileApiFormDataError
              ? uploadError.responsePreview
              : undefined,
          metadata:
            uploadError instanceof MobileApiFormDataError
              ? {
                  httpStatus: uploadError.status,
                  ...(uploadError.code ? { apiCode: uploadError.code } : {}),
                }
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
        onUploaded(uploadError.uploadedPhotos);
        setPendingRetry({
          photoDate: uploadPhotoDate,
          files: uploadError.remainingFiles,
        });
        setError(
          `${formatGalleryApiError(uploadError, 'Could not upload photos.')} ${uploadError.remainingFiles.length} photo(s) still need to upload.`,
        );
        setPhase('idle');
        return;
      }

      const message = formatGalleryApiError(uploadError, 'Could not upload photos.');
      setError(message);
      setPhase('idle');
      reportUploadFailure(uploadError, message);
    },
    [onUploaded, reportUploadFailure],
  );

  const uploadPrepared = useCallback(
    async (trimmedDate: string, prepared: PreparedGalleryUploadFile[]) => {
      setPhase('uploading');
      setStatusLine('Uploading photos…');
      try {
        const photos = await uploadBatch(trimmedDate, prepared, {
          onChunkProgress: ({ chunkIndex, chunkCount }) => {
            setStatusLine(
              chunkCount > 1
                ? `Uploading batch ${chunkIndex} of ${chunkCount}…`
                : 'Uploading photos…',
            );
          },
        });
        onUploaded(photos);
        setPendingRetry(null);
        resetProgress();
        onClose();
      } catch (uploadError) {
        handleUploadFailure(uploadError, trimmedDate);
      }
    },
    [handleUploadFailure, onClose, onUploaded, resetProgress, uploadBatch],
  );

  const handleClose = () => {
    if (busy) return;
    resetProgress();
    setPendingRetry(null);
    onClose();
  };

  const handleRetryRemaining = async () => {
    if (!pendingRetry || pendingRetry.files.length === 0) {
      return;
    }
    setError(null);
    await uploadPrepared(pendingRetry.photoDate, pendingRetry.files);
  };

  const handlePickAndUpload = async () => {
    setError(null);
    setPendingRetry(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library access is required to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_GALLERY_PHOTOS_PER_UPLOAD,
      quality: 1,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

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

      await uploadPrepared(trimmedDate, prepared);
    } catch (uploadError) {
      handleUploadFailure(uploadError, trimmedDate);
    }
  };

  return (
    <BottomSheetShell
      visible={visible}
      onClose={handleClose}
      enableDragToDismiss={!busy}
      accessibilityLabel="Upload photos"
      header={
        <View style={styles.header}>
          <ThemedText type="title" style={{ color: theme.ink }}>Upload photos</ThemedText>
          <ThemedText type="small" style={{ color: theme.muted, marginTop: 4 }}>
            Photos are compressed before upload to save space.
          </ThemedText>
        </View>
      }>
      <View style={styles.content}>
        <StoryTextField
          label="Photo date"
          value={photoDate}
          onChangeText={setPhotoDate}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
          editable={!busy}
        />

        {error ? <Text style={[styles.error, { color: theme.alert }]}>{error}</Text> : null}

        {busy ? (
          <View style={styles.progressRow}>
            <ActivityIndicator color={theme.primary} />
            <Text style={[styles.progressText, { color: theme.muted }]}>
              {statusLine ||
                (phase === 'preparing' && prepareTotal > 0
                  ? `Compressing ${prepareIndex} of ${prepareTotal}…`
                  : 'Working…')}
            </Text>
          </View>
        ) : null}

        {pendingRetry && pendingRetry.files.length > 0 && !busy ? (
          <StoryButton
            label={`Retry remaining (${pendingRetry.files.length})`}
            onPress={() => void handleRetryRemaining()}
            disabled={busy}
          />
        ) : null}

        <StoryButton
          label="Choose photos"
          onPress={() => void handlePickAndUpload()}
          disabled={busy}
        />
        <Text style={[styles.hint, { color: theme.muted }]}>
          Up to {MAX_GALLERY_PHOTOS_PER_UPLOAD} images per batch. JPEG, PNG, or WebP.
        </Text>
      </View>
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: Spacing.two,
  },
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  error: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  progressText: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    flex: 1,
  },
  hint: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
