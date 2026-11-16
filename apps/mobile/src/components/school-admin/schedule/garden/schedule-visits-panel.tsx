import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GLink } from '@/components/parent/garden/ui';
import { AdminEmptyPanel, AdminFilterChips, AdminRowSkeleton, type AdminFilterChip } from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import { VisitRow } from '@/components/school-admin/schedule/garden/visit-row';
import type { TimingFilter, VisitTypeFilter } from '@/components/school-admin/schedule/schedule-visits-filters';
import { listOrgScheduledVisits, type AdminScheduledVisit } from '@/lib/admissions/admin-scheduled-visits';
import { getSupabaseClient } from '@/lib/supabase';

const TIMING_FILTERS: { id: TimingFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'happening', label: 'Happening' },
  { id: 'past', label: 'Past' },
];

const TYPE_FILTERS: { id: VisitTypeFilter; label: string }[] = [
  { id: 'all', label: 'All types' },
  { id: 'schedule_campus_tour', label: 'Tours' },
  { id: 'schedule_family_interview', label: 'Interviews' },
  { id: 'schedule_observation_day', label: 'Shadow' },
];

type Props = { organizationId: string; slug: string; onStatsChanged: () => Promise<void> };

/** Schedule › Visits: every booked tour, interview and shadow day with timing and type chips. */
export function ScheduleVisitsPanel({ organizationId, slug, onStatsChanged }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useAdminAction(organizationId);
  const [visits, setVisits] = useState<AdminScheduledVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timingFilter, setTimingFilter] = useState<TimingFilter>('all');
  const [typeFilter, setTypeFilter] = useState<VisitTypeFilter>('all');

  const loadVisits = useCallback(async () => {
    setError(null);
    try {
      setVisits(await listOrgScheduledVisits(supabase, organizationId));
    } catch (loadError) {
      reportError('school_admin_schedule_visits_load', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load visits.');
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, reportError, supabase]);

  useEffect(() => {
    void loadVisits();
  }, [loadVisits]);

  const refresh = useCallback(async () => {
    await Promise.all([onStatsChanged(), loadVisits()]);
  }, [loadVisits, onStatsChanged]);
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({ refresh, error, label: 'Visits', id: 'admin-schedule-visits-refresh' });

  const filtered = useMemo(
    () =>
      visits.filter(
        (visit) =>
          (timingFilter === 'all' || visit.timing === timingFilter) && (typeFilter === 'all' || visit.actionType === typeFilter),
      ),
    [timingFilter, typeFilter, visits],
  );

  const timingChips = useMemo<AdminFilterChip<TimingFilter>[]>(
    () =>
      TIMING_FILTERS.map((entry) => ({
        ...entry,
        count: entry.id === 'all' ? visits.length : visits.filter((visit) => visit.timing === entry.id).length,
      })),
    [visits],
  );
  const typeChips = useMemo<AdminFilterChip<VisitTypeFilter>[]>(
    () =>
      TYPE_FILTERS.map((entry) => ({
        ...entry,
        count: entry.id === 'all' ? visits.length : visits.filter((visit) => visit.actionType === entry.id).length,
      })),
    [visits],
  );

  const filtering = timingFilter !== 'all' || typeFilter !== 'all';
  const clearFilters = () => {
    setTimingFilter('all');
    setTypeFilter('all');
  };

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={pullRefreshing} onRefresh={() => void onPullRefresh()} tintColor={Garden.soft} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <AdminFilterChips accessibilityLabel="Filter by timing" items={timingChips} activeId={timingFilter} onChange={setTimingFilter} />
          <AdminFilterChips accessibilityLabel="Filter by type" items={typeChips} activeId={typeFilter} onChange={setTypeFilter} />
          {error ? (
            <GInlineBanner
              tone="error"
              title="Couldn't load visits"
              description={error}
              action={<GLink label="Try again" icon="refresh" onPress={() => void onPullRefresh()} />}
            />
          ) : null}
          {filtering && filtered.length > 0 ? (
            <Text style={styles.count} accessibilityLiveRegion="polite">
              Showing {filtered.length} of {visits.length}
            </Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <View style={[styles.card, styles.cardFirst, styles.cardLast]}>
            <AdminRowSkeleton count={5} />
          </View>
        ) : filtering && visits.length > 0 ? (
          <AdminEmptyPanel icon="search-outline" title="No visits match the current filters." actionLabel="Show every visit" onAction={clearFilters} />
        ) : error ? null : (
          <AdminEmptyPanel icon="calendar-outline" title="No visits have been booked yet." body="Families book after submitting an application." />
        )
      }
      renderItem={({ item, index }) => (
        <View style={[styles.card, index === 0 && styles.cardFirst, index === filtered.length - 1 && styles.cardLast]}>
          <VisitRow
            visit={item}
            showFormTitle
            divider={index > 0}
            onPress={item.applicationId ? () => router.push(`/school-admin/${slug}/admissions/submissions/${item.applicationId}`) : undefined}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 40 },
  header: { gap: 10, marginBottom: 12 },
  count: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft, fontVariant: ['tabular-nums'] },
  card: {
    backgroundColor: Garden.white,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: Garden.ink12,
    paddingHorizontal: 14,
  },
  cardFirst: { borderTopWidth: 1.5, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 4 },
  cardLast: { borderBottomWidth: 1.5, borderBottomLeftRadius: 22, borderBottomRightRadius: 22, paddingBottom: 4 },
});
