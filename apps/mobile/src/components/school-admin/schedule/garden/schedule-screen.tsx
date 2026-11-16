import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GSegmented } from '@/components/parent/garden/segmented';
import { Garden, PORTAL_EASE } from '@/components/parent/garden/tokens';
import { GChip } from '@/components/parent/garden/ui';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { ScheduleEventsPanel } from '@/components/school-admin/schedule/garden/schedule-events-panel';
import { ScheduleOverviewPanel } from '@/components/school-admin/schedule/garden/schedule-overview-panel';
import { ScheduleShadowPanel } from '@/components/school-admin/schedule/garden/schedule-shadow-panel';
import { ScheduleToursPanel } from '@/components/school-admin/schedule/garden/schedule-tours-panel';
import { ScheduleVisitsPanel } from '@/components/school-admin/schedule/garden/schedule-visits-panel';
import { parseScheduleTab, SCHEDULE_TABS, type ScheduleTabId } from '@/components/school-admin/schedule/schedule-constants';
import { haptic } from '@/lib/haptics';
import {
  countAdmissionsAvailabilitySlotsInMonth,
  formatOrganizationTimezoneLabel,
  getOrganizationTimezone,
  todayMonthYearInTimezone,
} from '@/lib/admissions/admissions-availability';
import { countObservationDaysInMonth } from '@/lib/admissions/admissions-observation-availability';
import { getSupabaseClient } from '@/lib/supabase';

const TAB_ICONS: Record<ScheduleTabId, 'grid-outline' | 'calendar-outline' | 'walk-outline' | 'school-outline' | 'list-outline'> = {
  overview: 'grid-outline',
  events: 'calendar-outline',
  tours: 'walk-outline',
  shadow: 'school-outline',
  visits: 'list-outline',
};

/** Per-tab status line (same copy as the Story header subtitle). */
export function scheduleStatusLine(
  tab: ScheduleTabId,
  monthSlotCount: number | null,
  monthObservationDayCount: number | null,
  upcomingVisitCount: number | null,
): string {
  switch (tab) {
    case 'overview': {
      const parts: string[] = [];
      if (monthSlotCount != null) parts.push(`${monthSlotCount} open slot${monthSlotCount === 1 ? '' : 's'}`);
      if (monthObservationDayCount != null) {
        parts.push(`${monthObservationDayCount} shadow day${monthObservationDayCount === 1 ? '' : 's'}`);
      }
      if (upcomingVisitCount != null) parts.push(`${upcomingVisitCount} upcoming visit${upcomingVisitCount === 1 ? '' : 's'}`);
      return parts.join(' · ') || 'Tours, shadow days, and school events in one place';
    }
    case 'events':
      return 'School-wide events families see in the parent portal';
    case 'tours':
      return 'Set 30-minute slots for campus tours and family interviews';
    case 'shadow':
      return 'Configure whole-day, grade-targeted, or grade + time shadow visits';
    case 'visits':
      return 'Every booked tour, interview, and shadow day';
  }
}

type Props = { organizationId: string; slug: string };

/**
 * School admin › More › Schedule (Garden). Same `?tab=` routing, month stats
 * and per-tab data as the Story screen; each panel owns its own loads.
 */
export function ScheduleScreen({ organizationId, slug }: Props) {
  const router = useRouter();
  const bleed = useAdminTopBleed();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useAdminAction(organizationId);
  const activeTab = parseScheduleTab(tab);

  const [timezone, setTimezone] = useState('America/Chicago');
  const [monthSlotCount, setMonthSlotCount] = useState<number | null>(null);
  const [monthObservationDayCount, setMonthObservationDayCount] = useState<number | null>(null);
  const [upcomingVisitCount, setUpcomingVisitCount] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const tz = await getOrganizationTimezone(supabase, organizationId);
      if (!mounted.current) return;
      setTimezone(tz);
      const { year, month } = todayMonthYearInTimezone(tz);
      const [slotCount, observationCount] = await Promise.all([
        countAdmissionsAvailabilitySlotsInMonth(supabase, organizationId, year, month),
        countObservationDaysInMonth(supabase, organizationId, year, month),
      ]);
      if (!mounted.current) return;
      setMonthSlotCount(slotCount);
      setMonthObservationDayCount(observationCount);
      setLastUpdatedAt(Date.now());
    } catch (err) {
      // Stats only feed the header and tiles; the panels show their own errors.
      reportError('school_admin_schedule_stats_load', err);
    } finally {
      if (mounted.current) setStatsLoading(false);
    }
  }, [organizationId, reportError, supabase]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats]),
  );

  const setActiveTab = useCallback(
    (next: ScheduleTabId) => {
      haptic.select();
      router.setParams({ tab: next === 'overview' ? undefined : next });
    },
    [router],
  );

  const timezoneLabel = formatOrganizationTimezoneLabel(timezone);
  const panelProps = { organizationId, slug, onStatsChanged: loadStats };

  return (
    <View style={[styles.root, bleed]} testID="schedule-screen">
      <StatusBar style="dark" />
      <View style={styles.top} testID="schedule-story-header">
        <AdminTabHeader
          title="Schedule"
          accentWord="Schedule"
          statusLine={scheduleStatusLine(activeTab, monthSlotCount, monthObservationDayCount, upcomingVisitCount)}
          lastUpdatedAt={lastUpdatedAt}
          statusTestID="schedule-status-line"
          toolbar={<GChip label={timezoneLabel} tone="neutral" icon="globe-outline" />}
        />
        <GSegmented<ScheduleTabId>
          accessibilityLabel="Schedule sections"
          compact
          scrollable
          items={SCHEDULE_TABS.map((entry) => ({
            id: entry.id,
            label: entry.label,
            icon: TAB_ICONS[entry.id],
            testID: `schedule-tab-${entry.id}`,
          }))}
          activeId={activeTab}
          onChange={setActiveTab}
        />
      </View>

      <Animated.View key={activeTab} entering={FadeIn.duration(220).easing(PORTAL_EASE)} style={styles.panel}>
        {activeTab === 'overview' ? (
          <ScheduleOverviewPanel
            {...panelProps}
            statsLoading={statsLoading}
            monthSlotCount={monthSlotCount}
            monthObservationDayCount={monthObservationDayCount}
            onTabChange={setActiveTab}
            onUpcomingCountChange={setUpcomingVisitCount}
          />
        ) : null}
        {activeTab === 'events' ? <ScheduleEventsPanel {...panelProps} /> : null}
        {activeTab === 'tours' ? <ScheduleToursPanel {...panelProps} onMonthSlotCountChange={setMonthSlotCount} /> : null}
        {activeTab === 'shadow' ? (
          <ScheduleShadowPanel {...panelProps} onMonthDayCountChange={setMonthObservationDayCount} />
        ) : null}
        {activeTab === 'visits' ? <ScheduleVisitsPanel {...panelProps} /> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 12 },
  panel: { flex: 1 },
});
