import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { ADMIN_LIST_HORIZONTAL_PADDING } from '@/components/school-admin/admin-list-layout';
import { ScheduleMonthCalendar } from '@/components/school-admin/schedule/schedule-month-calendar';
import { ScheduleAvailabilityLegend } from '@/components/school-admin/schedule/schedule-availability-legend';
import { TourSlotDaySheet } from '@/components/school-admin/schedule/tour-slot-day-sheet';
import { useScheduleCalendar } from '@/components/school-admin/schedule/use-schedule-calendar';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import {
  availabilitySlotKey,
  listAdmissionsAvailabilitySlots,
  toggleAdmissionsAvailabilitySlot,
  type AdmissionsAvailabilitySlotKey,
} from '@/lib/admissions/admissions-availability';
import {
  listOccupiedSlotKeysForDateRange,
  occupiedSlotKeysToBookedDates,
} from '@/lib/admissions/admin-scheduled-visits';
import { getSupabaseClient } from '@/lib/supabase';

type ScheduleToursTabProps = {
  organizationId: string;
  refreshing: boolean;
  onRefresh: () => void;
  onMonthSlotCountChange?: (count: number) => void;
};

export function ScheduleToursTab({
  organizationId,
  refreshing,
  onRefresh,
  onMonthSlotCountChange,
}: ScheduleToursTabProps) {
  const theme = useAdminTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [openSlots, setOpenSlots] = useState<Set<AdmissionsAvailabilitySlotKey>>(new Set());
  const [occupiedSlots, setOccupiedSlots] = useState<Set<AdmissionsAvailabilitySlotKey>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const calendar = useScheduleCalendar({
    organizationId,
    supabase,
    theme,
  });

  const loadMonthData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [slots, occupied] = await Promise.all([
        listAdmissionsAvailabilitySlots(
          supabase,
          organizationId,
          calendar.monthRange.start,
          calendar.monthRange.end,
        ),
        listOccupiedSlotKeysForDateRange(
          supabase,
          organizationId,
          calendar.monthRange.start,
          calendar.monthRange.end,
        ),
      ]);
      setOpenSlots(slots);
      setOccupiedSlots(occupied);
      onMonthSlotCountChange?.(slots.size);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load tour availability.');
    } finally {
      setLoading(false);
    }
  }, [calendar.monthRange.end, calendar.monthRange.start, onMonthSlotCountChange, organizationId, supabase]);

  useEffect(() => {
    void loadMonthData();
  }, [loadMonthData]);

  const openDates = useMemo(() => {
    const dates = new Set<string>();
    for (const key of openSlots) {
      dates.add(key.split('|')[0] ?? key);
    }
    return dates;
  }, [openSlots]);

  const bookedDates = useMemo(() => occupiedSlotKeysToBookedDates(occupiedSlots), [occupiedSlots]);

  const handleSelectDate = (date: string) => {
    if (date < calendar.today) return;
    calendar.setSelectedDate(date);
    setSheetOpen(true);
  };

  const handleToggleSlot = async (timeSlot: string, open: boolean) => {
    if (!calendar.selectedDate) return;
    const key = availabilitySlotKey(calendar.selectedDate, timeSlot);
    if (occupiedSlots.has(key)) return;

    const previous = new Set(openSlots);
    const next = new Set(openSlots);
    if (open) next.add(key);
    else next.delete(key);
    setOpenSlots(next);
    setTogglingKey(key);

    try {
      await toggleAdmissionsAvailabilitySlot(
        supabase,
        organizationId,
        calendar.selectedDate,
        timeSlot,
        open,
      );
      onMonthSlotCountChange?.(next.size);
      onRefresh();
    } catch (toggleError) {
      setOpenSlots(previous);
      Alert.alert('Error', toggleError instanceof Error ? toggleError.message : 'Failed to update slot.');
    } finally {
      setTogglingKey(null);
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={() => {
              onRefresh();
              void loadMonthData();
            }}
            tintColor={theme.accent}
          />
        }>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          Tours & interviews
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          Open dates are highlighted. Tap a day to manage 30-minute slots.
        </ThemedText>
        {error ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {error}
          </ThemedText>
        ) : null}

        <ScheduleMonthCalendar
          viewYear={calendar.viewYear}
          viewMonth={calendar.viewMonth}
          selectedDate={calendar.selectedDate}
          onSelectDate={handleSelectDate}
          availableDates={openDates}
          bookedDates={bookedDates}
          minDate={calendar.today}
          onPrevMonth={calendar.prevMonth}
          onNextMonth={calendar.nextMonth}
          colors={calendar.calendarColors}
          editable
        />
        <ScheduleAvailabilityLegend openLabel="Open slots" />
      </ScrollView>

      <TourSlotDaySheet
        visible={sheetOpen}
        date={calendar.selectedDate}
        readOnly={calendar.selectedDate ? calendar.selectedDate < calendar.today : true}
        openSlots={openSlots}
        occupiedSlots={occupiedSlots}
        togglingKey={togglingKey}
        onClose={() => setSheetOpen(false)}
        onToggleSlot={(timeSlot, open) => void handleToggleSlot(timeSlot, open)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
});
