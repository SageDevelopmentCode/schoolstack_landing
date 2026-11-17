import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GChip, GDashedRule, GLink, GOutlineButton } from '@/components/parent/garden/ui';
import { AdminLiveDot } from '@/components/school-admin/garden/admin-ui';
import { sessionCountLabel } from '@/components/teacher/my-hours/garden/adjust-validation';
import {
  formatHoursMinutes,
  formatLiveElapsed,
  formatLongWeekdayDate,
  formatWallClockTime,
  isSameDay,
  toDateKey,
} from '@/lib/teacher/my-hours/format-duration';
import type { MyHoursDayLog, MyHoursSession } from '@/lib/teacher/my-hours/types';
import { useLiveElapsed } from '@/lib/teacher/my-hours/use-live-elapsed';

/** Logged total chip; ticks only while a session counts toward this day. */
function DayTotalChip({
  closedMinutes,
  closedCount,
  liveStartedAt,
}: {
  closedMinutes: number;
  closedCount: number;
  liveStartedAt: Date | null;
}) {
  const elapsed = useLiveElapsed(liveStartedAt);
  const minutes = closedMinutes + (liveStartedAt ? Math.floor(elapsed / 60) : 0);
  const count = closedCount + (liveStartedAt ? 1 : 0);
  if (count === 0) return null;
  return <GChip tone="success" icon="time-outline" label={`${formatHoursMinutes(minutes)} · ${sessionCountLabel(count)}`} />;
}

function LiveElapsed({ startedAt }: { startedAt: Date }) {
  const elapsed = useLiveElapsed(startedAt);
  return (
    <Text style={styles.liveDuration} accessibilityLabel={`Running for ${formatLiveElapsed(elapsed)}`}>
      {formatLiveElapsed(elapsed)}
    </Text>
  );
}

/** One session as a paper ticket: In → Out, dashed perforation, duration. */
function SessionTicket({ session, index }: { session: MyHoursSession; index: number }) {
  return (
    <View
      style={styles.ticket}
      accessible
      accessibilityLabel={`Session ${index + 1}: ${session.clockIn} to ${session.clockOut}, ${formatHoursMinutes(session.minutes)}`}>
      <View style={styles.ticketTimes}>
        <Text style={styles.ticketKicker}>Session {index + 1}</Text>
        <View style={styles.ticketRange}>
          <Text style={styles.ticketTime}>{session.clockIn}</Text>
          <Ionicons name="arrow-forward" size={14} color={Garden.ink60} />
          <Text style={styles.ticketTime}>{session.clockOut}</Text>
        </View>
      </View>
      <GDashedRule vertical style={styles.perforation} />
      <Text style={styles.ticketDuration}>{formatHoursMinutes(session.minutes)}</Text>
    </View>
  );
}

/**
 * Day view: the day's logged total, each session as a ticket, the running
 * session (live), and a way to add or fix hours for that day.
 */
