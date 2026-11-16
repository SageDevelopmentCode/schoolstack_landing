import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSegmented } from '@/components/parent/garden/segmented';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GLink } from '@/components/parent/garden/ui';
import { errorText } from '@/components/school-admin/garden/admin-sheet';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { AdminScheduleLegend, AdminScheduleMonthGrid } from '@/components/school-admin/schedule/garden/schedule-garden-ui';
import { useScheduleCalendar } from '@/components/school-admin/schedule/use-schedule-calendar';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { haptic } from '@/lib/haptics';
import { listOccupiedSlotKeysForDateRange, occupiedSlotKeysToBookedDates } from '@/lib/admissions/admin-scheduled-visits';
import {
  ADMISSIONS_TIME_SLOT_GROUPS,
  availabilitySlotKey,
  campusTourAvailabilitySlotKeys,
  formatDateOnlyLabel,
  listAdmissionsAvailabilitySlots,
  type AdmissionsAvailabilitySlotKey,
  type AdmissionsTimeSlotPeriod,
} from '@/lib/admissions/admissions-availability';
import { toggleAdmissionsAvailabilitySlotViaApi } from '@/lib/school-admin/schedule-api';
import { getSupabaseClient } from '@/lib/supabase';

type Props = {
  organizationId: string;
  slug: string;
  onStatsChanged: () => Promise<void>;
  onMonthSlotCountChange: (count: number) => void;
};

/**
 * Schedule › Tours: Garden month grid of open / booked tour days; a day opens
 * the slot sheet where each 30-minute time toggles open or closed
 * (optimistic, rolled back with an in-sheet banner if the save fails).
 */
