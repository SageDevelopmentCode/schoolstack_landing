import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { GStepList, type GStep } from '@/components/parent/garden/steps';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GKicker, GLink, GPressable } from '@/components/parent/garden/ui';
import { AdminKpiTiles, AdminRowSkeleton } from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { VisitRow } from '@/components/school-admin/schedule/garden/visit-row';
import type { ScheduleTabId } from '@/components/school-admin/schedule/schedule-constants';
import { listOrgScheduledVisits, type AdminScheduledVisit } from '@/lib/admissions/admin-scheduled-visits';
import { getEventDisplayStyle, SCHOOL_EVENT_TYPE_LABELS } from '@/lib/school-events/event-labels';
import { listUpcomingEventsForOrg } from '@/lib/school-events/events';
import type { OrganizationEvent } from '@/lib/school-events/types';
import { getSupabaseClient } from '@/lib/supabase';

const KPI_BARS = { tours: '#7FA7D9', shadow: '#2E4A3C', visits: '#E2B33C' } as const;

type Props = {
  organizationId: string;
  slug: string;
  onStatsChanged: () => Promise<void>;
  statsLoading: boolean;
  monthSlotCount: number | null;
  monthObservationDayCount: number | null;
  onTabChange: (tab: ScheduleTabId) => void;
  onUpcomingCountChange: (count: number) => void;
};

