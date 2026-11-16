import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { confirmDestructive, useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GInlineBanner, GTextField } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GKicker, GLink, GPressable, GToyButton } from '@/components/parent/garden/ui';
import { AdminSheetHeader, errorText } from '@/components/school-admin/garden/admin-sheet';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { AdminScheduleLegend, AdminScheduleMonthGrid } from '@/components/school-admin/schedule/garden/schedule-garden-ui';
import { useScheduleCalendar } from '@/components/school-admin/schedule/use-schedule-calendar';
import { BottomSheetShell } from '@/components/story/bottom-sheet-shell';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useBottomSheetKeyboardScrollStyle } from '@/hooks/use-bottom-sheet-keyboard-scroll-style';
import { haptic } from '@/lib/haptics';
import { formatDateOnlyLabel } from '@/lib/admissions/admissions-availability';
import { listObservationDayAvailability, listOccupiedObservationDays } from '@/lib/admissions/admissions-observation-availability';
import {
  formatGradeValuesLabel,
  formatObservationSlotLabel,
  formatObservationSlotTimeLabel,
  getShadowDayTimeWindowPresets,
  listObservationSlotsForDateRange,
  listOccupiedObservationSlotIds,
  type ObservationSlot,
} from '@/lib/admissions/admissions-observation-slots';
import {
  getAdmissionsOrgSettings,
  resolveShadowDaySchedulingMode,
  type ShadowDaySchedulingMode,
} from '@/lib/admissions/admissions-org-settings';
import { STUDENT_GRADE_OPTIONS } from '@/lib/admissions/apply-system-fields';
import { createObservationSlotViaApi, deleteObservationSlotViaApi, toggleObservationDayViaApi } from '@/lib/school-admin/schedule-api';
import { getSupabaseClient } from '@/lib/supabase';

type Props = {
  organizationId: string;
  slug: string;
  onStatsChanged: () => Promise<void>;
  onMonthDayCountChange: (count: number) => void;
};

type SheetStatus = { tone: 'success' | 'error' | 'info'; title: string; description?: string } | null;

/**
 * Schedule › Shadow: Garden month grid of shadow availability; a day opens the
 * shadow sheet (whole-day toggle, or grade / time slots with add + remove).
 * Same loads, saves and `school_admin_schedule_shadow_*` operations as Story.
 */
