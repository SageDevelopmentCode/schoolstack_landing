import { StyleSheet, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { formatHoursMinutes } from '@/lib/teacher/my-hours/format-duration';
import type { MyHoursSidebarSummary } from '@/lib/teacher/my-hours/types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type TeacherMyHoursSummaryCardsProps = {
  summary: MyHoursSidebarSummary;
  clockedIn: boolean;
  todayLiveMinutes: number | null;
};

export function TeacherMyHoursSummaryCards({
  summary,
  clockedIn,
  todayLiveMinutes,
}: TeacherMyHoursSummaryCardsProps) {
  const theme = useParentTheme();
  const weekProgress = summary.week.goalMinutes
    ? Math.min(100, (summary.week.loggedMinutes / summary.week.goalMinutes) * 100)
    : 0;
  const remainingMinutes = Math.max(0, summary.week.goalMinutes - summary.week.loggedMinutes);

  const todayDisplay =
    todayLiveMinutes != null
      ? formatHoursMinutes(todayLiveMinutes)
      : summary.todayMinutes != null
        ? formatHoursMinutes(summary.todayMinutes)
        : '—';

  return (
    <View style={styles.container} testID="teacher-my-hours-summary">
      <StoryCard compact style={styles.weekCard}>
        <Text style={[styles.kicker, { color: theme.muted }]}>THIS WEEK</Text>
        <Text style={[styles.weekTotal, { color: theme.ink }]}>
          {formatHoursMinutes(summary.week.loggedMinutes)}
        </Text>
        <Text style={[styles.weekGoal, { color: theme.muted }]}>
          of {formatHoursMinutes(summary.week.goalMinutes)}
        </Text>
        <View style={[styles.progressTrack, { backgroundColor: '#E6ECE7' }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${weekProgress}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
        <View style={styles.weekMeta}>
          <Text style={[styles.metaText, { color: theme.muted }]}>
            {summary.week.loggedWeekdays}/{summary.week.totalWeekdays} days
          </Text>
          <Text style={[styles.metaText, { color: theme.muted }]}>
            {formatHoursMinutes(remainingMinutes)} to go
          </Text>
        </View>
      </StoryCard>

      <View style={styles.twoUp}>
        <StoryCard compact style={styles.halfCard}>
          <Text style={[styles.kicker, { color: theme.muted }]}>TODAY</Text>
          <Text style={[styles.statValue, { color: theme.ink }]}>{todayDisplay}</Text>
          <Text style={[styles.statMeta, { color: theme.muted }]}>
            {clockedIn
              ? 'Clocked in'
              : todayLiveMinutes != null || summary.todayMinutes != null
                ? 'Logged'
                : 'Not clocked in'}
          </Text>
        </StoryCard>
        <StoryCard compact style={styles.halfCard}>
          <Text style={[styles.kicker, { color: theme.muted }]}>MONTH</Text>
          <Text style={[styles.statValue, { color: theme.ink }]}>
            {formatHoursMinutes(summary.monthLoggedMinutes)}
          </Text>
          <Text style={[styles.statMeta, { color: theme.muted }]}>
            {summary.monthLoggedDays} {summary.monthLoggedDays === 1 ? 'day' : 'days'} logged
          </Text>
        </StoryCard>
      </View>

      {summary.recent.length > 0 ? (
        <StoryCard compact style={styles.recentCard}>
          <Text style={[styles.kicker, { color: theme.muted }]}>RECENT</Text>
          {summary.recent.map((entry) => (
            <View key={entry.label} style={styles.recentRow}>
              <View style={styles.recentCopy}>
                <Text style={[styles.recentLabel, { color: theme.ink }]}>{entry.label}</Text>
                <Text style={[styles.recentMeta, { color: theme.muted }]}>
                  {entry.sessionCount} {entry.sessionCount === 1 ? 'session' : 'sessions'}
                </Text>
              </View>
              <Text style={[styles.recentTotal, { color: theme.ink }]}>
                {formatHoursMinutes(entry.totalMinutes)}
              </Text>
            </View>
          ))}
        </StoryCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  weekCard: {
    gap: Spacing.two,
  },
  kicker: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  weekTotal: {
    fontFamily: StoryFonts.display,
    fontSize: 28,
    fontWeight: '600',
  },
  weekGoal: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: Spacing.one,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  weekMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  metaText: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  twoUp: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  halfCard: {
    flex: 1,
    gap: Spacing.one,
  },
  statValue: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 20,
    fontWeight: '600',
  },
  statMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  recentCard: {
    gap: Spacing.three,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  recentCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  recentLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  recentMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  recentTotal: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
});
