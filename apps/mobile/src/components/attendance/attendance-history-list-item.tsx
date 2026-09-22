import { StyleSheet, Text, View } from 'react-native';

import { StudentPhoto } from '@/components/school-admin/student-photo';
import { StoryChip } from '@/components/story/story-chip';
import {
  attendanceStatusLabel,
  attendanceStatusTone,
} from '@/lib/attendance/attendance-actions';
import type { AttendanceHistoryEntry } from '@/lib/attendance/attendance-types';
import {
  buildAttendanceHistorySummary,
  resolveAttendanceHistoryActor,
} from '@/lib/attendance/attendance-history-display';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type AttendanceHistoryListItemProps = {
  entry: AttendanceHistoryEntry;
  highlightDate?: string | null;
};

export function AttendanceHistoryListItem({
  entry,
  highlightDate,
}: AttendanceHistoryListItemProps) {
  const theme = useParentTheme();
  const actor = resolveAttendanceHistoryActor(entry);
  const summary = buildAttendanceHistorySummary(entry);
  const isHighlighted = highlightDate != null && entry.date === highlightDate;

  return (
    <View
      style={[
        styles.row,
        {
          borderTopColor: Story.line,
          backgroundColor: isHighlighted ? theme.successBg : undefined,
          borderLeftColor: isHighlighted ? theme.primary : 'transparent',
        },
      ]}>
      <StudentPhoto name={actor.name} photoUrl={actor.photoUrl} size="sm" />
      <View style={styles.copy}>
        <Text style={[styles.primary, { color: theme.ink }]} numberOfLines={1}>
          {summary.primary}
        </Text>
        <Text style={[styles.secondary, { color: theme.muted }]} numberOfLines={1}>
          {summary.secondary}
        </Text>
      </View>
      <StoryChip
        tone={attendanceStatusTone(entry.status)}
        label={attendanceStatusLabel(entry.status)}
        uppercase={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
    paddingLeft: Spacing.one,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  primary: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  secondary: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
    lineHeight: 16,
  },
});
