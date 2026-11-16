import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GChoiceChips, GDateField, GInlineBanner, GTextField } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GChip, GOutlineButton, GToyButton } from '@/components/parent/garden/ui';
import type { HealthFormValues } from '@/components/school-admin/students/student-health-form-sheet';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useBottomSheetKeyboardScrollStyle } from '@/hooks/use-bottom-sheet-keyboard-scroll-style';
import { haptic } from '@/lib/haptics';
import { SEVERITY_LABELS, type HealthAllergySeverity, type HealthItemType } from '@/lib/student-health/types';
import { requestCloseIfClean } from '@/lib/unsaved-changes';

function defaultValues(itemType: HealthItemType): HealthFormValues {
  const today = new Date().toISOString().slice(0, 10);
  if (itemType === 'allergy') {
    return { type: 'allergy', allergen: '', severity: 'medium', treatmentNotes: '' };
  }
  if (itemType === 'medication') {
    return { type: 'medication', name: '', dose: '', timeOfDay: '', instructions: '', startDate: today, ongoing: true };
  }
  return { type: 'update', title: '', details: '', startDate: today };
}

export function healthFormTitle(itemType: HealthItemType, editing: boolean): string {
  const noun = itemType === 'allergy' ? 'allergy' : itemType === 'medication' ? 'medication' : 'health update';
  return `${editing ? 'Edit' : 'Add'} ${noun}`;
}

const SEVERITY_OPTIONS = (Object.keys(SEVERITY_LABELS) as HealthAllergySeverity[]).map((severity) => ({
  id: severity,
  label: SEVERITY_LABELS[severity],
}));

/**
 * Garden health item form (allergy / medication / health update). Same fields,
 * dirty check and discard confirm as the Story `StudentHealthFormSheet`, on the
 * approved keyboard path (`BottomSheetShell keyboardAvoiding` +
 * `useBottomSheetKeyboardScrollStyle`). A failed save shows inside the sheet;
 * the parent closes it after a successful save.
 */