/** Schedule › Overview: linked month tiles, next visits by day, school events, and setup steps when empty. */
export function ScheduleOverviewPanel({
  organizationId,
  slug,
  onStatsChanged,
  statsLoading,
  monthSlotCount,
  monthObservationDayCount,
  onTabChange,
  onUpcomingCountChange,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useAdminAction(organizationId);
  const [visits, setVisits] = useState<AdminScheduledVisit[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<OrganizationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [visitRows, eventRows] = await Promise.all([
        listOrgScheduledVisits(supabase, organizationId),
        listUpcomingEventsForOrg(supabase, organizationId, 5),
      ]);
      setVisits(visitRows);
      setUpcomingEvents(eventRows);
    } catch (loadError) {
      reportError('school_admin_schedule_overview_load', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load schedule overview.');
      setVisits([]);
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, reportError, supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await Promise.all([onStatsChanged(), loadData()]);
  }, [loadData, onStatsChanged]);

  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({ refresh, error, label: 'Schedule', id: 'admin-schedule-refresh' });

  const upcomingVisits = useMemo(
    () => visits.filter((visit) => visit.timing === 'upcoming' || visit.timing === 'happening').slice(0, 7),
    [visits],
  );
  const upcomingCount = useMemo(() => visits.filter((visit) => visit.timing === 'upcoming').length, [visits]);

  useEffect(() => {
    if (!loading) onUpcomingCountChange(upcomingCount);
  }, [loading, onUpcomingCountChange, upcomingCount]);

  const visitsByDate = useMemo(() => {
    const groups = new Map<string, AdminScheduledVisit[]>();
    for (const visit of upcomingVisits) {
      const existing = groups.get(visit.scheduledDate) ?? [];
      existing.push(visit);
      groups.set(visit.scheduledDate, existing);
    }
    return [...groups.entries()];
  }, [upcomingVisits]);

  const openVisit = (visit: AdminScheduledVisit) => {
    if (visit.applicationId) router.push(`/school-admin/${slug}/admissions/submissions/${visit.applicationId}`);
  };

  const setupSteps = useMemo<GStep[]>(() => {
    const toursDone = (monthSlotCount ?? 0) > 0;
    const shadowDone = (monthObservationDayCount ?? 0) > 0;
    const eventsDone = upcomingEvents.length > 0;
    const firstOpen = !toursDone ? 'tours' : !shadowDone ? 'shadow' : !eventsDone ? 'events' : null;
    const stateFor = (id: string, done: boolean): GStep['state'] => (done ? 'done' : firstOpen === id ? 'current' : 'todo');
    return [
      {
        id: 'tours',
        title: 'Set tour slots',
        meta: toursDone ? `${monthSlotCount} open this month` : 'Families book tours and interviews from these.',
        state: stateFor('tours', toursDone),
        onPress: () => onTabChange('tours'),
      },
      {
        id: 'shadow',
        title: 'Open shadow days',
        meta: shadowDone ? `${monthObservationDayCount} open this month` : 'Let applicants spend a day in class.',
        state: stateFor('shadow', shadowDone),
        onPress: () => onTabChange('shadow'),
      },
      {
        id: 'events',
        title: 'Add event',
        meta: eventsDone ? `${upcomingEvents.length} coming up` : 'Field trips, no-school days, and community events.',
        state: stateFor('events', eventsDone),
        onPress: () => onTabChange('events'),
      },
    ];
  }, [monthObservationDayCount, monthSlotCount, onTabChange, upcomingEvents.length]);
  const setupComplete = setupSteps.every((step) => step.state === 'done');

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={pullRefreshing} onRefresh={() => void onPullRefresh()} tintColor={Garden.soft} />}>
      <AdminKpiTiles
        tiles={[
          {
            id: 'tours',
            label: 'Open time slots this month',
            value: statsLoading && monthSlotCount == null ? '—' : String(monthSlotCount ?? 0),
            barColor: KPI_BARS.tours,
            onPress: () => onTabChange('tours'),
            testID: 'schedule-kpi-tours',
          },
          {
            id: 'shadow',
            label: 'Open shadow days this month',
            value: statsLoading && monthObservationDayCount == null ? '—' : String(monthObservationDayCount ?? 0),
            barColor: KPI_BARS.shadow,
            onPress: () => onTabChange('shadow'),
            testID: 'schedule-kpi-shadow',
          },
          {
            id: 'visits',
            label: 'Upcoming visits',
            value: loading ? '—' : String(upcomingCount),
            barColor: KPI_BARS.visits,
            onPress: () => onTabChange('visits'),
            testID: 'schedule-kpi-visits',
          },
        ]}
      />

      {!loading && !setupComplete && upcomingVisits.length === 0 ? (
        <GCard index={0} title="Get your calendar ready">
          <Text style={styles.description}>Families book after submitting an application. Open times so they can.</Text>
          <GStepList steps={setupSteps} accessibilityLabel="Schedule setup steps" />
        </GCard>
      ) : null}

      <GCard index={1} title="Next visits" action={<GLink label="View all" onPress={() => onTabChange('visits')} />}>
        <Text style={styles.description}>Tours, interviews, and shadow visits on your calendar</Text>
        {loading ? (
          <AdminRowSkeleton count={3} />
        ) : error ? (
          <GInlineBanner
            tone="error"
            title="Couldn't load the schedule"
            description={error}
            action={<GLink label="Try again" icon="refresh" onPress={() => void onPullRefresh()} />}
          />
        ) : upcomingVisits.length === 0 ? (
          <Text style={styles.empty}>No upcoming visits yet. Families book after submitting an application.</Text>
        ) : (
          visitsByDate.map(([date, dayVisits], groupIndex) => (
            <View key={date} style={groupIndex > 0 ? styles.group : null}>
              <GKicker style={styles.dayLabel}>{dayVisits[0]?.whenLabel.split('·')[0]?.trim() ?? date}</GKicker>
              {dayVisits.map((visit, index) => (
                <VisitRow key={visit.id} visit={visit} divider={index > 0} onPress={visit.applicationId ? () => openVisit(visit) : undefined} />
              ))}
            </View>
          ))
        )}
      </GCard>

      <GCard index={2} title="On the calendar" action={<GLink label="Manage" onPress={() => onTabChange('events')} />}>
        <Text style={styles.description}>Events families see in the parent portal</Text>
        {loading ? (
          <AdminRowSkeleton count={2} />
        ) : upcomingEvents.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.empty}>No school events yet. Add field trips, no-school days, and community events.</Text>
            <GLink label="Add event" icon="add" onPress={() => onTabChange('events')} />
          </View>
        ) : (
          upcomingEvents.map((event, index) => {
            const colors = getEventDisplayStyle(event);
            return (
              <GPressable
                key={event.id}
                accessibilityLabel={`${event.title}. ${event.date}${!event.isAllDay && event.time ? ` ${event.time}` : ''}. ${SCHOOL_EVENT_TYPE_LABELS[event.type]}`}
                onPress={() => onTabChange('events')}
                style={[styles.eventRow, index > 0 && styles.divider]}>
                <View style={[styles.eventBar, { backgroundColor: colors.text }]} />
                <View style={styles.eventCopy}>
                  <Text numberOfLines={1} style={styles.eventTitle}>
                    {event.title}
                  </Text>
                  <Text style={styles.eventMeta}>
                    {event.date}
                    {!event.isAllDay && event.time ? ` · ${event.time}` : ''}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.badgeText, { color: colors.text }]}>{SCHOOL_EVENT_TYPE_LABELS[event.type]}</Text>
                </View>
              </GPressable>
            );
          })
        )}
      </GCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 40, gap: 14 },
  description: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft, marginBottom: 8 },
  empty: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.soft },
  emptyBlock: { gap: 10 },
  group: { marginTop: 10 },
  dayLabel: { marginTop: 4, marginBottom: 2 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingVertical: 8 },
  eventBar: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  eventCopy: { flex: 1, minWidth: 0, gap: 2 },
  eventTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  eventMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft, fontVariant: ['tabular-nums'] },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: GardenFonts.bodyExtra, fontSize: 12 },
});