export function ScheduleShadowPanel({ organizationId, onStatsChanged, onMonthDayCountChange }: Props) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const action = useAdminAction(organizationId);
  const { reportError } = action;
  const { readOnly: previewReadOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [shadowMode, setShadowMode] = useState<ShadowDaySchedulingMode>(resolveShadowDaySchedulingMode({}));
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());
  const [occupiedDays, setOccupiedDays] = useState<Set<string>>(new Set());
  const [occupiedSlotIds, setOccupiedSlotIds] = useState<Set<string>>(new Set());
  const [monthSlots, setMonthSlots] = useState<ObservationSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingWholeDay, setTogglingWholeDay] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [status, setStatus] = useState<SheetStatus>(null);
  const [changed, setChanged] = useState(false);

  const calendar = useScheduleCalendar({ organizationId, supabase, theme });

  const loadMonthData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await getAdmissionsOrgSettings(supabase, organizationId);
      const mode = resolveShadowDaySchedulingMode(settings);
      setShadowMode(mode);
      if (mode === 'whole_day') {
        const [days, occupied] = await Promise.all([
          listObservationDayAvailability(supabase, organizationId, calendar.monthRange.start, calendar.monthRange.end),
          listOccupiedObservationDays(supabase, organizationId, calendar.monthRange.start, calendar.monthRange.end),
        ]);
        setOpenDays(days);
        setOccupiedDays(occupied);
        setOccupiedSlotIds(new Set());
        setMonthSlots([]);
        onMonthDayCountChange(days.size);
        return;
      }
      const [slots, occupied] = await Promise.all([
        listObservationSlotsForDateRange(supabase, organizationId, calendar.monthRange.start, calendar.monthRange.end),
        listOccupiedObservationSlotIds(supabase, organizationId, calendar.monthRange.start, calendar.monthRange.end),
      ]);
      setMonthSlots(slots);
      setOpenDays(new Set(slots.map((slot) => slot.date)));
      setOccupiedDays(new Set(slots.filter((slot) => occupied.has(slot.id)).map((slot) => slot.date)));
      setOccupiedSlotIds(occupied);
      onMonthDayCountChange(slots.length);
    } catch (loadError) {
      reportError('school_admin_schedule_shadow_load', loadError, {
        metadata: { start: calendar.monthRange.start, end: calendar.monthRange.end },
      });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load shadow days.');
    } finally {
      setLoading(false);
    }
  }, [calendar.monthRange.end, calendar.monthRange.start, onMonthDayCountChange, organizationId, reportError, supabase]);

  useEffect(() => {
    void loadMonthData();
  }, [loadMonthData]);

  const refresh = useCallback(async () => {
    await Promise.all([onStatsChanged(), loadMonthData()]);
  }, [loadMonthData, onStatsChanged]);
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({ refresh, error, label: 'Shadow days', id: 'admin-schedule-shadow-refresh' });

  const date = calendar.selectedDate;
  const daySlots = useMemo(
    () => (date && shadowMode !== 'whole_day' ? monthSlots.filter((slot) => slot.date === date) : []),
    [date, monthSlots, shadowMode],
  );
  const wholeDayOpen = date ? openDays.has(date) : false;
  const wholeDayBooked = date ? occupiedDays.has(date) : false;
  const dayReadOnly = date ? date < calendar.today : true;

  const selectDate = (next: string) => {
    if (next < calendar.today) return;
    calendar.setSelectedDate(next);
    setStatus(null);
    setChanged(false);
    setSheetOpen(true);
  };

  const reloadAfterChange = useCallback(() => {
    setChanged(true);
    void loadMonthData();
    void onStatsChanged();
  }, [loadMonthData, onStatsChanged]);

  const toggleWholeDay = async (open: boolean) => {
    if (!date || wholeDayBooked) return;
    if (previewReadOnly) return notifyReadOnly();
    setTogglingWholeDay(true);
    setStatus(null);
    let failure = '';
    const ok = await action.run(() => toggleObservationDayViaApi({ organizationId, date, open }), {
      key: 'schedule-shadow-day',
      silent: true,
      operation: 'school_admin_schedule_shadow_day_toggle',
      metadata: { date, open },
      error: (err) => {
        failure = errorText(err, 'Failed to update shadow day.');
        return { title: "Couldn't update the shadow day" };
      },
    });
    setTogglingWholeDay(false);
    if (!ok) {
      setStatus({ tone: 'error', title: "The day didn't change", description: `${failure} It's still ${open ? 'closed' : 'open'}.` });
      return;
    }
    setStatus({ tone: 'success', title: open ? 'Open for shadow visits' : 'Closed for shadow visits' });
    reloadAfterChange();
  };

  const closeSheet = () => {
    setSheetOpen(false);
    calendar.setSelectedDate(null);
    if (changed && date) {
      action.toast.success('Shadow day saved', { id: 'schedule-shadow-saved', description: `${formatDateOnlyLabel(date)} is up to date for families.` });
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={pullRefreshing} onRefresh={() => void onPullRefresh()} tintColor={Garden.soft} />}>
        <Text style={styles.helper}>Tap a day to open shadow availability or manage grade slots.</Text>
        {error ? (
          <GInlineBanner
            tone="error"
            title="Couldn't load shadow days"
            description={error}
            action={<GLink label="Try again" icon="refresh" onPress={() => void loadMonthData()} />}
          />
        ) : null}
        <AdminScheduleMonthGrid
          viewYear={calendar.viewYear}
          viewMonth={calendar.viewMonth}
          selectedDate={calendar.selectedDate}
          onSelectDate={selectDate}
          availableDates={openDays}
          bookedDates={occupiedDays}
          minDate={calendar.today}
          today={calendar.today}
          onPrevMonth={calendar.prevMonth}
          onNextMonth={calendar.nextMonth}
          onToday={calendar.goToToday}
          loading={loading}
          editable
        />
        <AdminScheduleLegend openLabel={shadowMode === 'whole_day' ? 'Open for shadow visits' : 'Open slots'} />
      </ScrollView>

      <ShadowDaySheet
        visible={sheetOpen && date != null}
        organizationId={organizationId}
        date={date}
        mode={shadowMode}
        readOnly={dayReadOnly}
        slots={daySlots}
        occupiedSlotIds={occupiedSlotIds}
        wholeDayOpen={wholeDayOpen}
        wholeDayBooked={wholeDayBooked}
        togglingWholeDay={togglingWholeDay}
        status={status}
        onStatus={setStatus}
        onClose={closeSheet}
        onChanged={reloadAfterChange}
        onToggleWholeDay={(open) => void toggleWholeDay(open)}
      />
    </>
  );
}