export function AdminHealthFormSheet({
  visible,
  itemType,
  initialValues,
  studentFirstName,
  saving = false,
  saveError = null,
  onClose,
  onSave,
}: {
  visible: boolean;
  itemType: HealthItemType;
  initialValues?: HealthFormValues | null;
  studentFirstName: string;
  saving?: boolean;
  saveError?: string | null;
  onClose: () => void;
  onSave: (values: HealthFormValues) => void;
}) {
  const { keyboardOpen, scrollContentStyle } = useBottomSheetKeyboardScrollStyle(styles.scrollContent);
  const [values, setValues] = useState<HealthFormValues>(() => initialValues ?? defaultValues(itemType));
  const [baseline, setBaseline] = useState<HealthFormValues>(() => initialValues ?? defaultValues(itemType));
  const [openedFor, setOpenedFor] = useState({ visible, itemType, initialValues });

  // Reset each time the sheet opens for an item (previous-value pattern, no effect).
  if (
    openedFor.visible !== visible ||
    openedFor.itemType !== itemType ||
    openedFor.initialValues !== initialValues
  ) {
    setOpenedFor({ visible, itemType, initialValues });
    if (visible) {
      const next = initialValues ?? defaultValues(itemType);
      setValues(next);
      setBaseline(next);
    }
  }

  const isDirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(baseline), [values, baseline]);
  const editing = Boolean(initialValues);
  const title = healthFormTitle(itemType, editing);

  const requestClose = useCallback(() => {
    if (saving) return;
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose, saving]);

  const statusLine = saving
    ? 'Saving…'
    : isDirty
      ? `Saves to ${studentFirstName}'s health profile`
      : editing
        ? 'No changes yet'
        : 'Fill in the details, then save';

  return (
    <BottomSheetShell
      visible={visible}
      onClose={requestClose}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      backgroundColor={Garden.cream}
      borderColor={Garden.ink12}
      handleColor={Garden.ink25}
      maxHeight="88%"
      enableDragToDismiss={!isDirty && !saving}
      sheetStyle={styles.sheet}
      scrollContentStyle={scrollContentStyle}
      header={
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
            <Text style={styles.subtitle}>{studentFirstName}</Text>
          </View>
          <View style={styles.headerRight}>
            {isDirty ? <GChip label="Not saved" tone="warning" /> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={6}
              onPress={() => {
                haptic.tap();
                requestClose();
              }}
              style={({ pressed }) => [styles.close, pressed && styles.closePressed]}>
              <Ionicons name="close" size={20} color={Garden.ink} />
            </Pressable>
          </View>
        </View>
      }
      footer={
        keyboardOpen ? undefined : (
          <View style={styles.footer}>
            <Text style={styles.footerStatus} accessibilityLiveRegion="polite">
              {statusLine}
            </Text>
            <View style={styles.footerButtons}>
              <GOutlineButton label="Cancel" onPress={requestClose} />
              <GToyButton
                label={saving ? 'Saving…' : 'Save'}
                icon="checkmark"
                loading={saving}
                disabled={!isDirty}
                onPress={() => onSave(values)}
              />
            </View>
          </View>
        )
      }>
      {saveError ? (
        <GInlineBanner tone="error" title="Not saved" description={`${saveError} Nothing was changed.`} />
      ) : null}

      {values.type === 'allergy' ? (
        <>
          <GTextField
            label="Allergen"
            value={values.allergen}
            onChangeText={(text) => setValues({ ...values, allergen: text })}
            disabled={saving}
          />
          <GChoiceChips
            label="Severity"
            options={SEVERITY_OPTIONS}
            value={values.severity}
            onChange={(severity) => setValues({ ...values, severity })}
            disabled={saving}
          />
          <GTextField
            label="Treatment notes"
            value={values.treatmentNotes}
            onChangeText={(text) => setValues({ ...values, treatmentNotes: text })}
            multiline
            disabled={saving}
          />
        </>
      ) : null}

      {values.type === 'medication' ? (
        <>
          <GTextField
            label="Medication name"
            value={values.name}
            onChangeText={(text) => setValues({ ...values, name: text })}
            disabled={saving}
          />
          <GTextField
            label="Dose"
            value={values.dose}
            onChangeText={(text) => setValues({ ...values, dose: text })}
            disabled={saving}
          />
          <GTextField
            label="Time of day"
            value={values.timeOfDay}
            onChangeText={(text) => setValues({ ...values, timeOfDay: text })}
            disabled={saving}
          />
          <GTextField
            label="Instructions"
            value={values.instructions}
            onChangeText={(text) => setValues({ ...values, instructions: text })}
            multiline
            disabled={saving}
          />
          <GDateField
            label="Start date"
            value={values.startDate}
            onChange={(startDate) => setValues({ ...values, startDate })}
            disabled={saving}
          />
        </>
      ) : null}

      {values.type === 'update' ? (
        <>
          <GTextField
            label="Title"
            value={values.title}
            onChangeText={(text) => setValues({ ...values, title: text })}
            disabled={saving}
          />
          <GTextField
            label="Details"
            value={values.details}
            onChangeText={(text) => setValues({ ...values, details: text })}
            multiline
            disabled={saving}
          />
          <GDateField
            label="Start date"
            value={values.startDate}
            onChange={(startDate) => setValues({ ...values, startDate })}
            disabled={saving}
          />
        </>
      ) : null}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 0 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
  },
  headerCopy: { flex: 1, minWidth: 0, gap: 4 },
  title: { fontFamily: GardenFonts.display, fontSize: 24, lineHeight: 27, letterSpacing: -0.6, color: Garden.ink },
  subtitle: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePressed: { transform: [{ scale: 0.95 }] },
  footer: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: Garden.ink10,
  },
  footerStatus: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
  footerButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
});
