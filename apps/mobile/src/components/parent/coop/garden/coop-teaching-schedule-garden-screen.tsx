import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import {
  CoopEmptyPanel,
  CoopScreenRoot,
  CoopStatStrip,
  coopContentStyle,
} from '@/components/parent/coop/garden/coop-garden-ui';
import { CoopTeachingScheduleSkeleton } from '@/components/parent/coop/garden/coop-garden-skeletons';
import { TeachingWeekCard } from '@/components/parent/coop/garden/teaching-week-card';
import type { CoopTeachingScheduleController } from '@/components/parent/coop/garden/use-coop-teaching-schedule-controller';
import { useCoopSignupFeedback } from '@/components/parent/coop/garden/use-coop-signup-feedback';
import { GBackHeader } from '@/components/parent/garden/back-header';
import { useGardenPullRefresh, useGardenReadOnlyGate } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSegmented } from '@/components/parent/garden/segmented';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GErrorCard, GLink } from '@/components/parent/garden/ui';
import {
  MOBILE_TEACHING_SCHEDULE_FILTER_PILLS,
  computeTeachingScheduleSummary,
  countMyTeachingWeeks,
  filterMobileTeachingScheduleWeeks,
  findNextTeachingWeek,
  formatTeachingScheduleDateRange,
  isTeachingWeekPast,
  sortTeachingScheduleWeeks,
  teachingScheduleWeekDisplayName,
  type MobileTeachingScheduleFilterKey,
  type TeachingScheduleParentRole,
} from '@/lib/parent/coop/teaching-schedule-helpers';
import type { ParentCoopTeachingScheduleWeek } from '@/lib/parent/parent-portal-api';

const TITLE = 'Teaching schedule';
const SUBTITLE =
  'View the full year teaching schedule and sign up to volunteer when instructor or assistant slots are open.';

/**
 * Co-op Teaching schedule in Garden (web parity): header → at a glance
 * (weeks, events, completed, next up) → filters → one card per week.
 */
