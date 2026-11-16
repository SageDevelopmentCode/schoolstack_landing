import { StatusBar } from 'expo-status-bar';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ParentAttendanceGardenSkeleton } from '@/components/parent/attendance/garden/parent-attendance-garden-skeleton';
import {
  AttendanceChildSwitcher,
  AttendanceHistoryCard,
  AttendanceLatestDayCard,
  AttendanceRecentWeeksCard,
} from '@/components/parent/attendance/garden/sections/attendance-sections';
import { AttendanceDaySheet } from '@/components/parent/attendance/garden/sheets/attendance-day-sheet';
import { useParentAttendanceModel } from '@/components/parent/attendance/garden/use-parent-attendance-model';
import type { ParentAttendanceScreenController } from '@/components/parent/attendance/garden/use-parent-attendance-screen-controller';
import { GBackHeader } from '@/components/parent/garden/back-header';
import { useGardenPullRefresh } from '@/components/parent/garden/feedback';
import { Garden, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GErrorCard, GHand, gText } from '@/components/parent/garden/ui';

/**
 * Parent Attendance in Garden (read-only history). Header + child switcher,
 * the latest day, a recent-weeks grid and the filterable history. The day
 * sheet sits at the root.
 */
export function ParentAttendanceGardenScreen({
  controller,
}: {
  controller: ParentAttendanceScreenController;
}) {
  const accent = useGardenAccent();
  const model = useParentAttendanceModel(controller);
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.childrenError ?? controller.historyError,
    label: 'Attendance',
    id: 'attendance-refresh',
  });

  if (controller.isInitialLoading) {
    return (
      <>
        <StatusBar style="dark" />
        <ParentAttendanceGardenSkeleton onBack={controller.onBack} />
      </>
    );
  }

  const { selectedChild } = controller;
  const firstName = model.firstName;
  const hasChildren = controller.eligibleChildren.length > 0;

  return (
    <View style={styles.root} testID="parent-attendance-screen">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing || controller.isRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }>
        <GBackHeader
          backLabel="More"
          backAccessibilityLabel="Back"
          onBack={controller.onBack}
          title={hasChildren && firstName ? `${firstName}'s attendance` : 'Attendance'}
          accentWord={hasChildren ? firstName : null}
          subtitle="Check-in history and absences at a glance."
        />

        {selectedChild ? (
          <AttendanceChildSwitcher
            learners={controller.eligibleChildren}
            selectedApplicationId={selectedChild.applicationId}
            onSelect={controller.selectChild}
          />
        ) : null}

        {controller.childrenError ? (
          <GErrorCard
            title="We couldn't load your learners"
            message={`${controller.childrenError} Check your connection, then try again.`}
            onRetry={controller.retryChildren}
          />
        ) : null}

        {!hasChildren && !controller.childrenError ? (
          <GCard title="Nothing to show yet" index={1}>
            <Text style={gText.body}>No enrolled learners with attendance tracking yet.</Text>
            <View style={styles.hand}>
              <GHand>Check back once school starts.</GHand>
            </View>
          </GCard>
        ) : null}

        {hasChildren && model.latest && !controller.historyError ? (
          <AttendanceLatestDayCard entry={model.latest} firstName={firstName} onOpen={model.openDay} />
        ) : null}

        {hasChildren && model.weeks && !controller.historyError ? (
          <AttendanceRecentWeeksCard weeks={model.weeks} counts={model.counts} onOpen={model.openDay} />
        ) : null}

        {hasChildren ? (
          <AttendanceHistoryCard
            firstName={firstName}
            entriesLoaded={controller.entries.length}
            totalCount={controller.totalCount}
            counts={model.counts}
            filter={model.filter}
            onFilterChange={model.setFilter}
            groups={model.groups}
            showSkeleton={controller.showHistorySkeleton}
            error={controller.historyError}
            onRetry={controller.retryHistory}
            hasMore={controller.hasMore}
            loadingMore={controller.historyLoadingMore}
            onLoadMore={controller.loadMore}
            onOpen={model.openDay}
          />
        ) : null}
      </ScrollView>

      <AttendanceDaySheet
        entry={model.openEntry}
        firstName={firstName}
        newer={model.neighbours.newer}
        older={model.neighbours.older}
        onNavigate={model.openDay}
        onClose={model.closeDay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 48, gap: 16 },
  hand: { marginTop: 10 },
});
