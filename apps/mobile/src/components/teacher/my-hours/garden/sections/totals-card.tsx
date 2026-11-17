import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GCard, GKicker, GPressable, GProgress } from '@/components/parent/garden/ui';
import { sessionCountLabel } from '@/components/teacher/my-hours/garden/adjust-validation';
import { weekToGoLabel } from '@/components/teacher/my-hours/garden/my-hours-status';
import { formatHoursMinutes } from '@/lib/teacher/my-hours/format-duration';
import type { TeacherMyHoursPageData } from '@/lib/teacher/my-hours/types';
import { useLiveElapsed } from '@/lib/teacher/my-hours/use-live-elapsed';

type Today = { closedMinutes: number; closedSessions: number; activeCountsToday: boolean };

function Tile({
  label,
  value,
  meta,
  tint,
  onPress,
  hint,
}: {
  label: string;
  value: string;
  meta: string;
  tint: string;
  onPress: () => void;
  hint: string;
}) {
  return (
    <GPressable
      accessibilityLabel={`${label}: ${value}. ${meta}`}
      accessibilityHint={hint}
      haptic="select"
      pressedScale={0.97}
      onPress={onPress}
      style={[styles.tile, { backgroundColor: tint }]}>
      <View style={styles.tileHead}>
        <GKicker>{label}</GKicker>
        <Ionicons name="arrow-forward" size={13} color={Garden.ink60} />
      </View>
      <Text style={styles.tileValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.tileMeta} numberOfLines={2}>
        {meta}
      </Text>
    </GPressable>
  );
}

/** Today's tile ticks only while a session is running today. */
function TodayTile({
  today,
  activeStartedAt,
  fallbackMinutes,
  onPress,
}: {
  today: Today;
  activeStartedAt: Date | null;
  fallbackMinutes: number | null;
  onPress: () => void;
}) {
  const elapsed = useLiveElapsed(today.activeCountsToday ? activeStartedAt : null);
  const live = today.activeCountsToday ? Math.floor(elapsed / 60) : 0;
  const total = today.closedMinutes + live;
  // Same fallback as the old summary: the server's figure when nothing is on the clock today.
  const minutes = total > 0 || activeStartedAt ? total : fallbackMinutes;
  return (
    <Tile
      label="Today"
      value={minutes == null ? '—' : formatHoursMinutes(minutes)}
      meta={activeStartedAt ? 'Clocked in' : minutes ? 'Logged' : 'Not clocked in'}
      tint={Garden.butter}
      onPress={onPress}
      hint="Shows today in the Day view"
    />
  );
}

/**
 * Totals: linked tiles (each opens its view), the week against the goal, and
 * recent weeks / periods from the server's summary.
 */
export function TotalsCard({
  pageData,
  today,
  activeStartedAt,
  onOpenToday,
  onOpenWeek,
  onOpenMonth,
  index,
}: {
  pageData: TeacherMyHoursPageData;
  today: Today;
  activeStartedAt: Date | null;
  onOpenToday: () => void;
  onOpenWeek: () => void;
  onOpenMonth: () => void;
  index?: number;
}) {
  const { week, monthLoggedMinutes, monthLoggedDays, recent, todayMinutes } = pageData.sidebar;
  const progress = week.goalMinutes > 0 ? Math.min(1, week.loggedMinutes / week.goalMinutes) : 0;
  const toGo = weekToGoLabel(week);

  return (
    <GCard index={index} title="Your totals" testID="teacher-my-hours-summary">
      <View style={styles.tiles}>
        <Tile
          label="Week"
          value={formatHoursMinutes(week.loggedMinutes)}
          meta={week.goalMinutes > 0 ? `of ${formatHoursMinutes(week.goalMinutes)}` : 'Logged'}
          tint={Garden.sky}
          onPress={onOpenWeek}
          hint="Opens the Week view"
        />
        <TodayTile
          today={today}
          activeStartedAt={activeStartedAt}
          fallbackMinutes={todayMinutes}
          onPress={onOpenToday}
        />
        <Tile
          label="Month"
          value={formatHoursMinutes(monthLoggedMinutes)}
          meta={`${monthLoggedDays} ${monthLoggedDays === 1 ? 'day' : 'days'} logged`}
          tint={Garden.lav}
          onPress={onOpenMonth}
          hint="Opens the Month view"
        />
      </View>

      {week.goalMinutes > 0 ? (
        <View style={styles.goal}>
          <GProgress
            value={progress}
            done={progress >= 1}
            label={`This week: ${formatHoursMinutes(week.loggedMinutes)} of ${formatHoursMinutes(week.goalMinutes)}`}
          />
          <View style={styles.goalRow}>
            <Text style={styles.goalMeta}>
              {week.loggedWeekdays}/{week.totalWeekdays} days
            </Text>
            {toGo ? <Text style={[styles.goalMeta, progress >= 1 && styles.goalDone]}>{toGo}</Text> : null}
          </View>
        </View>
      ) : null}

      {recent.length > 0 ? (
        <View style={styles.recent}>
          <GKicker>Recent</GKicker>
          <View style={styles.paper}>
            {recent.map((item, i) => (
              <View
                key={`${item.label}-${i}`}
                style={[styles.recentRow, i > 0 && styles.divider]}
                accessible
                accessibilityLabel={`${item.label}: ${formatHoursMinutes(item.totalMinutes)}, ${sessionCountLabel(item.sessionCount)}`}>
                <View style={styles.recentMain}>
                  <Text style={styles.recentLabel}>{item.label}</Text>
                  <Text style={styles.recentMeta}>{sessionCountLabel(item.sessionCount)}</Text>
                </View>
                <Text style={styles.recentTotal}>{formatHoursMinutes(item.totalMinutes)}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </GCard>
  );
}

const styles = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1,
    minWidth: 0,
    minHeight: 104,
    borderRadius: 16,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  tileHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileValue: { fontFamily: GardenFonts.display, fontSize: 21, letterSpacing: -0.4, color: Garden.ink, fontVariant: ['tabular-nums'] },
  tileMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 12, color: Garden.soft },
  goal: { gap: 8, marginTop: 14 },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalMeta: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft, fontVariant: ['tabular-nums'] },
  goalDone: { color: Garden.forest },
  recent: { gap: 8, marginTop: 16 },
  paper: { backgroundColor: Garden.notebook, borderRadius: 16, borderWidth: 1, borderColor: Garden.ink10 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink10 },
  recentMain: { flex: 1, minWidth: 0, gap: 2 },
  recentLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14.5, color: Garden.ink },
  recentMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft },
  recentTotal: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink, fontVariant: ['tabular-nums'] },
});
