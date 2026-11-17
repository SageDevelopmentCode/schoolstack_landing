import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, type ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GCelebrate } from '@/components/parent/garden/celebrate';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts, PORTAL_EASE } from '@/components/parent/garden/tokens';
import { GCard, GErrorCard, GIcon, GLink } from '@/components/parent/garden/ui';
import { TimeClockCard } from '@/components/teacher/home/garden/sections/time-clock-card';
import { myHoursStatusLine } from '@/components/teacher/my-hours/garden/my-hours-status';
import { AdjustGuideCard, AdjustViewCard } from '@/components/teacher/my-hours/garden/sections/adjust-view-card';
import { DayViewCard } from '@/components/teacher/my-hours/garden/sections/day-view-card';
import { MonthViewCard } from '@/components/teacher/my-hours/garden/sections/month-view-card';
import { MyHoursHeader } from '@/components/teacher/my-hours/garden/sections/my-hours-header';
import { MyHoursSkeleton } from '@/components/teacher/my-hours/garden/sections/my-hours-skeleton';
import { TotalsCard } from '@/components/teacher/my-hours/garden/sections/totals-card';
import { ViewSwitcher } from '@/components/teacher/my-hours/garden/sections/view-switcher';
import { WeekViewCard } from '@/components/teacher/my-hours/garden/sections/week-view-card';
import { AdjustHoursSheet } from '@/components/teacher/my-hours/garden/sheets/adjust-hours-sheet';
import { useAdjustEditor } from '@/components/teacher/my-hours/garden/use-adjust-editor';
import { useTeacherMyHoursController } from '@/components/teacher/my-hours/garden/use-teacher-my-hours-controller';
import { useTeacherMyHoursFeedback } from '@/components/teacher/my-hours/garden/use-teacher-my-hours-feedback';
import {
  formatShortWeekdayDate,
  formatWallClockTime,
  startOfWeekMonday,
  toDateKey,
} from '@/lib/teacher/my-hours/format-duration';

const TIMER_TEST_IDS = {
  card: 'teacher-my-hours-clock-card',
  status: 'teacher-my-hours-clock-status',
  timer: 'teacher-my-hours-live-timer',
  button: 'teacher-my-hours-clock-action',
};

/**
 * Teacher › More › My Hours (Garden). The dark time clock is the screen's one
 * hero and one toy button; below it Day / Week / Month / Adjust views, your
 * totals, and a sheet for adding or fixing a day.
 */
