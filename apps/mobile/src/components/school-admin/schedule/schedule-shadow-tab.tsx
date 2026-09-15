import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScheduleMonthCalendar } from '@/components/school-admin/schedule/schedule-month-calendar';
import { ScheduleAvailabilityLegend } from '@/components/school-admin/schedule/schedule-availability-legend';
import { ShadowDaySheet } from '@/components/school-admin/schedule/shadow-day-sheet';
import { useScheduleCalendar } from '@/components/school-admin/schedule/use-schedule-calendar';
import { StoryCard } from '@/components/story/story-card';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import {
  listObservationDayAvailability,
  listOccupiedObservationDays,
} from '@/lib/admissions/admissions-observation-availability';
import { toggleObservationDayViaApi } from '@/lib/school-admin/schedule-api';
import {
  getAdmissionsOrgSettings,
  resolveShadowDaySchedulingMode,
} from '@/lib/admissions/admissions-org-settings';
import {
  listObservationSlotsForDateRange,
  listOccupiedObservationSlotIds,
  type ObservationSlot,
} from '@/lib/admissions/admissions-observation-slots';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type ScheduleShadowTabProps = {
  organizationId: string;
  refreshing: boolean;
  onRefresh: () => void;
  onMonthDayCountChange?: (count: number) => void;
};

export function ScheduleShadowTab({
  organizationId,
  refreshing,
  onRefresh,
  onMonthDayCountChange,
}: ScheduleShadowTabProps) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);

  const [shadowMode, setShadowMode] = useState(resolveShadowDaySchedulingMode({}));
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());
  const [occupiedDays, setOccupiedDays] = useState<Set<string>>(new Set());
  const [occupiedSlotIds, setOccupiedSlotIds] = useState<Set<string>>(new Set());
  const [monthSlots, setMonthSlots] = useState<ObservationSlot[]>([]);
  const [daySlots, setDaySlots] = useState<ObservationSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingWholeDay, setTogglingWholeDay] = useState(false);
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
      const settings = await getAdmissionsOrgSettings(supabase, organizationId);
      const mode = resolveShadowDaySchedulingMode(settings);
      setShadowMode(mode);

      if (mode === 'whole_day') {
        const [days, occupied] = await Promise.all([
          listObservationDayAvailability(
            supabase,
            organizationId,
            calendar.monthRange.start,
            calendar.monthRange.end,
          ),
          listOccupiedObservationDays(
            supabase,
            organizationId,
            calendar.monthRange.start,
            calendar.monthRange.end,
          ),
        ]);

        setOpenDays(days);
        setOccupiedDays(occupied);
        setOccupiedSlotIds(new Set());
        setMonthSlots([]);
        onMonthDayCountChange?.(days.size);
        return;
      }

      const [slots, occupied] = await Promise.all([
        listObservationSlotsForDateRange(
          supabase,
          organizationId,
          calendar.monthRange.start,
          calendar.monthRange.end,
        ),
        listOccupiedObservationSlotIds(
          supabase,
          organizationId,
          calendar.monthRange.start,
          calendar.monthRange.end,
        ),
      ]);

      const openDates = new Set(slots.map((slot) => slot.date));
      const bookedDates = new Set(
        slots.filter((slot) => occupied.has(slot.id)).map((slot) => slot.date),
      );

      setMonthSlots(slots);
      setOpenDays(openDates);
      setOccupiedDays(bookedDates);
      setOccupiedSlotIds(occupied);
      onMonthDayCountChange?.(slots.length);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load shadow days.');
    } finally {
      setLoading(false);
    }
  }, [calendar.monthRange.end, calendar.monthRange.start, onMonthDayCountChange, organizationId, supabase]);

  const loadSelectedDay = useCallback(async () => {
    if (!calendar.selectedDate) {
      setDaySlots([]);
      return;
    }

    if (shadowMode === 'whole_day') {
      setDaySlots([]);
      return;
    }

    const slots = monthSlots.filter((slot) => slot.date === calendar.selectedDate);
    setDaySlots(slots);
  }, [calendar.selectedDate, monthSlots, shadowMode]);

  useEffect(() => {
    void loadMonthData();
  }, [loadMonthData]);

  useEffect(() => {
    void loadSelectedDay();
  }, [loadSelectedDay]);

  const handleSelectDate = (date: string) => {
    if (date < calendar.today) return;
    calendar.setSelectedDate(date);
  };

  useEffect(() => {
    if (calendar.selectedDate) setSheetOpen(true);
  }, [calendar.selectedDate]);

  const wholeDayOpen = calendar.selectedDate ? openDays.has(calendar.selectedDate) : false;
  const wholeDayBooked = calendar.selectedDate ? occupiedDays.has(calendar.selectedDate) : false;

  const handleToggleWholeDay = async (open: boolean) => {
    if (!calendar.selectedDate || wholeDayBooked) return;
    setTogglingWholeDay(true);
    try {
      await toggleObservationDayViaApi({
        organizationId,
        date: calendar.selectedDate,
        open,
      });
      await loadMonthData();
      await loadSelectedDay();
      onRefresh();
    } catch (toggleError) {
      reportError('school_admin_schedule_shadow_day_toggle', toggleError, {
        metadata: { date: calendar.selectedDate, open },
      });
      Alert.alert('Error', toggleError instanceof Error ? toggleError.message : 'Failed to update shadow day.');
    } finally {
      setTogglingWholeDay(false);
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
              void loadSelectedDay();
            }}
            tintColor={theme.primary}
          />
        }>
        <View style={styles.intro}>
          <StorySectionKicker style={styles.kicker}>Shadow days</StorySectionKicker>
          <Text style={[styles.helperCopy, { color: theme.muted }]}>
            Tap a day to open shadow availability or manage grade slots.
          </Text>
        </View>
        {error ? <StoryErrorBanner message={error} /> : null}

        <StoryCard style={styles.calendarCard}>
          <ScheduleMonthCalendar
            viewYear={calendar.viewYear}
            viewMonth={calendar.viewMonth}
            selectedDate={calendar.selectedDate}
            onSelectDate={handleSelectDate}
            availableDates={openDays}
            bookedDates={occupiedDays}
            minDate={calendar.today}
            onPrevMonth={calendar.prevMonth}
            onNextMonth={calendar.nextMonth}
            colors={calendar.calendarColors}
            editable
          />
        </StoryCard>
        <ScheduleAvailabilityLegend
          openLabel={shadowMode === 'whole_day' ? 'Open for shadow visits' : 'Open slots'}
        />
      </ScrollView>

      <ShadowDaySheet
        visible={sheetOpen}
        organizationId={organizationId}
        date={calendar.selectedDate}
        mode={shadowMode}
        readOnly={calendar.selectedDate ? calendar.selectedDate < calendar.today : true}
        slots={daySlots}
        occupiedSlotIds={occupiedSlotIds}
        wholeDayOpen={wholeDayOpen}
        wholeDayBooked={wholeDayBooked}
        togglingWholeDay={togglingWholeDay}
        onClose={() => {
          setSheetOpen(false);
          calendar.setSelectedDate(null);
        }}
        onReload={() => {
          void loadMonthData();
          void loadSelectedDay();
          onRefresh();
        }}
        onToggleWholeDay={(open) => void handleToggleWholeDay(open)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  intro: {
    gap: Spacing.one,
  },
  kicker: {
    marginBottom: 0,
  },
  helperCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  calendarCard: {
    padding: StoryCardPadding,
  },
});