function ShadowDaySheet({
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
  status,
  onStatus,
  onClose,
  onChanged,
  onToggleWholeDay,
}: {
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
  status: SheetStatus;
  onStatus: (status: SheetStatus) => void;
  onClose: () => void;
  onChanged: () => void;
  onToggleWholeDay: (open: boolean) => void;
}) {
  const accent = useGardenAccent();
  const action = useAdminAction(organizationId);
  const { readOnly: previewReadOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const { scrollContentStyle } = useBottomSheetKeyboardScrollStyle(styles.sheetContent);
  const presets = useMemo(() => getShadowDayTimeWindowPresets(), []);
  const [gradeValues, setGradeValues] = useState<string[]>([]);
  const [presetId, setPresetId] = useState(presets[0]?.id ?? 'morning');
  const [label, setLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState(date);

  // Fresh form for each day (previous-value pattern; the Story sheet kept the last day's picks).
  if (formDate !== date) {
    setFormDate(date);
    setGradeValues([]);
    setLabel('');
  }

  const includeTime = mode === 'grade_and_time';
  const intro =
    mode === 'grade_targeted'
      ? 'Add which grades can shadow on this day.'
      : mode === 'grade_and_time'
        ? 'Add grade and time windows for this day.'
        : 'Open the full day for student shadow visits.';

  const toggleGrade = (value: string) => {
    haptic.select();
    setGradeValues((current) => (current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]));
  };

  const addSlot = async () => {
    if (!date) return;
    if (previewReadOnly) return notifyReadOnly();
    if (gradeValues.length === 0) {
      haptic.warning();
      onStatus({ tone: 'info', title: 'Select grades', description: 'Choose at least one grade for this shadow slot.' });
      return;
    }
    const preset = presets.find((entry) => entry.id === presetId) ?? presets[0];
    setSubmitting(true);
    onStatus(null);
    let failure = '';
    const ok = await action.run(
      () =>
        createObservationSlotViaApi({
          organizationId,
          date,
          startTime: includeTime ? preset.startTime : 'ALL_DAY',
          endTime: includeTime ? preset.endTime : null,
          label: label.trim() || null,
          gradeValues,
        }),
      {
        key: 'schedule-shadow-slot-add',
        silent: true,
        operation: 'school_admin_schedule_shadow_slot_add',
        metadata: { date, mode },
        error: (err) => {
          failure = errorText(err, 'Failed to add shadow slot.');
          return { title: "Couldn't add the slot" };
        },
      },
    );
    setSubmitting(false);
    if (!ok) {
      onStatus({ tone: 'error', title: "The slot wasn't added", description: `${failure} Your picks are still here.` });
      return;
    }
    onStatus({ tone: 'success', title: 'Slot added', description: `${formatGradeValuesLabel(gradeValues)} can now book this day.` });
    setGradeValues([]);
    setLabel('');
    onChanged();
  };

  const removeSlot = async (slot: ObservationSlot) => {
    if (previewReadOnly) return notifyReadOnly();
    const confirmed = await confirmDestructive({
      title: 'Remove shadow slot?',
      message: `${formatObservationSlotLabel(slot)} will no longer be bookable.`,
      confirmLabel: 'Remove',
    });
    if (!confirmed) return;
    setDeletingId(slot.id);
    onStatus(null);
    let failure = '';
    const ok = await action.run(() => deleteObservationSlotViaApi(organizationId, slot.id), {
      key: 'schedule-shadow-slot-delete',
      silent: true,
      operation: 'school_admin_schedule_shadow_slot_delete',
      error: (err) => {
        failure = errorText(err, 'Failed to remove shadow slot.');
        return { title: "Couldn't remove the slot" };
      },
    });
    setDeletingId(null);
    if (!ok) {
      onStatus({ tone: 'error', title: "The slot wasn't removed", description: failure });
      return;
    }
    onStatus({ tone: 'success', title: 'Slot removed' });
    onChanged();
  };

  return (
    <BottomSheetShell
      visible={visible}
      onClose={onClose}
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      accessibilityLabel="Close shadow day"
      backgroundColor={Garden.cream}
      borderColor={Garden.ink12}
      handleColor={Garden.ink25}
      maxHeight="92%"
      enableDragToDismiss={!submitting && !togglingWholeDay}
      scrollContentStyle={scrollContentStyle}
      header={
        <View style={styles.headerPad}>
          <AdminSheetHeader
            title={date ? formatDateOnlyLabel(date) : 'Shadow day'}
            subtitle={intro}
            aside={submitting || togglingWholeDay ? <GChip label="Saving…" tone="info" /> : status?.tone === 'success' ? <GChip label="Saved" tone="success" icon="checkmark" /> : null}
            onClose={onClose}
          />
        </View>
      }>
      {status ? <GInlineBanner tone={status.tone} title={status.title} description={status.description} /> : null}
      {mode === 'whole_day' ? (
        <GPressable
          accessibilityRole="switch"
          accessibilityLabel={wholeDayBooked ? 'Booked — cannot change' : wholeDayOpen ? 'Open for shadow visits' : 'Closed — tap to open'}
          accessibilityState={{ checked: wholeDayOpen, disabled: readOnly || wholeDayBooked || togglingWholeDay, busy: togglingWholeDay }}
          disabled={readOnly || wholeDayBooked || togglingWholeDay}
          onPress={() => onToggleWholeDay(!wholeDayOpen)}
          style={[
            styles.wholeDay,
            wholeDayBooked
              ? { backgroundColor: '#FFF3C4', borderColor: '#E2B33C' }
              : wholeDayOpen
                ? { backgroundColor: accent.peach, borderColor: accent.clay }
                : { backgroundColor: Garden.white, borderColor: Garden.ink15, borderStyle: 'dashed' },
          ]}>
          {togglingWholeDay ? (
            <ActivityIndicator color={accent.clayDeep} />
          ) : (
            <>
              <Text style={[styles.wholeDayTitle, { color: wholeDayBooked ? '#8A5A00' : wholeDayOpen ? accent.clayDeep : Garden.ink }]}>
                {wholeDayBooked ? 'Booked — cannot change' : wholeDayOpen ? 'Open for shadow visits' : 'Closed — tap to open'}
              </Text>
              {!wholeDayBooked && !readOnly ? (
                <Text style={styles.wholeDayMeta}>{wholeDayOpen ? 'Tap to close this day' : 'Families can book this day once it is open'}</Text>
              ) : null}
            </>
          )}
        </GPressable>
      ) : (
        <>
          {slots.length > 0 ? <GKicker>On this day</GKicker> : null}
          {slots.map((slot) => {
            const booked = occupiedSlotIds.has(slot.id);
            return (
              <View key={slot.id} style={[styles.slotRow, booked ? styles.slotBooked : null]}>
                <View style={styles.slotCopy}>
                  <Text style={styles.slotTitle}>{formatObservationSlotLabel(slot)}</Text>
                  <Text style={styles.slotMeta}>
                    {formatObservationSlotTimeLabel(slot)}
                    {slot.gradeValues.length > 0 ? ` · ${formatGradeValuesLabel(slot.gradeValues)}` : ''}
                  </Text>
                </View>
                {booked ? (
                  <GChip label="Booked" tone="warning" />
                ) : !readOnly ? (
                  <GPressable
                    accessibilityLabel={`Remove ${formatObservationSlotLabel(slot)}`}
                    accessibilityState={{ busy: deletingId === slot.id }}
                    disabled={deletingId === slot.id}
                    onPress={() => void removeSlot(slot)}
                    style={styles.remove}>
                    {deletingId === slot.id ? <ActivityIndicator size="small" color="#9F3A1E" /> : <Text style={styles.removeLabel}>Remove</Text>}
                  </GPressable>
                ) : null}
              </View>
            );
          })}
          {!readOnly ? (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Add slot</Text>
              <Text style={styles.formStep}>1 · Grades</Text>
              <View style={styles.chips}>
                {STUDENT_GRADE_OPTIONS.map((option) => {
                  const active = gradeValues.includes(option.value);
                  return (
                    <GPressable
                      key={option.value}
                      accessibilityRole="checkbox"
                      accessibilityLabel={option.label}
                      accessibilityState={{ checked: active }}
                      haptic="none"
                      onPress={() => toggleGrade(option.value)}
                      style={[styles.chip, active ? { backgroundColor: accent.clay, borderColor: accent.clay } : null]}>
                      <Text style={[styles.chipLabel, active && { color: Garden.white }]}>{option.label}</Text>
                    </GPressable>
                  );
                })}
              </View>
              {includeTime ? (
                <>
                  <Text style={styles.formStep}>2 · Time window</Text>
                  <View style={styles.chips}>
                    {presets.map((preset) => {
                      const active = preset.id === presetId;
                      return (
                        <GPressable
                          key={preset.id}
                          accessibilityRole="radio"
                          accessibilityLabel={preset.label}
                          accessibilityState={{ selected: active }}
                          haptic="select"
                          onPress={() => setPresetId(preset.id)}
                          style={[styles.chip, active ? { backgroundColor: accent.clay, borderColor: accent.clay } : null]}>
                          <Text style={[styles.chipLabel, active && { color: Garden.white }]}>{preset.label}</Text>
                        </GPressable>
                      );
                    })}
                  </View>
                </>
              ) : null}
              <GTextField label="Label" optional value={label} onChangeText={setLabel} placeholder="Optional label" />
              <GToyButton
                label={submitting ? 'Adding…' : 'Add slot'}
                icon="add"
                loading={submitting}
                disabled={submitting}
                fullWidth
                onPress={() => void addSlot()}
              />
            </View>
          ) : null}
        </>
      )}
    </BottomSheetShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 40, gap: 14 },
  helper: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft },
  headerPad: { paddingHorizontal: 16 },
  sheetContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24, gap: 12 },
  wholeDay: { minHeight: 76, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center', padding: 14, gap: 4 },
  wholeDayTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 16 },
  wholeDayMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft, textAlign: 'center' },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  slotBooked: { backgroundColor: '#FFF3C4', borderColor: '#E2B33C' },
  slotCopy: { flex: 1, minWidth: 0, gap: 2 },
  slotTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  slotMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  remove: {
    minHeight: 36,
    minWidth: 76,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#C2714F',
    backgroundColor: '#F9E5DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: '#9F3A1E' },
  form: { gap: 10, padding: 14, borderRadius: 18, borderWidth: 1.5, borderColor: Garden.ink12, backgroundColor: Garden.white },
  formTitle: { fontFamily: GardenFonts.display, fontSize: 19, color: Garden.ink },
  formStep: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.soft, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink15,
    backgroundColor: Garden.paper,
    justifyContent: 'center',
  },
  chipLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
});
