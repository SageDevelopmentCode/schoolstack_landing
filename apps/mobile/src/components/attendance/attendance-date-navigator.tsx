import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDashboardAttendanceSubcopy } from '@/lib/attendance/attendance-actions';
import {
  formatAttendanceDateLabel,
  isToday,
  shiftDate,
} from '@/lib/attendance/attendance-date-utils';
import type { AttendanceRosterSummary } from '@/lib/attendance/attendance-types';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type AttendanceDateNavigatorProps = {
  activeDate: Date;
  summary: AttendanceRosterSummary | null;
  loading?: boolean;
  onDateChange: (date: Date) => void;
};

export function AttendanceDateNavigator({
  activeDate,
  summary,
  loading = false,
  onDateChange,
}: AttendanceDateNavigatorProps) {
  const theme = useParentTheme();
  const viewingToday = isToday(activeDate);
  const subcopy = summary
    ? formatDashboardAttendanceSubcopy(summary)
    : 'Loading roster summary…';

  return (
    <View style={[styles.container, { borderColor: Story.line, backgroundColor: Story.white }]}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous day"
          disabled={loading}
          onPress={() => onDateChange(shiftDate(activeDate, -1))}
          style={({ pressed }) => [styles.chevron, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={18} color={theme.muted} />
        </Pressable>

        <View style={styles.center}>
          <Text style={[styles.label, { color: theme.ink }]}>{formatAttendanceDateLabel(activeDate)}</Text>
          <Text style={[styles.subcopy, { color: theme.muted }]}>{subcopy}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next day"
          disabled={loading}
          onPress={() => onDateChange(shiftDate(activeDate, 1))}
          style={({ pressed }) => [styles.chevron, pressed && styles.pressed]}>
          <Ionicons name="chevron-forward" size={18} color={theme.muted} />
        </Pressable>
      </View>

      {!viewingToday ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onDateChange(new Date())}
          style={styles.jumpToday}>
          <Text style={[styles.jumpTodayText, { color: theme.primary }]}>Jump to today</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: StoryCardPadding,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  chevron: {
    padding: Spacing.one,
    borderRadius: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  subcopy: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  jumpToday: {
    alignSelf: 'center',
    paddingVertical: 2,
  },
  jumpTodayText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
