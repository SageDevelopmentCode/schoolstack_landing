import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  getDefaultColorKeyForType,
  SCHOOL_EVENT_COLOR_KEYS,
  SCHOOL_EVENT_TYPE_LABELS,
  getColorStyle,
} from '@/lib/school-events/event-labels';
import type { SchoolEventColorKey, SchoolEventType } from '@/lib/school-events/types';

export type EventFormState = {
  title: string;
  date: string;
  time: string;
  endTime: string;
  isAllDay: boolean;
  eventType: SchoolEventType;
  colorKey: SchoolEventColorKey;
  colorManuallySet: boolean;
  location: string;
  description: string;
};

export const EMPTY_EVENT_FORM: EventFormState = {
  title: '',
  date: '',
  time: '',
  endTime: '',
  isAllDay: true,
  eventType: 'other',
  colorKey: getDefaultColorKeyForType('other'),
  colorManuallySet: false,
  location: '',
  description: '',
};

type SchoolEventFormSheetProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  form: EventFormState;
  saving: boolean;
  onClose: () => void;
  onChange: (form: EventFormState) => void;
  onSave: () => void;
};

const EVENT_TYPES = Object.keys(SCHOOL_EVENT_TYPE_LABELS) as SchoolEventType[];

export function SchoolEventFormSheet({
  visible,
  mode,
  form,
  saving,
  onClose,
  onChange,
  onSave,
}: SchoolEventFormSheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const canSave = useMemo(
    () => Boolean(form.title.trim() && form.date && (form.isAllDay || form.time.trim())),
    [form],
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Cancel
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            {mode === 'create' ? 'Add event' : 'Edit event'}
          </ThemedText>
          <Pressable accessibilityRole="button" disabled={!canSave || saving} onPress={onSave}>
            <ThemedText type="smallBold" style={{ color: canSave && !saving ? theme.accent : theme.textTertiary }}>
              Save
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Field label="Title">
            <TextInput
              value={form.title}
              onChangeText={(title) => onChange({ ...form, title })}
              placeholder="Event title"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, inputStyle(theme)]}
            />
          </Field>

          <Field label="Date (YYYY-MM-DD)">
            <TextInput
              value={form.date}
              onChangeText={(date) => onChange({ ...form, date })}
              placeholder="2026-08-22"
              autoCapitalize="none"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, inputStyle(theme)]}
            />
          </Field>

          <View style={styles.switchRow}>
            <ThemedText type="small" style={{ color: theme.textPrimary }}>
              All day
            </ThemedText>
            <Switch
              value={form.isAllDay}
              onValueChange={(isAllDay) => onChange({ ...form, isAllDay })}
              trackColor={{ false: theme.border, true: theme.accentLight }}
              thumbColor={form.isAllDay ? theme.accent : theme.surface}
            />
          </View>

          {!form.isAllDay ? (
            <>
              <Field label="Start time (HH:MM)">
                <TextInput
                  value={form.time}
                  onChangeText={(time) => onChange({ ...form, time })}
                  placeholder="09:00"
                  autoCapitalize="none"
                  placeholderTextColor={theme.textTertiary}
                  style={[styles.input, inputStyle(theme)]}
                />
              </Field>
              <Field label="End time (HH:MM)">
                <TextInput
                  value={form.endTime}
                  onChangeText={(endTime) => onChange({ ...form, endTime })}
                  placeholder="10:00"
                  autoCapitalize="none"
                  placeholderTextColor={theme.textTertiary}
                  style={[styles.input, inputStyle(theme)]}
                />
              </Field>
            </>
          ) : null}

          <Field label="Type">
            <View style={styles.chipRow}>
              {EVENT_TYPES.map((type) => {
                const active = form.eventType === type;
                return (
                  <Pressable
                    key={type}
                    accessibilityRole="button"
                    onPress={() =>
                      onChange({
                        ...form,
                        eventType: type,
                        colorKey: form.colorManuallySet ? form.colorKey : getDefaultColorKeyForType(type),
                      })
                    }
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? theme.accentLight : theme.surface,
                        borderColor: active ? theme.accent : theme.border,
                      },
                    ]}>
                    <ThemedText type="small" style={{ color: active ? theme.accent : theme.textSecondary }}>
                      {SCHOOL_EVENT_TYPE_LABELS[type]}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="Color">
            <View style={styles.chipRow}>
              {SCHOOL_EVENT_COLOR_KEYS.map((colorKey) => {
                const active = form.colorKey === colorKey;
                const color = getColorStyle(colorKey);
                return (
                  <Pressable
                    key={colorKey}
                    accessibilityRole="button"
                    onPress={() => onChange({ ...form, colorKey, colorManuallySet: true })}
                    style={[
                      styles.colorSwatch,
                      {
                        backgroundColor: color.bg,
                        borderColor: active ? theme.accent : 'transparent',
                      },
                    ]}
                  />
                );
              })}
            </View>
          </Field>

          <Field label="Location">
            <TextInput
              value={form.location}
              onChangeText={(location) => onChange({ ...form, location })}
              placeholder="Optional"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, inputStyle(theme)]}
            />
          </Field>

          <Field label="Description">
            <TextInput
              value={form.description}
              onChangeText={(description) => onChange({ ...form, description })}
              placeholder="Optional details"
              multiline
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, styles.textArea, inputStyle(theme)]}
            />
          </Field>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useAdminTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

function inputStyle(theme: ReturnType<typeof useAdminTheme>) {
  return {
    borderColor: theme.inputBorder,
    backgroundColor: theme.input,
    color: theme.textPrimary,
    fontFamily: Fonts.body,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
});
