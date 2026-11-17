import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GDateField, GInlineBanner } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GToyButton } from '@/components/parent/garden/ui';
import type { GalleryScreenController } from '@/components/school-admin/gallery/garden/use-gallery-screen-controller';
import { AdminWorkRow } from '@/components/school-admin/garden/admin-ui';
import { formatGalleryDateLabel } from '@/lib/school-gallery/format-gallery-date';

/**
 * Long-press actions for a gallery photo: View, plus Edit date / Delete when
 * the viewer may manage it. Otherwise it explains who can.
 */
export function GalleryPhotoActionSheet({
  controller,
  cannotManageNote,
}: {
  controller: GalleryScreenController;
  /** Shown instead of Edit date / Delete on a photo the viewer can't change. */
  cannotManageNote?: string;
}) {
  // Keep the last photo while the sheet animates closed.
  const [shown, setShown] = useState(controller.actionPhoto);
  if (controller.actionPhoto && controller.actionPhoto !== shown) setShown(controller.actionPhoto);
  const photo = controller.actionPhoto ?? shown;
  const manage = photo ? controller.canManagePhoto(photo) : false;
  const close = controller.closePhotoActions;
  // Run the chosen action only once this native modal has fully dismissed:
  // iOS drops a modal (the viewer, the date sheet) presented while another is closing.
  const afterClose = useRef<(() => void) | null>(null);
  const closeThenRun = useCallback(
    (action: () => void) => {
      afterClose.current = action;
      close();
    },
    [close],
  );
  const onDismissed = useCallback(() => {
    const action = afterClose.current;
    afterClose.current = null;
    action?.();
  }, []);
  return (
    <GSheet
      visible={controller.actionPhoto != null}
      onClose={close}
      onDismissed={onDismissed}
      title={photo?.fileName ?? 'Photo'}
      subtitle={
        photo
          ? `${formatGalleryDateLabel(photo.photoDate)}${photo.uploadedByName ? ` · Uploaded by ${photo.uploadedByName}` : ''}`
          : undefined
      }>
      {photo ? (
        <>
          <AdminWorkRow
            icon="expand-outline"
            tint={Garden.sky}
            title="View"
            meta="Full screen, swipe and share"
            onPress={() => closeThenRun(() => controller.openPhoto(photo))}
          />
          {manage ? (
            <>
              <AdminWorkRow
                divider
                icon="calendar-outline"
                tint={Garden.butter}
                title="Edit date"
                meta="Move it to a different day"
                onPress={() => closeThenRun(() => controller.openEditDate(photo))}
              />
              <AdminWorkRow
                divider
                icon="trash-outline"
                tint={Garden.peach}
                title="Delete"
                meta="Families stop seeing it"
                onPress={() => closeThenRun(() => void controller.deletePhoto(photo))}
              />
            </>
          ) : cannotManageNote ? (
            <View style={styles.note}>
              <Text style={styles.noteText}>{cannotManageNote}</Text>
            </View>
          ) : null}
        </>
      ) : null}
    </GSheet>
  );
}

/** Move a photo to another day: date field, one toy Save, errors inline. */
export function GalleryEditDateSheet({ controller }: { controller: GalleryScreenController }) {
  const { savingDate, editError } = controller;
  const [shown, setShown] = useState(controller.editPhoto);
  if (controller.editPhoto && controller.editPhoto !== shown) setShown(controller.editPhoto);
  const editPhoto = controller.editPhoto ?? shown;
  return (
    <GSheet
      visible={controller.editPhoto != null}
      onClose={controller.closeEditDate}
      title="Photo date"
      subtitle={editPhoto?.fileName}
      footer={
        <GToyButton
          label={savingDate ? 'Saving…' : 'Save'}
          icon="checkmark"
          loading={savingDate}
          disabled={savingDate}
          fullWidth
          onPress={() => void controller.saveDate()}
        />
      }>
      <View style={styles.editBody}>
        <GDateField
          label="Photo date"
          value={controller.editDateValue}
          onChange={controller.setEditDateValue}
          disabled={savingDate}
        />
        {editError ? <GInlineBanner tone="error" title="Couldn't update the date" description={editError} /> : null}
      </View>
    </GSheet>
  );
}

const styles = StyleSheet.create({
  note: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Garden.notebook,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  noteText: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft },
  editBody: { gap: 14 },
});
