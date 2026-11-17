import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Garden, GardenFonts, PORTAL_EASE } from '@/components/parent/garden/tokens';
import { GCard, GKicker, GLink, GOutlineButton, GSkeleton, GToyButton } from '@/components/parent/garden/ui';
import { AdminLiveDot } from '@/components/school-admin/garden/admin-ui';
import type { TeacherTimeClock } from '@/components/teacher/home/garden/use-teacher-time-clock';
import {
  formatHoursMinutes,
  formatLiveElapsed,
  formatWallClockTime,
} from '@/lib/teacher/my-hours/format-duration';
import { useLiveElapsed } from '@/lib/teacher/my-hours/use-live-elapsed';

/**
 * Week progress on the dark card: a translucent track so an empty week reads as
 * empty (a white `GProgress` track looked full at 0h), butter fill, mint when the goal is met.
 */
function WeekBar({ value, label }: { value: number; label: string }) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, value));
  const width = useSharedValue(reduceMotion ? clamped * 100 : 0);
  useEffect(() => {
    width.value = reduceMotion
      ? clamped * 100
      : withDelay(200, withTiming(clamped * 100, { duration: 800, easing: PORTAL_EASE }));
  }, [clamped, reduceMotion, width]);
  const fill = useAnimatedStyle(() => ({ width: `${width.value}%` }));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={styles.track}>
      <Animated.View
        style={[styles.fill, { backgroundColor: clamped >= 1 ? Garden.mint : Garden.butter }, fill]}
      />
    </View>
  );
}

/** White-on-dark status pill (a neutral `GChip` is dark-on-dark here). */
function StatusPill({ clockedIn, testID }: { clockedIn: boolean; testID: string }) {
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={clockedIn ? 'Clocked in' : 'Not clocked in'}
      style={[styles.pill, clockedIn && styles.pillOn]}>
      {clockedIn ? <AdminLiveDot color={Garden.forest} /> : null}
      <Text style={[styles.pillText, clockedIn && styles.pillTextOn]}>
        {clockedIn ? 'Clocked in' : 'Not clocked in'}
      </Text>
    </View>
  );
}

export type TimeClockCardModel = Pick<
  TeacherTimeClock,
  | 'loading'
  | 'loadFailed'
  | 'retryLoad'
  | 'week'
  | 'weekProgress'
  | 'clockedIn'
  | 'activeSessionStartedAt'
  | 'clockActionPending'
  | 'clockIn'
  | 'clockOut'
>;

export type TimeClockCardTestIDs = {
  card: string;
  status: string;
  timer?: string;
  button: string;
};

const HOME_TEST_IDS: TimeClockCardTestIDs = {
  card: 'teacher-home-my-hours-quick-card',
  status: 'teacher-home-my-hours-status',
  button: 'teacher-home-clock-button',
};

/**
 * The teacher's time clock: the screen's one dark card and the Overview's one
 * toy button. Live timer while on the clock, this week's hours against the goal.
 * Home links to My Hours; My Hours passes its own testIDs and a today line.
 */
