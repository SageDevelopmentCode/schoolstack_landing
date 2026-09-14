import { useCallback, useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';
import {
  getDefaultColorKeyForType,
  SCHOOL_EVENT_COLOR_KEYS,
  SCHOOL_EVENT_TYPE_LABELS,
  getColorStyle,
} from '@/lib/school-events/event-labels';
import type { SchoolEventColorKey, SchoolEventType } from '@/lib/school-events/types';
import { requestCloseIfClean } from '@/lib/unsaved-changes';

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

export function eventFormsEqual(left: EventFormState, right: EventFormState): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

type SchoolEventFormSheetProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  form: EventFormState;
  isDirty: boolean;
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
  isDirty,
  saving,
  onClose,
  onChange,
  onSave,
}: SchoolEventFormSheetProps) {
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();
  const isValid = useMemo(
    () => Boolean(form.title.trim() && form.date && (form.isAllDay || form.time.trim())),
    [form],
  );
  const canSave = isDirty && isValid;

  const requestClose = useCallback(() => {
    requestCloseIfClean({ isDirty, onClose });
  }, [isDirty, onClose]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={requestClose}>
      <View style={[styles.container, { backgroundColor: Story.paper, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.line }]}>
          <Pressable accessibilityRole="button" onPress={requestClose}>
            <Text style={[styles.headerAction, { color: theme.primary }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.ink }]}>
            {mode === 'create' ? 'Add event' : 'Edit event'}
          </Text>
          <Pressable accessibilityRole="button" disabled={!canSave || saving} onPress={onSave}>
            <Text
              style={[
                styles.headerAction,
                { color: canSave && !saving ? theme.primary : theme.muted },
              ]}>
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <StorySectionKicker style={styles.kicker}>School event</StorySectionKicker>
          <StoryDisplayHeading size="section">
            {mode === 'create' ? 'New event' : 'Update event'}
          </StoryDisplayHeading>

          <Field label="Title">
            <TextInput
              value={form.title}
              onChangeText={(title) => onChange({ ...form, title })}
              placeholder="Event title"
              placeholderTextColor={theme.muted}
              style={[styles.input, inputStyle(theme)]}
            />
          </Field>

          <Field label="Date (YYYY-MM-DD)">
            <TextInput
              value={form.date}
              onChangeText={(date) => onChange({ ...form, date })}
              placeholder="2026-08-22"
              autoCapitalize="none"
              placeholderTextColor={theme.muted}
              style={[styles.input, inputStyle(theme)]}
            />
          </Field>

          <View style={styles.switchRow}>
            <Text style={[styles.fieldLabel, { color: theme.ink }]}>All day</Text>
            <Switch
              value={form.isAllDay}
              onValueChange={(isAllDay) => onChange({ ...form, isAllDay })}
              trackColor={{ false: theme.line, true: theme.primarySoft }}
              thumbColor={form.isAllDay ? theme.primary : theme.white}
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
                  placeholderTextColor={theme.muted}
                  style={[styles.input, inputStyle(theme)]}
                />
              </Field>
              <Field label="End time (HH:MM)">
                <TextInput
                  value={form.endTime}
                  onChangeText={(endTime) => onChange({ ...form, endTime })}
                  placeholder="10:00"
                  autoCapitalize="none"
                  placeholderTextColor={theme.muted}
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
                        backgroundColor: active ? theme.primarySoft : theme.white,
                        borderColor: active ? theme.primary : theme.line,
                      },
                    ]}>
                    <Text style={[styles.chipLabel, { color: active ? theme.primary : theme.muted }]}>
                      {SCHOOL_EVENT_TYPE_LABELS[type]}
                    </Text>
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
                        borderColor: active ? theme.primary : 'transparent',
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
              placeholderTextColor={theme.muted}
              style={[styles.input, inputStyle(theme)]}
            />
          </Field>

          <Field label="Description">
            <TextInput
              value={form.description}
              onChangeText={(description) => onChange({ ...form, description })}
              placeholder="Optional details"
              multiline
              placeholderTextColor={theme.muted}
              style={[styles.input, styles.textArea, inputStyle(theme)]}
            />
          </Field>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useParentTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.muted }]}>{label}</Text>
      {children}
    </View>
  );
}

function inputStyle(theme: ReturnType<typeof useParentTheme>) {
  return {
    borderColor: theme.line,
    backgroundColor: theme.white,
    color: theme.ink,
    fontFamily: StoryFonts.body,
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
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerAction: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  kicker: {
    marginBottom: 0,
  },
  field: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '700',
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
  chipLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
});
