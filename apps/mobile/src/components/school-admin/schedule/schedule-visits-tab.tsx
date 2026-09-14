import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  ScheduleVisitsFilters,
  type TimingFilter,
  type VisitTypeFilter,
} from '@/components/school-admin/schedule/schedule-visits-filters';
import { VisitStoryListItem } from '@/components/school-admin/schedule/visit-story-list-item';
import { StoryCard } from '@/components/story/story-card';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';
import {
  listOrgScheduledVisits,
  type AdminScheduledVisit,
} from '@/lib/admissions/admin-scheduled-visits';
import { getSupabaseClient } from '@/lib/supabase';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

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
  const theme = useParentTheme();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { reportError } = useMobileErrorReporter(organizationId);

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

  const hasFilters = timingFilter !== 'all' || typeFilter !== 'all';
  const showEmptyFilteredState = filteredVisits.length === 0 && visits.length > 0 && hasFilters;

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
        {error ? <StoryErrorBanner message={error} /> : null}
      </View>

      <FlatList
        data={filteredVisits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={() => {
              onRefresh();
              void loadVisits();
            }}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <StoryCard style={styles.emptyCard}>
              <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                {showEmptyFilteredState
                  ? 'No visits match the current filters.'
                  : 'No visits have been booked yet.'}
              </Text>
            </StoryCard>
          )
        }
        renderItem={({ item }) => (
          <VisitStoryListItem
            visit={item}
            showFormTitle
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
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  listContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    flexGrow: 1,
  },
  separator: {
    height: Spacing.one,
  },
  emptyCard: {
    padding: StoryCardPadding,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
