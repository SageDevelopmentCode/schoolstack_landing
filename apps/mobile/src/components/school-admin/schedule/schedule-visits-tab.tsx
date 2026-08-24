import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ADMIN_LIST_HORIZONTAL_PADDING, AdminListSeparator } from '@/components/school-admin/admin-list-layout';
import {
  ScheduleVisitsFilters,
  type TimingFilter,
  type VisitTypeFilter,
} from '@/components/school-admin/schedule/schedule-visits-filters';
import { VisitListItem } from '@/components/school-admin/schedule/visit-list-item';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';
import {
  listOrgScheduledVisits,
  type AdminScheduledVisit,
} from '@/lib/admissions/admin-scheduled-visits';
import { getSupabaseClient } from '@/lib/supabase';

type ScheduleVisitsTabProps = {
  organizationId: string;
  slug: string;
  refreshing: boolean;
  onRefresh: () => void;
};

export function ScheduleVisitsTab({
  organizationId,
  slug,
  refreshing,
  onRefresh,
}: ScheduleVisitsTabProps) {
  const theme = useAdminTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [visits, setVisits] = useState<AdminScheduledVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timingFilter, setTimingFilter] = useState<TimingFilter>('all');
  const [typeFilter, setTypeFilter] = useState<VisitTypeFilter>('all');

  const loadVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listOrgScheduledVisits(supabase, organizationId);
      setVisits(rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load visits.');
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    void loadVisits();
  }, [loadVisits]);

  const filteredVisits = useMemo(
    () =>
      visits.filter((visit) => {
        if (timingFilter !== 'all' && visit.timing !== timingFilter) return false;
        if (typeFilter !== 'all' && visit.actionType !== typeFilter) return false;
        return true;
      }),
    [timingFilter, typeFilter, visits],
  );

  const timingCounts = useMemo(() => {
    const counts: Partial<Record<TimingFilter, number>> = { all: visits.length };
    for (const visit of visits) {
      counts[visit.timing] = (counts[visit.timing] ?? 0) + 1;
    }
    return counts;
  }, [visits]);

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<VisitTypeFilter, number>> = { all: visits.length };
    for (const visit of visits) {
      counts[visit.actionType] = (counts[visit.actionType] ?? 0) + 1;
    }
    return counts;
  }, [visits]);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <ScheduleVisitsFilters
          activeTiming={timingFilter}
          activeType={typeFilter}
          timingCounts={timingCounts}
          typeCounts={typeCounts}
          onChangeTiming={setTimingFilter}
          onChangeType={setTypeFilter}
        />
        {error ? (
          <ThemedText type="small" style={{ color: theme.error }}>
            {error}
          </ThemedText>
        ) : null}
      </View>

      <FlatList
        data={filteredVisits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={AdminListSeparator}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={() => {
              onRefresh();
              void loadVisits();
            }}
            tintColor={theme.accent}
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: 'center' }}>
              {timingFilter === 'all' && typeFilter === 'all'
                ? 'No visits have been booked yet.'
                : 'No visits match the current filters.'}
            </ThemedText>
          )
        }
        renderItem={({ item }) => (
          <VisitListItem
            visit={item}
            onPress={
              item.applicationId
                ? () => router.push(`/school-admin/${slug}/admissions/submissions/${item.applicationId}`)
                : undefined
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  listContent: {
    paddingHorizontal: ADMIN_LIST_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    flexGrow: 1,
  },
});