export function ScheduleToursPanel({ organizationId, onStatsChanged, onMonthSlotCountChange }: Props) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const action = useAdminAction(organizationId);
  const { reportError } = action;
  const { readOnly, notifyReadOnly } = useGardenReadOnlyGate();
  const [openSlots, setOpenSlots] = useState<Set<AdmissionsAvailabilitySlotKey>>(new Set());
  const [occupiedSlots, setOccupiedSlots] = useState<Set<AdmissionsAvailabilitySlotKey>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const calendar = useScheduleCalendar({ organizationId, supabase, theme });

  const loadMonthData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [slots, occupied] = await Promise.all([
        listAdmissionsAvailabilitySlots(supabase, organizationId, calendar.monthRange.start, calendar.monthRange.end),
        listOccupiedSlotKeysForDateRange(supabase, organizationId, calendar.monthRange.start, calendar.monthRange.end),
      ]);
      setOpenSlots(slots);
      setOccupiedSlots(occupied);
      onMonthSlotCountChange(slots.size);
    } catch (loadError) {
      reportError('school_admin_schedule_tours_load', loadError, {
        metadata: { start: calendar.monthRange.start, end: calendar.monthRange.end },
      });
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tour availability.');
    } finally {
      setLoading(false);
    }
  }, [calendar.monthRange.end, calendar.monthRange.start, onMonthSlotCountChange, organizationId, reportError, supabase]);

  useEffect(() => {
    void loadMonthData();
  }, [loadMonthData]);

  const refresh = useCallback(async () => {
    await Promise.all([onStatsChanged(), loadMonthData()]);
  }, [loadMonthData, onStatsChanged]);
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({ refresh, error, label: 'Tour slots', id: 'admin-schedule-tours-refresh' });

  const openDates = useMemo(() => {
    const dates = new Set<string>();
    for (const key of openSlots) dates.add(key.split('|')[0] ?? key);
    return dates;
  }, [openSlots]);
  const bookedDates = useMemo(() => occupiedSlotKeysToBookedDates(occupiedSlots), [occupiedSlots]);

  const selectDate = (date: string) => {
    if (date < calendar.today) return;
    calendar.setSelectedDate(date);
    setSheetError(null);
    setLastSaved(null);
    setSheetOpen(true);
  };

  const toggleSlot = async (timeSlot: string, open: boolean) => {
    const date = calendar.selectedDate;
    if (!date) return;
    if (readOnly) return notifyReadOnly();
    const key = availabilitySlotKey(date, timeSlot);
    if (occupiedSlots.has(key)) return;
    const previous = new Set(openSlots);
    const next = new Set(openSlots);
    if (open) {
      for (const openKey of campusTourAvailabilitySlotKeys(date, timeSlot)) next.add(openKey);
    } else {
      next.delete(key);
    }
    setOpenSlots(next);
    setTogglingKey(key);
    setSheetError(null);
    let failure = '';
    const ok = await action.run(
      () => toggleAdmissionsAvailabilitySlotViaApi({ organizationId, date, timeSlot, open }),
      {
        key: 'schedule-tour-slot',
        silent: true,
        operation: 'school_admin_schedule_tour_toggle',
        metadata: { date, timeSlot, open },
        error: (err) => {
          failure = errorText(err, 'Failed to update slot.');
          return { title: "Couldn't update the slot" };
        },
      },
    );
    setTogglingKey(null);
    if (!ok) {
      setOpenSlots(previous);
      setSheetError(`${failure} ${timeSlot} is ${open ? 'still closed' : 'still open'}.`);
      return;
    }
    setLastSaved(`${timeSlot} ${open ? 'open' : 'closed'}`);
    onMonthSlotCountChange(next.size);
    void onStatsChanged();
  };

  const closeSheet = () => {
    setSheetOpen(false);
    if (lastSaved && calendar.selectedDate) {
      const dayOpen = [...openSlots].filter((key) => key.startsWith(`${calendar.selectedDate}|`)).length;
      action.toast.success('Tour slots saved', {
        id: 'schedule-tour-slot',
        description: `${formatDateOnlyLabel(calendar.selectedDate)} has ${dayOpen} open slot${dayOpen === 1 ? '' : 's'}.`,
      });
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={pullRefreshing} onRefresh={() => void onPullRefresh()} tintColor={Garden.soft} />}>
        <Text style={styles.helper}>Open dates are highlighted. Tap a day to manage 30-minute slots.</Text>
        {error ? (
          <GInlineBanner
            tone="error"
            title="Couldn't load tour availability"
            description={error}
            action={<GLink label="Try again" icon="refresh" onPress={() => void loadMonthData()} />}
          />
        ) : null}
        <AdminScheduleMonthGrid
          viewYear={calendar.viewYear}
          viewMonth={calendar.viewMonth}
          selectedDate={calendar.selectedDate}
          onSelectDate={selectDate}
          availableDates={openDates}
          bookedDates={bookedDates}
          minDate={calendar.today}
          today={calendar.today}
          onPrevMonth={calendar.prevMonth}
          onNextMonth={calendar.nextMonth}
          onToday={calendar.goToToday}
          loading={loading}
          editable
        />
        <AdminScheduleLegend openLabel="Open slots" />
      </ScrollView>

      <TourSlotSheet
        visible={sheetOpen}
        date={calendar.selectedDate}
        readOnly={calendar.selectedDate ? calendar.selectedDate < calendar.today : true}
        openSlots={openSlots}
        occupiedSlots={occupiedSlots}
        togglingKey={togglingKey}
        error={sheetError}
        lastSaved={lastSaved}
        onClose={closeSheet}
        onToggleSlot={(timeSlot, open) => void toggleSlot(timeSlot, open)}
      />
    </>
  );
}