export function TeacherMyHoursGardenScreen({ organizationId, slug }: { organizationId: string; slug: string }) {
  const controller = useTeacherMyHoursController({ organizationId, slug });
  const feedback = useTeacherMyHoursFeedback({ organizationId, slug, controller });
  const editor = useAdjustEditor({
    controller,
    readOnly: feedback.readOnly,
    onSaved: feedback.onAdjustSaved,
  });
  const scrollRef = useRef<ScrollView>(null);
  const switcherY = useRef(0);
  const { setView } = feedback;
  /** Totals tiles sit below the views: switch, then bring the switcher into view. */
  const showView = useCallback(
    (next: Parameters<typeof setView>[0]) => {
      setView(next);
      scrollRef.current?.scrollTo({ y: Math.max(0, switcherY.current - 12), animated: true });
    },
    [setView],
  );

  if (controller.status === 'disabled') {
    return (
      <Shell>
        <MyHoursHeader onBack={controller.onBack} subtitle={null} />
        <GCard title="My Hours is not enabled">
          <View style={styles.disabled}>
            <GIcon name="time-outline" bg={Garden.lav} />
            <Text style={styles.disabledCopy}>
              Your school has not turned on My Hours for teachers in the mobile app.
            </Text>
          </View>
        </GCard>
      </Shell>
    );
  }

  if (controller.status === 'loading') {
    return (
      <Shell>
        <MyHoursHeader onBack={controller.onBack} subtitle={null} />
        <MyHoursSkeleton />
      </Shell>
    );
  }

  if (controller.status === 'error' || !controller.pageData) {
    return (
      <Shell>
        <MyHoursHeader onBack={controller.onBack} subtitle={null} />
        <GErrorCard
          title="We couldn't load My Hours"
          message={controller.error ?? 'Failed to load My Hours.'}
          onRetry={() => void controller.retry()}
        />
      </Shell>
    );
  }

  const pageData = controller.pageData;
  const { view, focusDate, referenceDate } = controller;
  const week = pageData.sidebar.week;
  const dailyGoalMinutes = week.totalWeekdays > 0 ? week.goalMinutes / week.totalWeekdays : 0;
  const focusKey = controller.focusDateKey;
  const canAdjustFocusDay =
    focusKey <= toDateKey(referenceDate) && pageData.activeSession?.workDate !== focusKey;
  const navLabel =
    view === 'week' || view === 'adjust'
      ? `Week of ${formatShortWeekdayDate(startOfWeekMonday(focusDate))}`
      : controller.navLabel;

  return (
    <View style={styles.root} testID="teacher-my-hours-page">
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={feedback.pullRefreshing}
            onRefresh={() => void feedback.onPullRefresh()}
            tintColor={Garden.soft}
          />
        }>
        <MyHoursHeader
          onBack={controller.onBack}
          subtitle={myHoursStatusLine({
            clockedInLabel: controller.activeSessionStartedAt
              ? formatWallClockTime(controller.activeSessionStartedAt)
              : null,
            week,
          })}
        />

        {controller.error ? (
          <GInlineBanner
            tone="error"
            title="Couldn't refresh My Hours"
            description={`${controller.error} You're seeing the last hours we loaded.`}
            action={<GLink label="Try again" icon="refresh" onPress={() => void feedback.onPullRefresh()} />}
          />
        ) : null}

        <TimeClockCard
          clock={feedback.clock}
          index={0}
          title="Time clock"
          offCopy="Clock in when your day starts. Each session saves here when you clock out."
          today={controller.today}
          testIDs={TIMER_TEST_IDS}
        />

        <View onLayout={(event) => (switcherY.current = event.nativeEvent.layout.y)}>
        <ViewSwitcher
          view={view}
          onViewChange={feedback.setView}
          navLabel={navLabel}
          showingToday={controller.showingToday}
          onPrevious={controller.goPrevious}
          onNext={controller.goNext}
          onToday={feedback.goToToday}
        />
        </View>

        <Animated.View key={view} entering={FadeIn.duration(220).easing(PORTAL_EASE)} style={styles.view}>
          {view === 'day' ? (
            <DayViewCard
              focusDate={focusDate}
              referenceDate={referenceDate}
              dayLog={controller.dayLog}
              closedSessions={controller.closedSessionsForFocusDay}
              activeStartedAt={controller.activeOnFocusDay}
              activeCountsOnDay={controller.activeCountsOnFocusDay}
              canAdjust={canAdjustFocusDay}
              onAdjust={controller.startAdjustFor}
            />
          ) : null}

          {view === 'week' ? (
            <WeekViewCard
              entriesByDateKey={pageData.entriesByDateKey}
              focusDate={focusDate}
              referenceDate={referenceDate}
              dailyGoalMinutes={dailyGoalMinutes}
              onDaySelect={feedback.openDay}
            />
          ) : null}

          {view === 'month' ? (
            <MonthViewCard
              entriesByDateKey={pageData.entriesByDateKey}
              monthDate={controller.monthDate}
              referenceDate={referenceDate}
              onDaySelect={feedback.openDay}
            />
          ) : null}

          {view === 'adjust' ? (
            <>
              <AdjustGuideCard requireApproval={editor.requireApproval} />
              <AdjustViewCard
                pageData={pageData}
                focusDate={focusDate}
                referenceDate={referenceDate}
                weekLoading={controller.adjustWeekLoading}
                editor={editor}
              />
            </>
          ) : null}
        </Animated.View>

        {controller.today ? (
          <TotalsCard
            pageData={pageData}
            today={controller.today}
            activeStartedAt={controller.activeSessionStartedAt}
            onOpenToday={() => {
              controller.goToToday();
              showView('day');
            }}
            onOpenWeek={() => showView('week')}
            onOpenMonth={() => showView('month')}
          />
        ) : null}
      </ScrollView>

      <GCelebrate active={feedback.celebrate} celebrationKey={feedback.celebrationKey} />
      <AdjustHoursSheet editor={editor} />
    </View>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 14 },
  view: { gap: 14 },
  disabled: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  disabledCopy: { flex: 1, fontFamily: GardenFonts.bodySemi, fontSize: 14.5, lineHeight: 21, color: Garden.soft },
});
