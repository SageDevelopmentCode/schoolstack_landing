import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// keyboard: verified on device — health form uses ParentBottomSheet (keyboard avoiding + scroll inset)

import {
  GChoiceChips,
  GDateField,
  GInlineBanner,
  GSwitchRow,
  GTextField,
} from '@/components/parent/garden/fields';
import { GOutlineButton, GToyButton } from '@/components/parent/garden/ui';
import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import {
  healthItemNoun,
  healthRequiredFieldError,
  type HealthFormValues,
} from '@/lib/parent/parent-children-garden';
import { dateToGalleryPhotoDate } from '@/lib/school-gallery/gallery-photo-date';
import {
  SEVERITY_LABELS,
  type HealthAllergySeverity,
  type HealthItemType,
} from '@/lib/student-health/types';
import { requestCloseIfClean } from '@/lib/unsaved-changes';

function defaultValues(itemType: HealthItemType): HealthFormValues {
  const today = dateToGalleryPhotoDate(new Date());
  if (itemType === 'allergy') {
    return { type: 'allergy', allergen: '', severity: 'medium', treatmentNotes: '' };
  }
  if (itemType === 'medication') {
    return {
      type: 'medication',
      name: '',
      dose: '',
      timeOfDay: '',
      instructions: '',
      startDate: today,
      ongoing: true,
    };
  }
  return { type: 'update', title: '', details: '', startDate: today };
}

const SEVERITY_HELP: Record<HealthAllergySeverity, string> = {
  low: 'Mild reaction',
  medium: 'Needs attention',
  high: 'Serious reaction',
};

/** Add or edit one allergy, medication or health update. */
export function GardenHealthFormSheet({
  visible,
  itemType,
  initialValues,
  studentFirstName,
  saving,
  saveError,
  onClose,
  onSave,
}: {
  visible: boolean;
  itemType: HealthItemType;
  initialValues: HealthFormValues | null;
  studentFirstName: string;
  saving: boolean;
  saveError: string | null;
  onClose: () => void;
  /** Resolves `true` once saved (the parent closes the sheet). */
  onSave: (values: HealthFormValues) => Promise<boolean>;
}) {
  const keyboardOpen = useKeyboardHeight() > 0;
  const [values, setValues] = useState<HealthFormValues>(defaultValues(itemType));
  const [baseline, setBaseline] = useState<HealthFormValues>(defaultValues(itemType));
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const next = initialValues ?? defaultValues(itemType);
    setValues(next);
    setBaseline(next);
    setShowErrors(false);
  }, [visible, initialValues, itemType]);

  const isDirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(baseline), [values, baseline]);
  const requiredError = healthRequiredFieldError(values);
  const requestClose = useCallback(() => requestCloseIfClean({ isDirty, onClose }), [isDirty, onClose]);

  const noun = healthItemNoun(itemType);
  const title = `${initialValues ? 'Edit' : 'Add'} ${noun.toLowerCase()}`;

  const submit = () => {
    if (requiredError) {
      setShowErrors(true);
      return;
    }
    void onSave(values);
  };

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={requestClose}
      title={title}
      subtitle={`${studentFirstName}'s health profile`}
      accessibilityLabel="Close health form">
      <View style={styles.form}>
        {values.type === 'allergy' ? (
          <>
            <GTextField
              label="Allergen"
              value={values.allergen}
              onChangeText={(allergen) => setValues({ ...values, allergen })}
              placeholder="e.g. Peanuts"
              error={showErrors && requiredError ? requiredError : null}
              autoCapitalize="sentences"
            />
            <GChoiceChips
              label="Severity"
              value={values.severity}
              onChange={(severity) => setValues({ ...values, severity })}
              helper={SEVERITY_HELP[values.severity]}
              options={(Object.keys(SEVERITY_LABELS) as HealthAllergySeverity[]).map((severity) => ({
                id: severity,
                label: SEVERITY_LABELS[severity],
              }))}
            />
            <GTextField
              label="Treatment notes"
              optional
              value={values.treatmentNotes}
              onChangeText={(treatmentNotes) => setValues({ ...values, treatmentNotes })}
              placeholder="What staff should do if there's a reaction"
              multiline
            />
          </>
        ) : null}

        {values.type === 'medication' ? (
          <>
            <GTextField
              label="Medication name"
              value={values.name}
              onChangeText={(name) => setValues({ ...values, name })}
              error={showErrors && requiredError ? requiredError : null}
            />
            <GTextField
              label="Dose"
              optional
              value={values.dose}
              onChangeText={(dose) => setValues({ ...values, dose })}
              placeholder="e.g. 5 ml"
            />
            <GTextField
              label="Time of day"
              optional
              value={values.timeOfDay}
              onChangeText={(timeOfDay) => setValues({ ...values, timeOfDay })}
              placeholder="e.g. After lunch"
            />
            <GTextField
              label="Instructions"
              optional
              value={values.instructions}
              onChangeText={(instructions) => setValues({ ...values, instructions })}
              multiline
            />
            <GDateField
              label="Start date"
              value={values.startDate}
              onChange={(startDate) => setValues({ ...values, startDate })}
              disabled={saving}
            />
            <GSwitchRow
              label="Ongoing"
              meta="Turn off for a short course"
              value={values.ongoing}
              onValueChange={(ongoing) => setValues({ ...values, ongoing })}
            />
          </>
        ) : null}

        {values.type === 'update' ? (
          <>
            <GTextField
              label="Title"
              value={values.title}
              onChangeText={(text) => setValues({ ...values, title: text })}
              placeholder="e.g. Sprained wrist"
              error={showErrors && requiredError ? requiredError : null}
            />
            <GTextField
              label="Details"
              optional
              value={values.details}
              onChangeText={(details) => setValues({ ...values, details })}
              multiline
            />
            <GDateField
              label="Start date"
              value={values.startDate}
              onChange={(startDate) => setValues({ ...values, startDate })}
              disabled={saving}
            />
          </>
        ) : null}

        {saveError ? (
          <GInlineBanner tone="error" title="Couldn't save" description={`${saveError} Your changes are still here — try again.`} />
        ) : null}

        {keyboardOpen ? null : (
          <View style={styles.actions}>
            <GToyButton
              label={saving ? 'Saving…' : `Save ${noun.toLowerCase()}`}
              icon="checkmark"
              loading={saving}
              disabled={!isDirty}
              fullWidth
              size="md"
              onPress={submit}
            />
            <GOutlineButton label="Cancel" onPress={requestClose} style={styles.cancel} />
          </View>
        )}
      </View>
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  actions: { gap: 10, marginTop: 4 },
  cancel: { alignSelf: 'center' },
});