function TourSlotSheet({
  visible,
  date,
  readOnly,
  openSlots,
  occupiedSlots,
  togglingKey,
  error,
  lastSaved,
  onClose,
  onToggleSlot,
}: {
  visible: boolean;
  date: string | null;
  readOnly: boolean;
  openSlots: Set<AdmissionsAvailabilitySlotKey>;
  occupiedSlots: Set<AdmissionsAvailabilitySlotKey>;
  togglingKey: string | null;
  error: string | null;
  lastSaved: string | null;
  onClose: () => void;
  onToggleSlot: (timeSlot: string, open: boolean) => void;
}) {
  const accent = useGardenAccent();
  const [period, setPeriod] = useState<AdmissionsTimeSlotPeriod>('morning');
  const group = ADMISSIONS_TIME_SLOT_GROUPS.find((entry) => entry.id === period) ?? ADMISSIONS_TIME_SLOT_GROUPS[0];
  const dayKeys = date ? [...openSlots].filter((key) => key.startsWith(`${date}|`)) : [];
  const dayBooked = date ? [...occupiedSlots].filter((key) => key.startsWith(`${date}|`)).length : 0;

  return (
    <GSheet
      visible={visible && date != null}
      onClose={onClose}
      title={date ? formatDateOnlyLabel(date) : 'Tour slots'}
      subtitle={`${dayKeys.length} open${dayBooked > 0 ? ` · ${dayBooked} booked` : ''} · Tap a time to open or close it for family booking.`}
      headerAside={
        togglingKey ? <GChip label="Saving…" tone="info" /> : lastSaved ? <GChip label="Saved" tone="success" icon="checkmark" /> : null
      }>
      <View style={styles.sheetBody}>
        {error ? <GInlineBanner tone="error" title="That slot didn't change" description={error} /> : null}
        <GSegmented<AdmissionsTimeSlotPeriod>
          accessibilityLabel="Time of day"
          compact
          items={ADMISSIONS_TIME_SLOT_GROUPS.map((entry) => ({ id: entry.id, label: entry.label }))}
          activeId={period}
          onChange={(next) => {
            haptic.select();
            setPeriod(next);
          }}
        />
        <View style={styles.slotGrid}>
          {date
            ? group.slots.map((timeSlot) => {
                const key = availabilitySlotKey(date, timeSlot);
                const isOpen = openSlots.has(key);
                const isBooked = occupiedSlots.has(key);
                const isToggling = togglingKey === key;
                const disabled = readOnly || isBooked;
                return (
                  <Pressable
                    key={timeSlot}
                    accessibilityRole="switch"
                    accessibilityLabel={`${timeSlot}${isBooked ? ', booked' : ''}`}
                    accessibilityState={{ checked: isOpen, disabled: disabled || isToggling, busy: isToggling }}
                    disabled={disabled || isToggling}
                    onPress={() => {
                      haptic.select();
                      onToggleSlot(timeSlot, !isOpen);
                    }}
                    style={({ pressed }) => [
                      styles.slot,
                      isBooked
                        ? { backgroundColor: '#FFF3C4', borderColor: '#E2B33C' }
                        : isOpen
                          ? { backgroundColor: accent.peach, borderColor: accent.clay }
                          : { backgroundColor: Garden.white, borderColor: Garden.ink15, borderStyle: 'dashed' },
                      { opacity: disabled && !isBooked ? 0.5 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
                    ]}>
                    {isToggling ? (
                      <ActivityIndicator size="small" color={accent.clayDeep} />
                    ) : (
                      <>
                        <Text style={[styles.slotLabel, { color: isBooked ? '#8A5A00' : isOpen ? accent.clayDeep : Garden.soft }]}>{timeSlot}</Text>
                        <Text style={[styles.slotState, { color: isBooked ? '#8A5A00' : isOpen ? accent.clayDeep : Garden.ink60 }]}>
                          {isBooked ? 'Booked' : isOpen ? 'Open' : 'Closed'}
                        </Text>
                      </>
                    )}
                  </Pressable>
                );
              })
            : null}
        </View>
        {readOnly ? <Text style={styles.helper}>This day has passed, so slots can&apos;t change.</Text> : null}
      </View>
    </GSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 40, gap: 14 },
  helper: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft },
  sheetBody: { gap: 14 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '31%',
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  slotLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, fontVariant: ['tabular-nums'] },
  slotState: { fontFamily: GardenFonts.bodyBold, fontSize: 11.5 },
});