export function CoopTeachingScheduleGardenScreen({
  controller,
}: {
  controller: CoopTeachingScheduleController;
}) {
  const accent = useGardenAccent();
  const { guard } = useGardenReadOnlyGate();
  const notifySignup = useCoopSignupFeedback();
  const [filterKey, setFilterKey] = useState<MobileTeachingScheduleFilterKey>('all');
  const { pullRefreshing, onPullRefresh } = useGardenPullRefresh({
    refresh: controller.refresh,
    error: controller.error,
    label: 'Teaching schedule',
    id: 'coop-teaching-schedule-refresh',
  });

  const { weeks, currentFamilyId, toggleRole } = controller;
  const sortedWeeks = useMemo(() => sortTeachingScheduleWeeks(weeks), [weeks]);
  const summary = useMemo(() => computeTeachingScheduleSummary(weeks), [weeks]);
  const nextWeek = useMemo(() => findNextTeachingWeek(weeks), [weeks]);
  const myWeekCount = useMemo(() => countMyTeachingWeeks(weeks, currentFamilyId), [weeks, currentFamilyId]);
  const filteredWeeks = useMemo(
    () => filterMobileTeachingScheduleWeeks(sortedWeeks, filterKey, currentFamilyId),
    [sortedWeeks, filterKey, currentFamilyId],
  );

  const filterItems = useMemo(
    () =>
      MOBILE_TEACHING_SCHEDULE_FILTER_PILLS.map((pill) => ({
        id: pill.key,
        label: pill.label,
        badge: pill.key === 'mine' && myWeekCount > 0 ? myWeekCount : undefined,
        testID: `parent-coop-teaching-filter-${pill.key}`,
      })),
    [myWeekCount],
  );

  const runToggle = useCallback(
    async (week: ParentCoopTeachingScheduleWeek, role: TeachingScheduleParentRole) => {
      const result = await toggleRole(week, role);
      const roleWord = role === 'instructor' ? 'instructor' : 'assistant';
      const name = teachingScheduleWeekDisplayName(week);
      notifySignup(result, {
        itemName: `${name} as ${roleWord}`,
        signedUpDescription: `Thanks for helping teach. ${formatTeachingScheduleDateRange(week.startDate, week.endDate)}.`,
        removedTitle: `Withdrew from ${name}`,
        removedDescription: `The ${roleWord} slot is open for another family.`,
      });
    },
    [notifySignup, toggleRole],
  );
  const onToggleRole = useMemo(
    () => guard((week: ParentCoopTeachingScheduleWeek, role: TeachingScheduleParentRole) => {
      void runToggle(week, role);
    }),
    [guard, runToggle],
  );

  if (controller.status === 'loading') {
    return <CoopTeachingScheduleSkeleton title={TITLE} subtitle={SUBTITLE} />;
  }

  const header = (
    <View style={styles.headerStack}>
      <GBackHeader
        title={TITLE}
        accentWord="schedule"
        subtitle={SUBTITLE}
        testID="parent-coop-teaching-schedule-header"
      />

      {controller.status === 'error' ? (
        <GErrorCard
          title="We couldn't load the schedule"
          message={`${controller.error ?? 'Something went wrong.'} Check your connection, then try again.`}
          onRetry={() => void onPullRefresh()}
        />
      ) : (
        <>
          {controller.readOnly ? (
            <GInlineBanner
              tone="info"
              title="Preview mode"
              description="Volunteer sign-ups are turned off here."
            />
          ) : null}

          {controller.error && !pullRefreshing ? (
            <GInlineBanner
              tone="warning"
              title="Showing the last schedule we loaded"
              description={controller.error}
              action={
                <GLink
                  label="Try again"
                  icon="refresh"
                  onPress={() => void onPullRefresh()}
                  style={styles.bannerLink}
                />
              }
            />
          ) : null}

          {weeks.length > 0 ? (
            <>
              <CoopStatStrip
                index={1}
                testID="parent-coop-teaching-schedule-summary"
                stats={[
                  { label: summary.weekCount === 1 ? 'Week' : 'Weeks', value: summary.weekCount },
                  { label: summary.eventCount === 1 ? 'Event' : 'Events', value: summary.eventCount },
                  { label: 'Completed', value: summary.completedCount },
                ]}
                nextUp={
                  nextWeek
                    ? {
                        title: summary.nextWeekName,
                        meta: formatTeachingScheduleDateRange(nextWeek.startDate, nextWeek.endDate),
                      }
                    : { title: 'No more weeks this year' }
                }
              />

              <GSegmented
                items={filterItems}
                activeId={filterKey}
                onChange={setFilterKey}
                scrollable
                accessibilityLabel="Filter teaching weeks"
              />

              <View style={styles.listHeading}>
                <Text style={styles.listTitle} accessibilityRole="header">
                  The year, week by week
                </Text>
                <GChip
                  tone="neutral"
                  label={
                    filteredWeeks.length === weeks.length
                      ? `${weeks.length} weeks`
                      : `${filteredWeeks.length} of ${weeks.length}`
                  }
                />
              </View>
            </>
          ) : null}
        </>
      )}
    </View>
  );

  const empty =
    controller.status === 'error' ? null : (
      <CoopEmptyPanel
        icon={weeks.length === 0 ? 'calendar-outline' : 'search-outline'}
        testID="parent-teaching-schedule-empty"
        message={
          weeks.length === 0
            ? 'No teaching weeks have been published yet.'
            : filterKey === 'mine'
              ? "You haven't signed up for any weeks yet. Open slots shows where help is needed."
              : 'No teaching weeks match the current filter.'
        }
      />
    );

  return (
    <CoopScreenRoot>
      <FlatList
        testID={controller.status === 'ready' ? 'parent-coop-teaching-schedule-ready' : undefined}
        data={controller.status === 'error' ? [] : filteredWeeks}
        keyExtractor={(week) => week.id}
        contentContainerStyle={coopContentStyle}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        initialNumToRender={6}
        windowSize={7}
        renderItem={({ item, index }) => (
          <TeachingWeekCard
            week={item}
            index={index}
            isPast={isTeachingWeekPast(item)}
            isNext={item.id === nextWeek?.id}
            currentFamilyId={currentFamilyId}
            familyNameMap={controller.familyNameMap}
            pendingKey={controller.pendingKey}
            onToggleRole={onToggleRole}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={() => void onPullRefresh()}
            tintColor={accent.clay}
          />
        }
      />
    </CoopScreenRoot>
  );
}

const styles = StyleSheet.create({
  headerStack: { gap: 16 },
  bannerLink: { alignSelf: 'flex-start', marginTop: 6, minHeight: 28 },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
  },
  listTitle: {
    flex: 1,
    fontFamily: GardenFonts.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.6,
    color: Garden.ink,
  },
});
