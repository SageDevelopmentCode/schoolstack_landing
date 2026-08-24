import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ADMIN_LIST_HORIZONTAL_PADDING } from '@/components/school-admin/admin-list-layout';
import { DetailTabBar } from '@/components/school-admin/detail-tab-bar';
import { ScheduleEventsTab } from '@/components/school-admin/schedule/schedule-events-tab';
import { ScheduleOverviewTab } from '@/components/school-admin/schedule/schedule-overview-tab';
import { ScheduleShadowTab } from '@/components/school-admin/schedule/schedule-shadow-tab';
import { ScheduleScreenSkeleton } from '@/components/school-admin/schedule/schedule-screen-skeleton';
import { ScheduleToursTab } from '@/components/school-admin/schedule/schedule-tours-tab';
import { ScheduleVisitsTab } from '@/components/school-admin/schedule/schedule-visits-tab';
import {
  parseScheduleTab,
  SCHEDULE_TABS,
  type ScheduleTabId,
} from '@/components/school-admin/schedule/schedule-constants';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
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

function formatHeaderStats(
  monthSlotCount: number | null,
  monthObservationDayCount: number | null,
  upcomingVisitCount: number | null,
): string {
  const parts: string[] = [];
  if (monthSlotCount != null) {
    parts.push(`${monthSlotCount} open slot${monthSlotCount === 1 ? '' : 's'}`);
  }
  if (monthObservationDayCount != null) {
    parts.push(`${monthObservationDayCount} shadow day${monthObservationDayCount === 1 ? '' : 's'}`);
  }
  if (upcomingVisitCount != null) {
    parts.push(`${upcomingVisitCount} upcoming visit${upcomingVisitCount === 1 ? '' : 's'}`);
  }
  return parts.join(' · ');
}

export function ScheduleScreen({ organizationId, slug }: ScheduleScreenProps) {
  const theme = useAdminTheme();
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

  const headerStats = formatHeaderStats(monthSlotCount, monthObservationDayCount, upcomingVisitCount);
  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ color: theme.textPrimary }}>
          Schedule
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {statsLoading ? 'Loading schedule summary…' : headerStats}
        </ThemedText>
        <View style={[styles.timezonePill, { backgroundColor: theme.elevated, borderColor: theme.border }]}>
          <ThemedText type="small" style={{ color: theme.textTertiary }}>
            {timezoneLabel}
          </ThemedText>
        </View>
      </View>

      <DetailTabBar
        tabs={SCHEDULE_TABS.map((entry) => ({ id: entry.id, label: entry.label }))}
        activeTabId={activeTab}
        onChange={(tabId) => setActiveTab(tabId as ScheduleTabId)}
      />

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
  header: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  timezonePill: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    marginTop: Spacing.one,
  },
  panel: {
    flex: 1,
  },
});
