import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { CommitteeEventType } from '@/lib/parent/parent-committees-types';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

export type CommitteeEventFormState = {
  title: string;
  date: string;
  time: string;
  eventType: CommitteeEventType;
  location: string;
};

type ParentCommitteeEventFormSheetProps = {
  visible: boolean;
  title: string;
  submitLabel: string;
  initialForm: CommitteeEventFormState;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (form: CommitteeEventFormState) => void | Promise<void>;
};

const EVENT_TYPES: CommitteeEventType[] = ['meeting', 'deadline', 'service', 'event'];

export function ParentCommitteeEventFormSheet({
  visible,
  title,
  submitLabel,
  initialForm,
  saving = false,
  onClose,
  onSubmit,
}: ParentCommitteeEventFormSheetProps) {
  const theme = useParentTheme();
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (visible) setForm(initialForm);
  }, [initialForm, visible]);

  const canSubmit = Boolean(form.title.trim() && form.date);

  return (
    <ParentBottomSheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.form}>
        <Field label="Title" theme={theme}>
          <TextInput
            value={form.title}
            onChangeText={(value) => setForm((current) => ({ ...current, title: value }))}
            placeholder="Event title"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.ink, borderColor: theme.line }]}
          />
        </Field>

        <Field label="Date (YYYY-MM-DD)" theme={theme}>
          <TextInput
            value={form.date}
            onChangeText={(value) => setForm((current) => ({ ...current, date: value }))}
            placeholder="2026-09-22"
            placeholderTextColor={theme.muted}
            autoCapitalize="none"
            style={[styles.input, { color: theme.ink, borderColor: theme.line }]}
          />
        </Field>

        <Field label="Time (optional)" theme={theme}>
          <TextInput
            value={form.time}
            onChangeText={(value) => setForm((current) => ({ ...current, time: value }))}
            placeholder="3:30 PM"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.ink, borderColor: theme.line }]}
          />
        </Field>

        <Field label="Type" theme={theme}>
          <View style={styles.typeRow}>
            {EVENT_TYPES.map((eventType) => {
              const selected = form.eventType === eventType;
              return (
                <Text
                  key={eventType}
                  onPress={() => setForm((current) => ({ ...current, eventType }))}
                  style={[
                    styles.typeChip,
                    {
                      color: selected ? theme.primary : theme.muted,
                      backgroundColor: selected ? theme.primarySoft : theme.white,
                      borderColor: selected ? theme.primary : theme.line,
                    },
                  ]}>
                  {eventType}
                </Text>
              );
            })}
          </View>
        </Field>

        <Field label="Location (optional)" theme={theme}>
          <TextInput
            value={form.location}
            onChangeText={(value) => setForm((current) => ({ ...current, location: value }))}
            placeholder="Room or address"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.ink, borderColor: theme.line }]}
          />
        </Field>

        <StoryButton
          label={submitLabel}
          previewSafe
          disabled={!canSubmit || saving}
          onPress={() => void onSubmit(form)}
        />
      </View>
    </ParentBottomSheet>
  );
}

function Field({
  label,
  theme,
  children,
}: {
  label: string;
  theme: { muted: string };
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  typeChip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
