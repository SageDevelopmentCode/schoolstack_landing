import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { HealthAllergySeverity, HealthItemType } from '@/lib/student-health/types';
import { SEVERITY_LABELS } from '@/lib/student-health/types';
import { Story, StoryFonts } from '@/constants/story-theme';
import { requestCloseIfClean } from '@/lib/unsaved-changes';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { DISABLED_BUTTON_OPACITY, Radius, Spacing } from '@/constants/theme';

export type HealthFormValues =
  | {
      type: 'allergy';
      allergen: string;
      severity: HealthAllergySeverity;
      treatmentNotes: string;
    }
  | {
      type: 'medication';
      name: string;
      dose: string;
      timeOfDay: string;
      instructions: string;
      startDate: string;
      ongoing: boolean;
    }
  | {
      type: 'update';
      title: string;
      details: string;
      startDate: string;
    };

type StudentHealthFormSheetProps = {
  visible: boolean;
  itemType: HealthItemType;
  initialValues?: HealthFormValues | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (values: HealthFormValues) => Promise<void>;
};

function defaultValues(itemType: HealthItemType): HealthFormValues {
  const today = new Date().toISOString().slice(0, 10);
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

export function StudentHealthFormSheet({
  visible,
  itemType,
  initialValues,
  saving = false,
  onClose,
  onSave,
}: StudentHealthFormSheetProps) {
  const theme = useParentTheme();
  const [values, setValues] = useState<HealthFormValues>(defaultValues(itemType));
  const [baselineValues, setBaselineValues] = useState<HealthFormValues>(defaultValues(itemType));

  useEffect(() => {
    if (!visible) return;
    const nextValues = initialValues ?? defaultValues(itemType);
    setValues(nextValues);
    setBaselineValues(nextValues);
  }, [visible, initialValues, itemType]);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baselineValues),
    [values, baselineValues],
  );

  const requestClose = useCallback(() => {
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose]);

  const title =
    itemType === 'allergy'
      ? initialValues ? 'Edit allergy' : 'Add allergy'
      : itemType === 'medication'
        ? initialValues ? 'Edit medication' : 'Add medication'
        : initialValues ? 'Edit health update' : 'Add health update';

  const handleSave = async () => {
    await onSave(values);
    onClose();
  };

  return (
    <BottomSheetShell
      visible={visible}
      onClose={requestClose}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      backgroundColor={theme.white}
      borderColor={Story.line}
      handleColor={Story.line}
      maxHeight="88%"
      sheetStyle={styles.sheet}
      scrollContentStyle={styles.scrollContent}
      header={
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.ink }]}>{title}</Text>
          <Pressable accessibilityRole="button" onPress={requestClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.muted} />
          </Pressable>
        </View>
      }
      footer={
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" disabled={saving} onPress={requestClose}>
            <Text style={[styles.cancelLabel, { color: theme.muted }]}>Cancel</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={saving || !isDirty}
            onPress={() => void handleSave()}
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.primary,
                opacity: isDirty && !saving ? 1 : DISABLED_BUTTON_OPACITY,
              },
            ]}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveLabel}>Save</Text>
            )}
          </Pressable>
        </View>
      }>
      {values.type === 'allergy' ? (
        <>
          <Field
            label="Allergen"
            value={values.allergen}
            onChangeText={(text) => setValues({ ...values, allergen: text })}
          />
          <View style={styles.severityRow}>
            {(Object.keys(SEVERITY_LABELS) as HealthAllergySeverity[]).map((severity) => {
              const active = values.severity === severity;
              return (
                <Pressable
                  key={severity}
                  accessibilityRole="button"
                  onPress={() => setValues({ ...values, severity })}
                  style={[
                    styles.severityPill,
                    {
                      backgroundColor: active ? '#E9F2EA' : Story.paper,
                      borderColor: active ? '#BCD4C1' : Story.line,
                    },
                  ]}>
                  <Text
                    style={{
                      color: active ? theme.primary : theme.muted,
                      fontFamily: StoryFonts.bodySemiBold,
                      fontSize: 13,
                    }}>
                    {SEVERITY_LABELS[severity]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Field
            label="Treatment notes"
            value={values.treatmentNotes}
            onChangeText={(text) => setValues({ ...values, treatmentNotes: text })}
            multiline
          />
        </>
      ) : null}

      {values.type === 'medication' ? (
        <>
          <Field
            label="Medication name"
            value={values.name}
            onChangeText={(text) => setValues({ ...values, name: text })}
          />
          <Field
            label="Dose"
            value={values.dose}
            onChangeText={(text) => setValues({ ...values, dose: text })}
          />
          <Field
            label="Time of day"
            value={values.timeOfDay}
            onChangeText={(text) => setValues({ ...values, timeOfDay: text })}
          />
          <Field
            label="Instructions"
            value={values.instructions}
            onChangeText={(text) => setValues({ ...values, instructions: text })}
            multiline
          />
          <Field
            label="Start date (YYYY-MM-DD)"
            value={values.startDate}
            onChangeText={(text) => setValues({ ...values, startDate: text })}
          />
        </>
      ) : null}

      {values.type === 'update' ? (
        <>
          <Field
            label="Title"
            value={values.title}
            onChangeText={(text) => setValues({ ...values, title: text })}
          />
          <Field
            label="Details"
            value={values.details}
            onChangeText={(text) => setValues({ ...values, details: text })}
            multiline
          />
          <Field
            label="Start date (YYYY-MM-DD)"
            value={values.startDate}
            onChangeText={(text) => setValues({ ...values, startDate: text })}
          />
        </>
      ) : null}
    </BottomSheetShell>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
}) {
  const theme = useParentTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.muted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          { color: theme.ink, borderColor: Story.line, backgroundColor: Story.paper },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  scrollContent: {
    paddingTop: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 22,
    lineHeight: 28,
  },
  field: {
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  fieldLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontFamily: StoryFonts.body,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  severityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  severityPill: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.three,
  },
  cancelLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
    paddingHorizontal: Spacing.two,
  },
  saveButton: {
    borderRadius: Radius.md,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: 12,
    minWidth: 88,
    alignItems: 'center',
  },
  saveLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    color: '#fff',
  },
});