export function DayViewCard({
  focusDate,
  referenceDate,
  dayLog,
  closedSessions,
  activeStartedAt,
  activeCountsOnDay,
  canAdjust,
  onAdjust,
  index,
}: {
  focusDate: Date;
  referenceDate: Date;
  dayLog: MyHoursDayLog | null;
  closedSessions: MyHoursSession[];
  /** Running session shown on this day (today or its work date). */
  activeStartedAt: Date | null;
  activeCountsOnDay: boolean;
  /** Past or today, and no session still running on that day. */
  canAdjust: boolean;
  onAdjust: (dateKey: string) => void;
  index?: number;
}) {
  const accent = useGardenAccent();
  const isToday = isSameDay(focusDate, referenceDate);
  const isFuture = toDateKey(focusDate) > toDateKey(referenceDate);
  const dateKey = toDateKey(focusDate);
  const hasSessions = closedSessions.length > 0 || activeStartedAt != null;
  const closedMinutes = closedSessions.reduce((sum, s) => sum + s.minutes, 0);

  const totalChip =
    isToday || activeCountsOnDay ? (
      <DayTotalChip
        closedMinutes={closedMinutes}
        closedCount={closedSessions.length}
        liveStartedAt={activeCountsOnDay ? activeStartedAt : null}
      />
    ) : dayLog ? (
      <GChip
        tone="success"
        icon="time-outline"
        label={`${formatHoursMinutes(dayLog.totalMinutes)} · ${sessionCountLabel(dayLog.sessionCount)}`}
      />
    ) : null;

  return (
    <GCard
      index={index}
      title={isToday ? 'Today' : formatLongWeekdayDate(focusDate).replace(/, \d{4}$/, '')}
      action={totalChip}
      testID="teacher-my-hours-day-panel">
      {hasSessions ? (
        <View style={styles.list}>
          {closedSessions.map((session, i) => (
            <SessionTicket key={session.id} session={session} index={i} />
          ))}
          {activeStartedAt ? (
            <View
              style={[styles.ticket, styles.ticketLive, { borderColor: accent.clay, backgroundColor: accent.wash }]}
              accessible
              accessibilityLabel={`Session in progress, started at ${formatWallClockTime(activeStartedAt)}`}>
              <View style={styles.ticketTimes}>
                <View style={styles.liveRow}>
                  <AdminLiveDot color={Garden.forest} />
                  <Text style={styles.ticketKicker}>In progress</Text>
                </View>
                <View style={styles.ticketRange}>
                  <Text style={styles.ticketTime}>{formatWallClockTime(activeStartedAt)}</Text>
                  <Ionicons name="arrow-forward" size={14} color={Garden.ink60} />
                  <Text style={[styles.ticketTime, styles.muted]}>now</Text>
                </View>
              </View>
              <GDashedRule vertical style={styles.perforation} />
              <LiveElapsed startedAt={activeStartedAt} />
            </View>
          ) : null}
          {canAdjust && closedSessions.length > 0 ? (
            <GLink
              label="Fix this day"
              icon="pencil"
              onPress={() => onAdjust(dateKey)}
              accessibilityHint="Opens the hour editor for this day"
            />
          ) : null}
        </View>
      ) : dayLog ? (
        <View style={styles.empty}>
          <Text style={styles.emptyCopy}>
            {formatHoursMinutes(dayLog.totalMinutes)} logged across {sessionCountLabel(dayLog.sessionCount)}.
          </Text>
          {canAdjust ? <GOutlineButton label="Fix this day" icon="pencil" onPress={() => onAdjust(dateKey)} /> : null}
        </View>
      ) : isFuture ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-clear-outline" size={22} color={Garden.ink60} />
          <Text style={styles.emptyCopy}>Upcoming — nothing to log yet.</Text>
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="hourglass-outline" size={22} color={Garden.ink60} />
          <Text style={styles.emptyCopy}>No hours logged for this day.</Text>
          {isToday ? (
            <Text style={styles.emptyHint}>Clock in above when your day starts, or add hours by hand.</Text>
          ) : (
            <Text style={styles.emptyHint}>Forgot to clock in? Add the hours you worked.</Text>
          )}
          {canAdjust ? (
            <GOutlineButton
              label="Add hours for this day"
              icon="add"
              onPress={() => onAdjust(dateKey)}
              accessibilityHint="Opens the hour editor for this day"
            />
          ) : null}
        </View>
      )}
    </GCard>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Garden.paper,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
  },
  ticketLive: { borderWidth: 2 },
  ticketTimes: { flex: 1, minWidth: 0, gap: 2 },
  ticketKicker: { fontFamily: GardenFonts.bodyExtra, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: Garden.soft },
  ticketRange: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticketTime: { fontFamily: GardenFonts.bodyExtra, fontSize: 16, color: Garden.ink, fontVariant: ['tabular-nums'] },
  muted: { color: Garden.soft },
  perforation: { maxHeight: 44, overflow: 'hidden' },
  ticketDuration: {
    minWidth: 64,
    textAlign: 'right',
    fontFamily: GardenFonts.display,
    fontSize: 18,
    color: Garden.ink,
    fontVariant: ['tabular-nums'],
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDuration: {
    minWidth: 64,
    textAlign: 'right',
    fontFamily: GardenFonts.display,
    fontSize: 18,
    color: Garden.forest,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    alignItems: 'flex-start',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Garden.notebook,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  emptyCopy: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  emptyHint: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, lineHeight: 19, color: Garden.soft },
});
