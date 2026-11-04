import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SchoolAdminStaffHoursLivePanel } from '@/components/school-admin/staff-hours/school-admin-staff-hours-live-panel';
import { SchoolAdminStaffHoursSkeleton } from '@/components/school-admin/staff-hours/school-admin-staff-hours-skeleton';
import { SchoolAdminStaffHoursStaffPickerSheet } from '@/components/school-admin/staff-hours/school-admin-staff-hours-staff-picker-sheet';
import { SchoolAdminStaffHoursStoryHeader } from '@/components/school-admin/staff-hours/school-admin-staff-hours-story-header';
import { SchoolAdminStaffHoursSummaryPanel } from '@/components/school-admin/staff-hours/school-admin-staff-hours-summary-panel';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StoryPillNav } from '@/components/story/story-pill-nav';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  isCommitteeWorkspaceLoadTimeoutError,
  withCommitteeWorkspaceLoadTimeout,
} from '@/lib/school-admin/committees/committee-workspace-load';
import { fetchStaffHoursPageData } from '@/lib/school-admin/staff-hours/staff-hours-api';
import type { AdminStaffHoursPageData } from '@/lib/school-admin/staff-hours/staff-hours-types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { Story } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type StaffHoursView = 'live' | 'summary';

type SchoolAdminStaffHoursScreenProps = {
  organizationId: string;
  slug: string;
};

export function SchoolAdminStaffHoursScreen({
  organizationId,
  slug,
}: SchoolAdminStaffHoursScreenProps) {
  void slug;
  const theme = useParentTheme();
  const insets = useSafeAreaInsets();
  const { reportError } = useMobileErrorReporter(organizationId);

  const [view, setView] = useState<StaffHoursView>('live');
  const [pageData, setPageData] = useState<AdminStaffHoursPageData | null>(null);
  const [summaryFrom, setSummaryFrom] = useState('');
  const [summaryTo, setSummaryTo] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const [staffPickerOpen, setStaffPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (options: {
      from?: string;
      to?: string;
      staffMemberId?: string | null;
      seedSummaryRange?: boolean;
    }) => {
      const next = await withCommitteeWorkspaceLoadTimeout(
        fetchStaffHoursPageData(organizationId, {
          from: options.from || undefined,
          to: options.to || undefined,
          staffMemberId: options.staffMemberId ?? null,
          view: 'all',
        }),
      );
      setPageData(next);
      if (options.seedSummaryRange) {
        setSummaryFrom(next.summaryFrom);
        setSummaryTo(next.summaryTo);
      }
      return next;
    },
    [organizationId],
  );

  const load = useCallback(
    async (mode: 'initial' | 'refresh' | 'reload' = 'initial') => {
      if (mode === 'initial') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      setError(null);

      try {
        await fetchPage({
          from: summaryFrom,
          to: summaryTo,
          staffMemberId: staffFilter || null,
          seedSummaryRange: mode === 'initial' && !summaryFrom,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load staff hours.';
        setError(message);
        void reportError(
          isCommitteeWorkspaceLoadTimeoutError(err)
            ? 'staff_hours.load_timeout'
            : 'staff_hours.load',
          err,
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchPage, reportError, staffFilter, summaryFrom, summaryTo],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchPage({ seedSummaryRange: true });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load staff hours.';
        setError(message);
        void reportError(
          isCommitteeWorkspaceLoadTimeoutError(err)
            ? 'staff_hours.load_timeout'
            : 'staff_hours.load',
          err,
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPage, organizationId, reportError]);

  const reload = useCallback(async () => {
    await load('reload');
  }, [load]);

  const handleRefresh = useCallback(() => {
    void load('refresh');
  }, [load]);

  const handleViewChange = useCallback(
    (key: string) => {
      const nextView = key as StaffHoursView;
      setView(nextView);
      if (nextView === 'live') {
        void reload();
      }
    },
    [reload],
  );

  const handleApplySummary = useCallback(async () => {
    setExpandedStaffId(null);
    await load('reload');
    setView('summary');
  }, [load]);

  const sessionsForStaff = useCallback(
    (staffMemberId: string) =>
      pageData?.sessions.filter((session) => session.staffMemberId === staffMemberId) ?? [],
    [pageData?.sessions],
  );

  const staffFilterLabel = useMemo(() => {
    if (!staffFilter) return 'All staff';
    const match = pageData?.staffOptions.find((option) => option.id === staffFilter);
    return match?.name ?? 'All staff';
  }, [pageData?.staffOptions, staffFilter]);

  const pillItems = useMemo(
    () => [
      { key: 'live', label: 'Live', icon: 'time-outline' as const, testID: 'staff-hours-tab-live' },
      {
        key: 'summary',
        label: 'Summary',
        icon: 'bar-chart-outline' as const,
        testID: 'staff-hours-tab-summary',
      },
    ],
    [],
  );

  const showInitialSkeleton = loading && !pageData;
  const showPanelSkeleton = loading && pageData != null;

  return (
    <View
      style={[styles.root, { backgroundColor: Story.paper }]}
      testID="school-admin-staff-hours-page">
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }>
        <Animated.View entering={FadeInDown.duration(350)}>
          <SchoolAdminStaffHoursStoryHeader />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(30).duration(350)} style={styles.pillNav}>
          <StoryPillNav
            items={pillItems}
            activeKey={view}
            onChange={handleViewChange}
            fullWidth
            size="comfortable"
            accessibilityLabel="Staff hours views"
          />
        </Animated.View>

        {error ? <StoryErrorBanner message={error} /> : null}

        {showInitialSkeleton ? (
          <SchoolAdminStaffHoursSkeleton variant={view} />
        ) : pageData ? (
          showPanelSkeleton ? (
            <SchoolAdminStaffHoursSkeleton variant={view} />
          ) : view === 'live' ? (
            <SchoolAdminStaffHoursLivePanel pageData={pageData} />
          ) : (
            <SchoolAdminStaffHoursSummaryPanel
              pageData={pageData}
              summaryFrom={summaryFrom}
              summaryTo={summaryTo}
              staffFilter={staffFilter}
              staffFilterLabel={staffFilterLabel}
              loading={loading}
              expandedStaffId={expandedStaffId}
              onSummaryFromChange={setSummaryFrom}
              onSummaryToChange={setSummaryTo}
              onOpenStaffPicker={() => setStaffPickerOpen(true)}
              onApply={() => void handleApplySummary()}
              onToggleExpanded={setExpandedStaffId}
              sessionsForStaff={sessionsForStaff}
            />
          )
        ) : null}
      </ScrollView>

      <SchoolAdminStaffHoursStaffPickerSheet
        visible={staffPickerOpen}
        options={pageData?.staffOptions ?? []}
        selectedStaffMemberId={staffFilter}
        onClose={() => setStaffPickerOpen(false)}
        onSelect={setStaffFilter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  pillNav: {
    marginTop: Spacing.one,
  },
});