export function TimeClockCard({
  clock,
  onOpenMyHours,
  index = 0,
  title = 'My hours',
  today,
  offCopy = 'Clock in when your day starts. Your hours save to My Hours.',
  testIDs = HOME_TEST_IDS,
}: {
  clock: TimeClockCardModel;
  onOpenMyHours?: () => void;
  index?: number;
  title?: string;
  /**
   * My Hours: today's closed minutes and sessions. The card adds the live
   * session so "Today: 3h 12m · 2 sessions" ticks with the timer.
   */
  today?: { closedMinutes: number; closedSessions: number; activeCountsToday: boolean } | null;
  offCopy?: string;
  testIDs?: TimeClockCardTestIDs;
}) {
  const {
    loading,
    loadFailed,
    retryLoad,
    week,
    weekProgress,
    clockedIn,
    activeSessionStartedAt,
    clockActionPending,
    clockIn,
    clockOut,
  } = clock;
  // Ticks every second here only, so the rest of Home doesn't re-render with the timer.
  const elapsedSeconds = useLiveElapsed(activeSessionStartedAt);

  const todayLine = today
    ? (() => {
        const live = today.activeCountsToday ? Math.floor(elapsedSeconds / 60) : 0;
        const sessions = today.closedSessions + (today.activeCountsToday ? 1 : 0);
        if (sessions === 0) return 'Today: nothing logged yet';
        return `Today: ${formatHoursMinutes(today.closedMinutes + live)} · ${sessions} ${sessions === 1 ? 'session' : 'sessions'}`;
      })()
    : null;

  const buttonLabel =
    clockActionPending === 'in'
      ? 'Clocking in…'
      : clockActionPending === 'out'
        ? 'Clocking out…'
        : clockedIn
          ? 'Clock out'
          : 'Clock in';

  return (
    <GCard
      tone="dark"
      index={index}
      title={title}
      testID={testIDs.card}
      action={loading || loadFailed ? null : <StatusPill clockedIn={clockedIn} testID={testIDs.status} />}>
      {loading ? (
        <View style={styles.skeleton} accessibilityLabel="Loading your hours">
          <GSkeleton style={styles.skTimer} />
          <GSkeleton style={styles.skBar} />
          <GSkeleton style={styles.skButton} />
        </View>
      ) : loadFailed ? (
        <View style={styles.body}>
          <Text style={styles.copy}>{"We couldn't load your hours right now."}</Text>
          <GOutlineButton label="Try again" icon="refresh" onDark onPress={() => void retryLoad()} />
        </View>
      ) : (
        <View style={styles.body}>
          {clockedIn && activeSessionStartedAt ? (
            <View style={styles.session}>
              <Text
                testID={testIDs.timer}
                style={styles.timer}
                accessibilityLabel={`On the clock for ${formatLiveElapsed(elapsedSeconds)}`}>
                {formatLiveElapsed(elapsedSeconds)}
              </Text>
              <Text style={styles.copy}>Started at {formatWallClockTime(activeSessionStartedAt)}</Text>
            </View>
          ) : (
            <View style={styles.session}>
              <Text style={styles.offTitle}>Off the clock</Text>
              <Text style={styles.copy}>{offCopy}</Text>
            </View>
          )}

          {todayLine ? (
            <Text style={styles.today} accessibilityLiveRegion="polite">
              {todayLine}
            </Text>
          ) : null}

          {week ? (
            <View style={styles.week}>
              <View style={styles.weekRow}>
                <GKicker light>This week</GKicker>
                <Text style={styles.weekTotal}>
                  {formatHoursMinutes(week.loggedMinutes)}
                  <Text style={styles.weekGoal}> of {formatHoursMinutes(week.goalMinutes)}</Text>
                </Text>
              </View>
              <WeekBar
                value={weekProgress}
                label={`This week: ${formatHoursMinutes(week.loggedMinutes)} of ${formatHoursMinutes(week.goalMinutes)}`}
              />
            </View>
          ) : null}

          <View style={styles.actions}>
            <GToyButton
              testID={testIDs.button}
              variant="white"
              size="md"
              label={buttonLabel}
              icon={clockedIn ? 'log-out-outline' : 'log-in-outline'}
              loading={clockActionPending != null}
              onPress={() => void (clockedIn ? clockOut() : clockIn())}
            />
            {onOpenMyHours ? <GLink label="View all hours" light onPress={onOpenMyHours} /> : null}
          </View>
        </View>
      )}
    </GCard>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  pillOn: { backgroundColor: Garden.mint },
  pillText: { fontFamily: GardenFonts.bodyExtra, fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  pillTextOn: { color: Garden.forestDeep },
  body: { gap: 16 },
  session: { gap: 2 },
  timer: {
    fontFamily: GardenFonts.display,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1,
    color: Garden.white,
    fontVariant: ['tabular-nums'],
  },
  offTitle: {
    fontFamily: GardenFonts.display,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.6,
    color: Garden.white,
  },
  copy: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.85)' },
  today: {
    alignSelf: 'flex-start',
    fontFamily: GardenFonts.bodyBold,
    fontSize: 13,
    color: Garden.white,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
    fontVariant: ['tabular-nums'],
  },
  week: { gap: 8 },
  weekRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  weekTotal: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    color: Garden.white,
    fontVariant: ['tabular-nums'],
  },
  weekGoal: { fontFamily: GardenFonts.bodySemi, fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 999 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  skeleton: { gap: 12 },
  skTimer: { width: '60%', height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)' },
  skBar: { height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.18)' },
  skButton: { width: 150, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.18)' },
});
