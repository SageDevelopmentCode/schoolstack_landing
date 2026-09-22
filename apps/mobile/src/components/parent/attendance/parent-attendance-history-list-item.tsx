import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  attendanceStatusLabel,
  attendanceStatusTone,
} from '@/lib/attendance/attendance-actions';
import {
  formatAttendanceHistoryDateLabel,
  formatAttendanceHistoryTime,
} from '@/lib/attendance/attendance-history-display';
import type { AttendanceHistoryEntry } from '@/lib/attendance/attendance-types';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type ParentAttendanceHistoryListItemProps = {
  entry: AttendanceHistoryEntry;
  onPress: (entry: AttendanceHistoryEntry) => void;
};

function compactMetaLine(entry: AttendanceHistoryEntry): string {
  const time =
    entry.status === 'present'
      ? formatAttendanceHistoryTime(entry.presentAt)
      : entry.status === 'absent'
        ? formatAttendanceHistoryTime(entry.absentAt)
        : formatAttendanceHistoryTime(entry.pickedUpAt);

  const label = attendanceStatusLabel(entry.status);
  return time ? `${time} · ${label}` : label;
}

export function ParentAttendanceHistoryListItem({
  entry,
  onPress,
}: ParentAttendanceHistoryListItemProps) {
  const theme = useParentTheme();
  const dateLabel = formatAttendanceHistoryDateLabel(entry.date);
  const metaLine = compactMetaLine(entry);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View attendance for ${dateLabel}`}
      onPress={() => onPress(entry)}
      testID={`parent-attendance-history-item-${entry.date}`}
      style={({ pressed }) => [
        styles.row,
        {
          borderTopColor: Story.line,
          backgroundColor: pressed ? theme.primarySoft : 'transparent',
        },
      ]}>
      <View style={styles.copy}>
        <Text style={[styles.date, { color: theme.ink }]} numberOfLines={1}>
          {dateLabel}
        </Text>
        <Text style={[styles.meta, { color: theme.muted }]} numberOfLines={1}>
          {metaLine}
        </Text>
      </View>
      <View style={styles.trailing}>
        <StoryChip
          tone={attendanceStatusTone(entry.status)}
          label={attendanceStatusLabel(entry.status)}
          uppercase={false}
        />
        <Ionicons name="chevron-forward" size={14} color={theme.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  date: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    fontFamily: StoryFonts.body,
    fontSize: 10,
    lineHeight: 14,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
});
