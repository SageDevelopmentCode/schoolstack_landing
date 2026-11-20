import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden } from '@/components/parent/garden/tokens';
import { GErrorCard, GLink, GSkeleton } from '@/components/parent/garden/ui';
import { SubmissionRow } from '@/components/school-admin/admissions/garden/submission-row';
import {
  ADMISSIONS_EXTRA_FILTER_LABELS,
  ADMISSIONS_FILTERS,
  useAdmissionsListController,
  type AdmissionsListController,
} from '@/components/school-admin/admissions/garden/use-admissions-list-controller';
import { useAdmissionsListFeedback } from '@/components/school-admin/admissions/garden/use-admissions-list-feedback';
import {
  AdminEmptyPanel,
  AdminEndLine,
  AdminFilterChips,
  AdminKpiTiles,
  AdminLeadStrip,
  AdminRowSkeleton,
  type AdminFilterChip,
} from '@/components/school-admin/garden/admin-ui';
import { AdminTabHeader, useAdminTopBleed } from '@/components/school-admin/garden/admin-tab-header';
import { formatShortDate } from '@/lib/admissions/application-submissions';
import { haptic } from '@/lib/haptics';
import { calmEnter } from '@/lib/motion/portal-motion';

const KPI_BARS = {
  all: '#2E4A3C',
  draft: '#7FA7D9',
  submitted: '#E2B33C',
  enrolled: '#B5577A',
} as const;

/** "22 active applications · 3 ready to review" — built only from data. */
export function admissionsStatusLine(active: number, readyToReview: number): string {
  if (active === 0) return 'No active applications';
  const parts = [`${active} active application${active === 1 ? '' : 's'}`];
  parts.push(readyToReview > 0 ? `${readyToReview} ready to review` : 'none ready to review');
  return parts.join(' · ');
}

type AdmissionsListScreenProps = { organizationId: string; slug: string };

/**
 * School admin › Admissions (Garden): skeleton → error → list.
 * Data and routes live in `useAdmissionsListController`; feedback wraps them.
 * Design rules: `.claude/skills/admin-mobile-garden-design/SKILL.md`.
 */
export function AdmissionsListScreen(props: AdmissionsListScreenProps) {
  const controller = useAdmissionsListController(props);
  const failed = controller.status === 'error';

  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);

  if (controller.status === 'loading') return <AdmissionsListSkeleton />;
  if (controller.status === 'error') return <AdmissionsListError controller={controller} />;
  return <AdmissionsListContent controller={controller} />;
}

