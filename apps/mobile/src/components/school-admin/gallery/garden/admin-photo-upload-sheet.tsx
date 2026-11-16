import { StyleSheet, Text, View } from 'react-native';

import { GDateField, GInlineBanner } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { GStepList, type GStep } from '@/components/parent/garden/steps';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GChip, GProgress, GToyButton } from '@/components/parent/garden/ui';
import { MAX_GALLERY_PHOTOS_PER_UPLOAD } from '@/lib/school-gallery/constants';
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';
import type { useGalleryUpload } from '@/lib/school-gallery/use-gallery-upload';

type Upload = ReturnType<typeof useGalleryUpload>;

/**
 * Garden "Upload photos" sheet: the shared upload pipeline shown as steps
 * (Photo date → Choose photos → Upload) with live progress, the partial
 * failure "Retry remaining" path and an in-sheet error. Success closes the
 * sheet and the screen toasts.
 */
export function AdminPhotoUploadSheet({
  visible,
  upload,
  onClose,
}: {
  visible: boolean;
  upload: Upload;
  onClose: () => void;
}) {
  const { busy, phase, prepareIndex, prepareTotal, chunk, statusLine, error, pendingRetry, photoDate } = upload;
  const hasDate = Boolean(photoDate.trim());
  const retryCount = pendingRetry?.files.length ?? 0;

  const progress =
    phase === 'preparing' && prepareTotal > 0
      ? (prepareIndex / prepareTotal) * 0.5
      : phase === 'uploading'
        ? 0.5 + (chunk && chunk.count > 0 ? ((chunk.index - 1) / chunk.count) * 0.5 : 0.1)
        : 0;

  const steps: GStep[] = [
    {
      id: 'date',
      title: 'Pick the photo date',
      meta: hasDate ? formatGalleryDateLabel(photoDate.trim()) : 'Families see photos grouped by this date.',
      state: hasDate ? 'done' : 'current',
    },
    {
      id: 'choose',
      title: 'Choose photos',
      meta: prepareTotal > 0 ? `${prepareTotal} selected` : `Up to ${MAX_GALLERY_PHOTOS_PER_UPLOAD} images per batch. JPEG, PNG, or WebP.`,
      state: prepareTotal > 0 || busy ? 'done' : hasDate ? 'current' : 'todo',
    },
    {
      id: 'upload',
      title: busy ? (phase === 'preparing' ? 'Compressing' : 'Uploading') : retryCount > 0 ? 'Some photos still need to upload' : 'Upload',
      meta: busy ? statusLine || 'Working…' : retryCount > 0 ? `${retryCount} left` : 'Families see them as soon as it finishes.',
      state: busy || retryCount > 0 ? 'current' : 'todo',
      chip: busy ? { label: 'In progress', tone: 'info' } : retryCount > 0 ? { label: 'Needs retry', tone: 'warning' } : null,
    },
  ];

  const close = () => {
    if (busy) return;
    upload.reset();
    onClose();
  };

  return (
    <GSheet
      visible={visible}
      onClose={close}
      title="Upload photos"
      subtitle={upload.uploadSubcopy}
      accessibilityLabel="Upload photos"
      enableDragToDismiss={!busy}
      headerAside={busy ? <GChip label="Uploading" tone="info" /> : null}
      footer={
        <View style={styles.footer}>
          {busy ? (
            <Text style={styles.footerNote} accessibilityLiveRegion="polite">
              Keep this open until it finishes.
            </Text>
          ) : null}
          {retryCount > 0 && !busy ? (
            <GToyButton
              label={`Retry remaining (${retryCount})`}
              icon="refresh"
              fullWidth
              onPress={() => void upload.retryRemaining()}
            />
          ) : (
            <GToyButton
              label={busy ? 'Uploading…' : 'Choose photos'}
              icon="images-outline"
              loading={busy}
              disabled={busy || !hasDate}
              fullWidth
              onPress={() => void upload.pickAndUpload()}
            />
          )}
        </View>
      }>
      <View style={styles.body}>
        <GStepList steps={steps} accessibilityLabel="Upload steps" />
        <GDateField label="Photo date" value={photoDate} onChange={upload.setPhotoDate} disabled={busy} />
        {busy ? <GProgress value={progress} label={statusLine || 'Working…'} /> : null}
        {error ? <GInlineBanner tone="error" title="Upload didn't finish" description={error} /> : null}
      </View>
    </GSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: 16 },
  footer: { gap: 8 },
  footerNote: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft, textAlign: 'center' },
});
