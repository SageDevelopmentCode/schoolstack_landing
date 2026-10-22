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
import { reportMobileOperationalError } from '@/lib/mobile-activity';
import { MAX_GALLERY_PHOTOS_PER_UPLOAD } from '@/lib/school-gallery/constants';
import { formatGalleryApiError, type PreparedGalleryUploadFile } from '@/lib/school-gallery/gallery-api';
import {
  GalleryPhotoPrepareError,
  prepareGalleryPhotoForUpload,
} from '@/lib/school-gallery/prepare-gallery-photo-for-upload';
import type { GalleryPhoto } from '@/lib/school-gallery/types';

type UploadPhase = 'idle' | 'preparing' | 'uploading';

type GalleryUploadSheetProps = {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  onUploaded: (photos: GalleryPhoto[]) => void;
  uploadBatch: (
    photoDate: string,
    files: PreparedGalleryUploadFile[],
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
  const busy = phase !== 'idle';

  const resetProgress = useCallback(() => {
    setPhase('idle');
    setPrepareIndex(0);
    setPrepareTotal(0);
    setStatusLine('');
    setError(null);
  }, []);

  const handleClose = () => {
    if (busy) return;
    resetProgress();
    onClose();
  };

  const handlePickAndUpload = async () => {
    setError(null);
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

      setPhase('uploading');
      setStatusLine('Uploading photos…');
      const photos = await uploadBatch(trimmedDate, prepared);
      onUploaded(photos);
      resetProgress();
      onClose();
    } catch (uploadError) {
      const message = formatGalleryApiError(uploadError, 'Could not upload photos.');
      setError(message);
      setPhase('idle');
      if (!(uploadError instanceof GalleryPhotoPrepareError)) {
        void reportMobileOperationalError(
          {
            organizationId,
            surface: uploadSurface,
            operation: uploadOperation,
            error: message,
            code: 'upload_failed',
          },
          uploadError,
        );
      }
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