function AdmissionsListContent({ controller }: { controller: AdmissionsListController }) {
  const feedback = useAdmissionsListFeedback(controller);
  const bleed = useAdminTopBleed();
  const {
    statusFilter,
    statusCounts,
    allCount,
    latestSubmitted,
    hasAnyApplications,
    showEmptyFilteredState,
    filteredSubmissions,
  } = controller;

  const chips = useMemo<AdminFilterChip<string>[]>(() => {
    const items: AdminFilterChip<string>[] = ADMISSIONS_FILTERS.map((option) => ({
      id: option.id,
      label: option.label,
      count: option.id === 'all' ? allCount : (statusCounts[option.id] ?? 0),
    }));
    // A KPI tile can filter to a status without a permanent chip: show it while active.
    const extraLabel = ADMISSIONS_EXTRA_FILTER_LABELS[statusFilter];
    if (extraLabel) {
      items.splice(1, 0, { id: statusFilter, label: extraLabel, count: statusCounts[statusFilter] ?? 0 });
    }
    return items;
  }, [allCount, statusCounts, statusFilter]);

  const leadSubtitle = latestSubmitted
    ? `${latestSubmitted.guardianName ?? 'A family'}'s completed application is ready for your review${
        latestSubmitted.submittedAt ? ` · Submitted ${formatShortDate(latestSubmitted.submittedAt)}` : ''
      }.`
    : null;
  const guardianFirstName = latestSubmitted?.guardianName?.split(' ')[0] ?? 'family';

  const header = (
    <View style={styles.headerBlock}>
      {hasAnyApplications ? (
        <Animated.View entering={calmEnter({ delay: 40 })}>
          <AdminKpiTiles
            tiles={[
              {
                id: 'all',
                label: 'All applications',
                value: String(controller.activeSubmissionsCount),
                barColor: KPI_BARS.all,
                onPress: () => feedback.applyFilter('all'),
                testID: 'admissions-kpi-all',
              },
              {
                id: 'draft',
                label: 'In progress',
                value: String(controller.draftCount),
                barColor: KPI_BARS.draft,
                onPress: () => feedback.applyFilter('draft'),
                testID: 'admissions-kpi-draft',
              },
              {
                id: 'submitted',
                label: 'Ready to review',
                value: String(controller.submittedCount),
                barColor: KPI_BARS.submitted,
                onPress: () => feedback.applyFilter('submitted'),
                testID: 'admissions-kpi-submitted',
              },
              {
                id: 'enrolled',
                label: 'Enrolled learners',
                value: String(controller.enrolledCount),
                barColor: KPI_BARS.enrolled,
                onPress: () => feedback.applyFilter('enrolled'),
                testID: 'admissions-kpi-enrolled',
              },
            ]}
          />
        </Animated.View>
      ) : null}

      {latestSubmitted ? (
        <Animated.View entering={calmEnter({ delay: 90 })}>
          <AdminLeadStrip
            testID="admissions-review-latest"
            icon="document-text-outline"
            title={`Review ${latestSubmitted.guardianName ?? 'a family'}'s application`}
            subtitle={leadSubtitle}
            pillLabel={`Review ${guardianFirstName}`}
            onPress={controller.reviewLatestSubmitted}
          />
        </Animated.View>
      ) : null}

      <AdminFilterChips
        accessibilityLabel="Filter applications by status"
        items={chips}
        activeId={statusFilter}
        onChange={controller.setStatusFilter}
      />
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      {controller.isLoadingMore ? <AdminRowSkeleton count={2} /> : null}
      {!controller.isLoadingMore && controller.error ? (
        <GInlineBanner
          tone="error"
          title="Couldn't load the rest of the list"
          description="Showing what we already have. Check your connection, then try again."
          action={<GLink label="Try again" icon="refresh" onPress={feedback.retryList} />}
        />
      ) : null}
      {!controller.isLoadingMore && !controller.error && !controller.hasMore && filteredSubmissions.length > 3 ? (
        <AdminEndLine label="That's every application" />
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, bleed]} testID="school-admin-admissions-ready">
      <StatusBar style="dark" />
      <View style={styles.top}>
        <AdminTabHeader
          title="Admissions"
          accentWord="Admissions"
          statusLine={admissionsStatusLine(controller.activeSubmissionsCount, controller.submittedCount)}
          lastUpdatedAt={controller.lastUpdatedAt}
          statusTestID="admissions-status-line"
        />
      </View>
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        onEndReached={controller.loadMoreIfAvailable}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={feedback.pullRefreshing}
            onRefresh={() => void feedback.onPullRefresh()}
            tintColor={Garden.soft}
          />
        }
        ListEmptyComponent={
          showEmptyFilteredState ? (
            <AdminEmptyPanel
              icon="filter-outline"
              title="No submissions match the current filters."
              actionLabel="Show all applications"
              onAction={() => feedback.applyFilter('all')}
            />
          ) : (
            <AdminEmptyPanel
              icon="document-text-outline"
              title="No applications yet"
              body="No applications yet. Publish an enrollment flow and share your public apply link with families."
            />
          )
        }
        renderItem={({ item }) => <SubmissionRow submission={item} onPress={controller.openSubmission} />}
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function AdmissionsListError({ controller }: { controller: AdmissionsListController }) {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView
      style={[styles.root, bleed]}
      contentContainerStyle={styles.errorWrap}
      refreshControl={
        <RefreshControl refreshing={controller.isRefreshing} onRefresh={() => void controller.refresh()} />
      }>
      <StatusBar style="dark" />
      <AdminTabHeader title="Admissions" accentWord="Admissions" />
      <GErrorCard
        title="We couldn't load applications"
        message={controller.error ?? 'Failed to load submissions.'}
        onRetry={() => void controller.refresh()}
      />
    </ScrollView>
  );
}

export function AdmissionsListSkeleton() {
  const bleed = useAdminTopBleed();
  return (
    <ScrollView
      style={[styles.root, bleed]}
      scrollEnabled={false}
      accessibilityLabel="Loading applications"
      contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skStatus} />
      <View style={styles.skGrid}>
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
        <GSkeleton style={styles.skTile} />
      </View>
      <GSkeleton style={styles.skLead} />
      <View style={styles.skChips}>
        <GSkeleton style={styles.skChip} />
        <GSkeleton style={styles.skChip} />
        <GSkeleton style={styles.skChip} />
      </View>
      <GSkeleton style={styles.skRow} />
      <GSkeleton style={styles.skRow} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  top: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },
  headerBlock: { gap: 14, marginBottom: 14 },
  separator: { height: 10 },
  footer: { paddingTop: 12, gap: 10 },
  errorWrap: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  skeleton: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  skTitle: { width: '55%', height: 32, borderRadius: 10, marginTop: 6 },
  skStatus: { width: '72%', height: 16, borderRadius: 8 },
  skGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  skTile: { flexGrow: 1, flexBasis: '45%', height: 104, borderRadius: 18 },
  skLead: { height: 132, borderRadius: 18 },
  skChips: { flexDirection: 'row', gap: 8 },
  skChip: { width: 92, height: 40, borderRadius: 20 },
  skRow: { height: 136, borderRadius: 18 },
});
