import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { formatDateOnlyLabel } from '@/lib/admissions/admissions-availability';
import {
  createObservationSlot,
  deleteObservationSlot,
  formatGradeValuesLabel,
  formatObservationSlotLabel,
  formatObservationSlotTimeLabel,
  getShadowDayTimeWindowPresets,
  type ObservationSlot,
} from '@/lib/admissions/admissions-observation-slots';
import type { ShadowDaySchedulingMode } from '@/lib/admissions/admissions-org-settings';
import { STUDENT_GRADE_OPTIONS } from '@/lib/admissions/apply-system-fields';
import { getSupabaseClient } from '@/lib/supabase';

type ShadowDaySheetProps = {
  visible: boolean;
  organizationId: string;
  date: string | null;
  mode: ShadowDaySchedulingMode;
  readOnly: boolean;
  slots: ObservationSlot[];
  occupiedSlotIds: Set<string>;
  wholeDayOpen: boolean;
  wholeDayBooked: boolean;
  togglingWholeDay: boolean;
  onClose: () => void;
  onReload: () => void;
  onToggleWholeDay: (open: boolean) => void;
};

export function ShadowDaySheet({
  visible,
  organizationId,
  date,
  mode,
  readOnly,
  slots,
  occupiedSlotIds,
  wholeDayOpen,
  wholeDayBooked,
  togglingWholeDay,
  onClose,
  onReload,
  onToggleWholeDay,
}: ShadowDaySheetProps) {
  const theme = useAdminTheme();
  const insets = useSafeAreaInsets();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const presets = useMemo(() => getShadowDayTimeWindowPresets(), []);

  const [gradeValues, setGradeValues] = useState<string[]>([]);
  const [presetId, setPresetId] = useState(presets[0]?.id ?? 'morning');
  const [label, setLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!date) return null;

  const includeTime = mode === 'grade_and_time';
  const footerText =
    mode === 'grade_targeted'
      ? 'Add which grades can shadow on this day.'
      : mode === 'grade_and_time'
        ? 'Add grade and time windows for this day.'
        : 'Open the full day for student shadow visits.';

  const toggleGrade = (value: string) => {
    setGradeValues((current) =>
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value],
    );
  };

  const handleAddSlot = async () => {
    if (gradeValues.length === 0) {
      Alert.alert('Select grades', 'Choose at least one grade for this shadow slot.');
      return;
    }

    const preset = presets.find((entry) => entry.id === presetId) ?? presets[0];
    setSubmitting(true);
    try {
      await createObservationSlot(supabase, organizationId, {
        date,
        startTime: includeTime ? preset.startTime : 'ALL_DAY',
        endTime: includeTime ? preset.endTime : null,
        label: label.trim() || null,
        gradeValues,
      });
      setGradeValues([]);
      setLabel('');
      onReload();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add shadow slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    setDeletingId(slotId);
    try {
      await deleteObservationSlot(supabase, organizationId, slotId);
      onReload();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove shadow slot.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              Done
            </ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
            Shadow day
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={{ color: theme.textPrimary }}>
            {formatDateOnlyLabel(date)}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>
            {footerText}
          </ThemedText>

          {mode === 'whole_day' ? (
            <Pressable
              accessibilityRole="button"
              disabled={readOnly || wholeDayBooked || togglingWholeDay}
              onPress={() => onToggleWholeDay(!wholeDayOpen)}
              style={[
                styles.wholeDayButton,
                {
                  backgroundColor: wholeDayOpen ? theme.accentLight : theme.surface,
                  borderColor: wholeDayBooked ? theme.warning : wholeDayOpen ? theme.accent : theme.border,
                },
              ]}>
              {togglingWholeDay ? (
                <ActivityIndicator color={theme.accent} />
              ) : (
                <ThemedText type="smallBold" style={{ color: wholeDayOpen ? theme.accent : theme.textPrimary }}>
                  {wholeDayBooked
                    ? 'Booked — cannot change'
                    : wholeDayOpen
                      ? 'Open for shadow visits'
                      : 'Closed — tap to open'}
                </ThemedText>
              )}
            </Pressable>
          ) : (
            <>
              {slots.map((slot) => {
                const booked = occupiedSlotIds.has(slot.id);
                return (
                  <View
                    key={slot.id}
                    style={[
                      styles.slotRow,
                      {
                        borderColor: booked ? theme.warning : theme.border,
                        backgroundColor: booked ? theme.warningBg : theme.surface,
                      },
                    ]}>
                    <View style={styles.slotCopy}>
                      <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                        {formatObservationSlotLabel(slot)}
                      </ThemedText>
                      <ThemedText type="small" style={{ color: theme.textTertiary }}>
                        {formatObservationSlotTimeLabel(slot)}
                        {slot.gradeValues.length > 0 ? ` · ${formatGradeValuesLabel(slot.gradeValues)}` : ''}
                      </ThemedText>
                    </View>
                    {!readOnly && !booked ? (
                      <Pressable
                        accessibilityRole="button"
                        disabled={deletingId === slot.id}
                        onPress={() => void handleDeleteSlot(slot.id)}>
                        <ThemedText type="smallBold" style={{ color: theme.error }}>
                          {deletingId === slot.id ? '…' : 'Remove'}
                        </ThemedText>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}

              {!readOnly ? (
                <View style={[styles.formCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                    Add slot
                  </ThemedText>
                  <View style={styles.chipRow}>
                    {STUDENT_GRADE_OPTIONS.map((option) => {
                      const active = gradeValues.includes(option.value);
                      return (
                        <Pressable
                          key={option.value}
                          accessibilityRole="button"
                          onPress={() => toggleGrade(option.value)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? theme.accentLight : theme.elevated,
                              borderColor: active ? theme.accent : theme.border,
                            },
                          ]}>
                          <ThemedText type="small" style={{ color: active ? theme.accent : theme.textSecondary }}>
                            {option.label}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>

                  {includeTime ? (
                    <View style={styles.chipRow}>
                      {presets.map((preset) => {
                        const active = preset.id === presetId;
                        return (
                          <Pressable
                            key={preset.id}
                            accessibilityRole="button"
                            onPress={() => setPresetId(preset.id)}
                            style={[
                              styles.chip,
                              {
                                backgroundColor: active ? theme.accentLight : theme.elevated,
                                borderColor: active ? theme.accent : theme.border,
                              },
                            ]}>
                            <ThemedText type="small" style={{ color: active ? theme.accent : theme.textSecondary }}>
                              {preset.label}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}

                  <TextInput
                    value={label}
                    onChangeText={setLabel}
                    placeholder="Optional label"
                    placeholderTextColor={theme.textTertiary}
                    style={[
                      styles.input,
                      {
                        borderColor: theme.inputBorder,
                        backgroundColor: theme.input,
                        color: theme.textPrimary,
                        fontFamily: Fonts.body,
                      },
                    ]}
                  />

                  <Pressable
                    accessibilityRole="button"
                    disabled={submitting}
                    onPress={() => void handleAddSlot()}
                    style={[styles.addButton, { backgroundColor: theme.accent }]}>
                    <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                      {submitting ? 'Adding…' : 'Add slot'}
                    </ThemedText>
                  </Pressable>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
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
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  wholeDayButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.four,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  slotRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  slotCopy: {
    flex: 1,
    gap: 2,
  },
  formCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
  },
  addButton: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
});
