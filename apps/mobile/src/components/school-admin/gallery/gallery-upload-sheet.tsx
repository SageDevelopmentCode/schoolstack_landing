import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryButton } from '@/components/story/story-button';
import { StoryDateField } from '@/components/story/story-date-field';
import { ThemedText } from '@/components/themed-text';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import { MAX_GALLERY_PHOTOS_PER_UPLOAD } from '@/lib/school-gallery/constants';
import type { GalleryBatchUploadOptions, PreparedGalleryUploadFile } from '@/lib/school-gallery/gallery-api';
import type { GalleryPhoto } from '@/lib/school-gallery/types';
import { useGalleryUpload } from '@/lib/school-gallery/use-gallery-upload';

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
  const upload = useGalleryUpload({
    organizationId,
    onUploaded,
    uploadBatch,
    uploadOperation,
    uploadSurface,
    onComplete: () => onClose(),
  });
  const {
    uploadSubcopy,
    photoDate,
    setPhotoDate,
    phase,
    busy,
    prepareIndex,
    prepareTotal,
    statusLine,
    error,
    pendingRetry,
  } = upload;

  const handleClose = () => {
    if (busy) return;
    upload.reset();
    onClose();
  };

  const handleRetryRemaining = () => upload.retryRemaining();
  const handlePickAndUpload = () => upload.pickAndUpload();

  return (
    <BottomSheetShell
      visible={visible}
      onClose={handleClose}
      enableDragToDismiss={!busy}
      accessibilityLabel="Upload photos"
      scrollContentStyle={styles.content}
      header={
        <View style={styles.header}>
          <ThemedText type="title" style={{ color: theme.ink }}>Upload photos</ThemedText>
          <ThemedText type="small" style={{ color: theme.muted, marginTop: 4 }}>
            {uploadSubcopy}
          </ThemedText>
        </View>
      }>
      <>
        <StoryDateField
          label="Photo date"
          value={photoDate}
          onChange={setPhotoDate}
          disabled={busy}
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
      </>
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.two,
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
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
