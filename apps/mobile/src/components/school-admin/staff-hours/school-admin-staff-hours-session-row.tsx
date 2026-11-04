import { StyleSheet, Text, View } from 'react-native';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { formatHoursMinutes } from '@/lib/teacher/my-hours/format-duration';
import type { AdminStaffHoursSessionRow } from '@/lib/school-admin/staff-hours/staff-hours-types';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

const TABLE_LINE = '#EDF1ED';

type SchoolAdminStaffHoursSessionRowProps = {
  session: AdminStaffHoursSessionRow;
  showStaffName?: boolean;
  isFirst?: boolean;
};

export function SchoolAdminStaffHoursSessionRow({
  session,
  showStaffName = false,
  isFirst = false,
}: SchoolAdminStaffHoursSessionRowProps) {
  const theme = useParentTheme();

  return (
    <View
      style={[
        styles.row,
        !isFirst && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: TABLE_LINE },
      ]}>
      {showStaffName ? (
        <Text style={[styles.staffName, { color: theme.ink }]} numberOfLines={1}>
          {session.staffName}
        </Text>
      ) : null}
      <View style={styles.columns}>
        <View style={styles.cell}>
          <Text style={[styles.header, { color: theme.muted }]}>IN</Text>
          <Text style={[styles.value, { color: theme.ink }]}>{session.clockInLabel}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={[styles.header, { color: theme.muted }]}>OUT</Text>
          <Text style={[styles.value, { color: theme.ink }]}>{session.clockOutLabel}</Text>
        </View>
        <View style={[styles.cell, styles.durationCell]}>
          <Text style={[styles.header, { color: theme.muted }]}>DURATION</Text>
          <Text style={[styles.duration, { color: theme.ink }]}>
            {formatHoursMinutes(session.minutes)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  staffName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  columns: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  cell: {
    flex: 1,
    gap: 4,
  },
  durationCell: {
    alignItems: 'flex-end',
  },
  header: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  duration: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
