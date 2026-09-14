import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ScheduleEventsTab } from '@/components/school-admin/schedule/schedule-events-tab';
import { ScheduleOverviewTab } from '@/components/school-admin/schedule/schedule-overview-tab';
import { ScheduleShadowTab } from '@/components/school-admin/schedule/schedule-shadow-tab';
import { ScheduleScreenSkeleton } from '@/components/school-admin/schedule/schedule-screen-skeleton';
import { ScheduleStoryHeader } from '@/components/school-admin/schedule/schedule-story-header';
import { ScheduleToursTab } from '@/components/school-admin/schedule/schedule-tours-tab';
import { ScheduleVisitsTab } from '@/components/school-admin/schedule/schedule-visits-tab';
import {
  parseScheduleTab,
  type ScheduleTabId,
} from '@/components/school-admin/schedule/schedule-constants';
import { Story } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import {
  countAdmissionsAvailabilitySlotsInMonth,
  formatOrganizationTimezoneLabel,
  getOrganizationTimezone,
  todayMonthYearInTimezone,
} from '@/lib/admissions/admissions-availability';
import { countObservationDaysInMonth } from '@/lib/admissions/admissions-observation-availability';
import { getSupabaseClient } from '@/lib/supabase';

type ScheduleScreenProps = {
  organizationId: string;
  slug: string;
};

export function ScheduleScreen({ organizationId, slug }: ScheduleScreenProps) {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const activeTab = parseScheduleTab(tab);
  const [timezone, setTimezone] = useState('America/Chicago');
  const [monthSlotCount, setMonthSlotCount] = useState<number | null>(null);
  const [monthObservationDayCount, setMonthObservationDayCount] = useState<number | null>(null);
  const [upcomingVisitCount, setUpcomingVisitCount] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const tz = await getOrganizationTimezone(supabase, organizationId);
      setTimezone(tz);
      const { year, month } = todayMonthYearInTimezone(tz);
      const [slotCount, observationCount] = await Promise.all([
        countAdmissionsAvailabilitySlotsInMonth(supabase, organizationId, year, month),
        countObservationDaysInMonth(supabase, organizationId, year, month),
      ]);
      setMonthSlotCount(slotCount);
      setMonthObservationDayCount(observationCount);
    } finally {
      setStatsLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats]),
  );

  const setActiveTab = useCallback(
    (nextTab: ScheduleTabId) => {
      if (nextTab === 'overview') {
        router.setParams({ tab: undefined });
        return;
      }
      router.setParams({ tab: nextTab });
    },
    [router],
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadStats().finally(() => setRefreshing(false));
  }, [loadStats]);

  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

  return (
    <View style={[styles.container, { backgroundColor: Story.paper }]} testID="schedule-screen">
      <View style={styles.headerShell}>
        <Animated.View entering={FadeInDown.duration(350)}>
          <ScheduleStoryHeader
            activeTab={activeTab}
            timezoneLabel={timezoneLabel}
            monthSlotCount={monthSlotCount}
            monthObservationDayCount={monthObservationDayCount}
            upcomingVisitCount={upcomingVisitCount}
            loadingTabKey={statsLoading && activeTab === 'overview' ? 'overview' : null}
            onTabChange={setActiveTab}
          />
        </Animated.View>
      </View>

      {statsLoading && activeTab === 'overview' ? (
        <ScheduleScreenSkeleton />
      ) : (
        <View style={styles.panel}>
          {activeTab === 'overview' ? (
            <ScheduleOverviewTab
              organizationId={organizationId}
              slug={slug}
              monthSlotCount={monthSlotCount}
              monthObservationDayCount={monthObservationDayCount}
              onTabChange={setActiveTab}
              onUpcomingCountChange={setUpcomingVisitCount}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          ) : null}
          {activeTab === 'events' ? (
            <ScheduleEventsTab
              organizationId={organizationId}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          ) : null}
          {activeTab === 'tours' ? (
            <ScheduleToursTab
              organizationId={organizationId}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onMonthSlotCountChange={setMonthSlotCount}
            />
          ) : null}
          {activeTab === 'shadow' ? (
            <ScheduleShadowTab
              organizationId={organizationId}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onMonthDayCountChange={setMonthObservationDayCount}
            />
          ) : null}
          {activeTab === 'visits' ? (
            <ScheduleVisitsTab
              organizationId={organizationId}
              slug={slug}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerShell: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  panel: {
    flex: 1,
  },
});
