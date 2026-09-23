import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { formatDateOnlyLabel } from '@/lib/admissions/admissions-availability';
import {
  createObservationSlotViaApi,
  deleteObservationSlotViaApi,
} from '@/lib/school-admin/schedule-api';
import {
  formatGradeValuesLabel,
  formatObservationSlotLabel,
  formatObservationSlotTimeLabel,
  getShadowDayTimeWindowPresets,
  type ObservationSlot,
} from '@/lib/admissions/admissions-observation-slots';
import type { ShadowDaySchedulingMode } from '@/lib/admissions/admissions-org-settings';
import { STUDENT_GRADE_OPTIONS } from '@/lib/admissions/apply-system-fields';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Radius, Spacing } from '@/constants/theme';

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
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
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
      await createObservationSlotViaApi({
        organizationId,
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
      reportError('school_admin_schedule_shadow_slot_add', error, {
        metadata: { date, mode },
      });
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add shadow slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    setDeletingId(slotId);
    try {
      await deleteObservationSlotViaApi(organizationId, slotId);
      onReload();
    } catch (error) {
      reportError('school_admin_schedule_shadow_slot_delete', error, {
        entityType: 'observation_slot',
        entityId: slotId,
      });
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove shadow slot.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      backgroundColor={Story.paper}
      borderColor={Story.line}
      handleColor={Story.line}
      maxHeight="92%"
      scrollContentStyle={styles.content}
      header={
        <View style={[styles.header, { borderBottomColor: theme.line }]}>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <Text style={[styles.headerAction, { color: theme.primary }]}>Done</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.ink }]}>Shadow day</Text>
          <View style={styles.headerSpacer} />
        </View>
      }>
      <StorySectionKicker style={styles.kicker}>Shadow availability</StorySectionKicker>
      <StoryDisplayHeading size="section">{formatDateOnlyLabel(date)}</StoryDisplayHeading>
      <Text style={[styles.helperCopy, { color: theme.muted }]}>{footerText}</Text>

      {mode === 'whole_day' ? (
        <Pressable
          accessibilityRole="button"
          disabled={readOnly || wholeDayBooked || togglingWholeDay}
          onPress={() => onToggleWholeDay(!wholeDayOpen)}
          style={[
            styles.wholeDayButton,
            {
              backgroundColor: wholeDayOpen ? theme.primarySoft : theme.white,
              borderColor: wholeDayBooked ? theme.warning : wholeDayOpen ? theme.primary : theme.line,
            },
          ]}>
          {togglingWholeDay ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Text style={[styles.wholeDayLabel, { color: wholeDayOpen ? theme.primary : theme.ink }]}>
              {wholeDayBooked
                ? 'Booked — cannot change'
                : wholeDayOpen
                  ? 'Open for shadow visits'
                  : 'Closed — tap to open'}
            </Text>
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
                    borderColor: booked ? theme.warning : theme.line,
                    backgroundColor: booked ? theme.warningBg : theme.white,
                  },
                ]}>
                <View style={styles.slotCopy}>
                  <Text style={[styles.slotTitle, { color: theme.ink }]}>
                    {formatObservationSlotLabel(slot)}
                  </Text>
                  <Text style={[styles.slotMeta, { color: theme.muted }]}>
                    {formatObservationSlotTimeLabel(slot)}
                    {slot.gradeValues.length > 0 ? ` · ${formatGradeValuesLabel(slot.gradeValues)}` : ''}
                  </Text>
                </View>
                {!readOnly && !booked ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={deletingId === slot.id}
                    onPress={() => void handleDeleteSlot(slot.id)}>
                    <Text style={[styles.removeAction, { color: theme.alert }]}>
                      {deletingId === slot.id ? '…' : 'Remove'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}

          {!readOnly ? (
            <View style={[styles.formCard, { borderColor: theme.line, backgroundColor: theme.white }]}>
              <Text style={[styles.formTitle, { color: theme.ink }]}>Add slot</Text>
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
                          backgroundColor: active ? theme.primarySoft : theme.paper,
                          borderColor: active ? theme.primary : theme.line,
                        },
                      ]}>
                      <Text style={[styles.chipLabel, { color: active ? theme.primary : theme.muted }]}>
                        {option.label}
                      </Text>
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
                            backgroundColor: active ? theme.primarySoft : theme.paper,
                            borderColor: active ? theme.primary : theme.line,
                          },
                        ]}>
                        <Text style={[styles.chipLabel, { color: active ? theme.primary : theme.muted }]}>
                          {preset.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder="Optional label"
                placeholderTextColor={theme.muted}
                style={[
                  styles.input,
                  {
                    borderColor: theme.line,
                    backgroundColor: theme.white,
                    color: theme.ink,
                    fontFamily: StoryFonts.body,
                  },
                ]}
              />

              <Pressable
                accessibilityRole="button"
                disabled={submitting}
                onPress={() => void handleAddSlot()}
                style={[styles.addButton, { backgroundColor: theme.primary }]}>
                <Text style={styles.addButtonLabel}>{submitting ? 'Adding…' : 'Add slot'}</Text>
              </Pressable>
            </View>
          ) : null}
        </>
      )}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: {
    width: 40,
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
    gap: Spacing.three,
  },
  kicker: {
    marginBottom: 0,
  },
  helperCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  wholeDayButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.four,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  wholeDayLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
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
  slotTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
  },
  slotMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  removeAction: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '700',
  },
  formCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  formTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '700',
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
  chipLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
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
  addButtonLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
