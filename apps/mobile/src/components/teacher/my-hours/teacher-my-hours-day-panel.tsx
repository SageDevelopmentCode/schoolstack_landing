import { StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { TeacherMyHoursDateNav } from '@/components/teacher/my-hours/teacher-my-hours-date-nav';
import {
  MY_HOURS_CALENDAR_LINE,
  MY_HOURS_CARD_BODY_PADDING,
  MY_HOURS_LOGGED_BG,
} from '@/components/teacher/my-hours/teacher-my-hours-theme';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  formatHoursMinutes,
  formatLiveElapsed,
  formatWallClockTime,
  isSameDay,
} from '@/lib/teacher/my-hours/format-duration';
import type { ClockActionPending, MyHoursDayLog, MyHoursSession } from '@/lib/teacher/my-hours/types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type TeacherMyHoursDayPanelProps = {
  navLabel: string;
  onPreviousDate: () => void;
  onNextDate: () => void;
  focusDate: Date;
  referenceDate: Date;
  dayLog: MyHoursDayLog | null;
  closedSessions: MyHoursSession[];
  activeSessionStartedAt: Date | null;
  elapsedSeconds: number;
  clockActionPending: ClockActionPending;
  clockDisabled: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
};

function SessionRows({
  sessions,
  activeSessionStartedAt,
  elapsedSeconds,
}: {
  sessions: MyHoursSession[];
  activeSessionStartedAt: Date | null;
  elapsedSeconds: number;
}) {
  const theme = useParentTheme();
  const showActive = activeSessionStartedAt != null;

  if (sessions.length === 0 && !showActive) {
    return null;
  }

  return (
    <View style={[styles.sessionsTable, { borderColor: MY_HOURS_CALENDAR_LINE }]}>
      <View style={[styles.sessionHeaderRow, { borderColor: MY_HOURS_CALENDAR_LINE }]}>
        <Text style={[styles.sessionHeaderCell, { color: theme.muted }]}>IN</Text>
        <Text style={[styles.sessionHeaderCell, { color: theme.muted }]}>OUT</Text>
        <Text style={[styles.sessionHeaderCell, styles.sessionHeaderRight, { color: theme.muted }]}>
          DURATION
        </Text>
      </View>
      {sessions.map((session) => (
        <View
          key={session.id}
          style={[styles.sessionRow, { borderColor: MY_HOURS_CALENDAR_LINE }]}>
          <Text style={[styles.sessionCell, { color: theme.ink }]}>{session.clockIn}</Text>
          <Text style={[styles.sessionCell, { color: theme.ink }]}>{session.clockOut}</Text>
          <Text style={[styles.sessionCell, styles.sessionHeaderRight, styles.sessionDuration]}>
            {formatHoursMinutes(session.minutes)}
          </Text>
        </View>
      ))}
      {showActive && activeSessionStartedAt ? (
        <View style={[styles.sessionRow, { backgroundColor: MY_HOURS_LOGGED_BG }]}>
          <Text style={styles.sessionCell}>{formatWallClockTime(activeSessionStartedAt)}</Text>
          <Text style={[styles.sessionCell, { color: theme.muted }]}>In progress</Text>
          <Text
            style={[
              styles.sessionCell,
              styles.sessionHeaderRight,
              styles.sessionDuration,
              { color: theme.primary },
            ]}>
            {formatLiveElapsed(elapsedSeconds)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function TeacherMyHoursDayPanel({
  navLabel,
  onPreviousDate,
  onNextDate,
  focusDate,
  referenceDate,
  dayLog,
  closedSessions,
  activeSessionStartedAt,
  elapsedSeconds,
  clockActionPending,
  clockDisabled,
  onClockIn,
  onClockOut,
}: TeacherMyHoursDayPanelProps) {
  const theme = useParentTheme();
  const isToday = isSameDay(focusDate, referenceDate);
  const isClockedIn = activeSessionStartedAt != null;
  const showDayClockActions = isToday || isClockedIn;
  const isPending = clockActionPending != null;

  const todayTotalMinutes =
    closedSessions.reduce((sum, s) => sum + s.minutes, 0) +
    (isClockedIn ? Math.floor(elapsedSeconds / 60) : 0);
  const sessionCountToday = closedSessions.length + (isClockedIn ? 1 : 0);
  const showTodayLoggedSummary = isToday && (closedSessions.length > 0 || isClockedIn);

  return (
    <StoryCard compact style={styles.card} testID="teacher-my-hours-day-panel">
      <TeacherMyHoursDateNav
        label={navLabel}
        onPrevious={onPreviousDate}
        onNext={onNextDate}
        fullWidth
        embedded
        showTodayBadge={isToday}
      />
      <View style={styles.cardBody}>
      {dayLog && !isToday ? (
        <>
          <View style={[styles.loggedStrip, { backgroundColor: MY_HOURS_LOGGED_BG }]}>
            <Text style={[styles.loggedKicker, { color: theme.primary }]}>LOGGED</Text>
            <Text style={[styles.loggedValue, { color: theme.ink }]}>
              {formatHoursMinutes(dayLog.totalMinutes)} · {dayLog.sessionCount}{' '}
              {dayLog.sessionCount === 1 ? 'session' : 'sessions'}
            </Text>
          </View>
          <SessionRows
            sessions={closedSessions}
            activeSessionStartedAt={activeSessionStartedAt}
            elapsedSeconds={elapsedSeconds}
          />
        </>
      ) : null}

      {showDayClockActions ? (
        <>
          {isToday && showTodayLoggedSummary ? (
            <View style={[styles.loggedStrip, { backgroundColor: MY_HOURS_LOGGED_BG }]}>
              <Text style={[styles.loggedKicker, { color: theme.primary }]}>LOGGED</Text>
              <Text style={[styles.loggedValue, { color: theme.ink }]}>
                {formatHoursMinutes(todayTotalMinutes)} · {sessionCountToday}{' '}
                {sessionCountToday === 1 ? 'session' : 'sessions'}
              </Text>
            </View>
          ) : null}

          {isClockedIn && activeSessionStartedAt ? (
            <View style={styles.liveBlock}>
              <Text style={[styles.liveKicker, { color: theme.muted }]}>CURRENT SESSION</Text>
              <Text
                style={[styles.liveTimer, { color: theme.ink }]}
                testID="teacher-my-hours-live-timer">
                {formatLiveElapsed(elapsedSeconds)}
              </Text>
              <Text style={[styles.liveMeta, { color: theme.muted }]}>
                Started at {formatWallClockTime(activeSessionStartedAt)}
              </Text>
            </View>
          ) : null}

          {isToday || (isClockedIn && !dayLog) ? (
            <SessionRows
              sessions={closedSessions}
              activeSessionStartedAt={activeSessionStartedAt}
              elapsedSeconds={elapsedSeconds}
            />
          ) : null}

          <StoryButton
            label={
              isPending
                ? clockActionPending === 'in'
                  ? 'Clocking in…'
                  : 'Saving…'
                : isClockedIn
                  ? 'Clock out'
                  : 'Clock in'
            }
            variant="primary"
            fullWidth
            disabled={clockDisabled || isPending}
            onPress={isClockedIn ? onClockOut : onClockIn}
            testID="teacher-my-hours-clock-action"
          />
        </>
      ) : !dayLog ? (
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>
          No hours logged for this day.
        </Text>
      ) : null}
      </View>
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  cardBody: {
    padding: MY_HOURS_CARD_BODY_PADDING,
    gap: Spacing.four,
  },
  loggedStrip: {
    borderRadius: 10,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  loggedKicker: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loggedValue: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  liveBlock: {
    gap: Spacing.one,
  },
  liveKicker: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveTimer: {
    fontFamily: StoryFonts.display,
    fontSize: 40,
    fontWeight: '600',
  },
  liveMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  sessionsTable: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  sessionHeaderCell: {
    flex: 1,
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  sessionHeaderRight: {
    textAlign: 'right',
  },
  sessionRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  sessionCell: {
    flex: 1,
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  sessionDuration: {
    fontWeight: '600',
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    marginTop: Spacing.two,
  },
});
