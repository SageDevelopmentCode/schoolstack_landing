import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { AttendanceRosterStatus, AttendanceRosterSummary } from '@/lib/attendance/attendance-types';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

export type AttendanceStatusFilter = 'all' | AttendanceRosterStatus;

const FILTERS: { key: AttendanceStatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'present', label: 'Present' },
  { key: 'absent', label: 'Absent' },
  { key: 'not_marked', label: 'Not marked' },
  { key: 'picked_up', label: 'Picked up' },
];

type AttendanceStatusFiltersProps = {
  activeFilter: AttendanceStatusFilter;
  summary: AttendanceRosterSummary | null;
  onChange: (filter: AttendanceStatusFilter) => void;
};

function filterCount(
  key: AttendanceStatusFilter,
  summary: AttendanceRosterSummary | null,
): number | undefined {
  if (!summary) return undefined;
  switch (key) {
    case 'all':
      return summary.totalStudents;
    case 'present':
      return summary.presentCount;
    case 'absent':
      return summary.absentCount;
    case 'not_marked':
      return summary.notMarkedCount;
    case 'picked_up':
      return summary.pickedUpCount;
  }
}

export function AttendanceStatusFilters({
  activeFilter,
  summary,
  onChange,
}: AttendanceStatusFiltersProps) {
  const theme = useParentTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {FILTERS.map((filter) => {
        const active = activeFilter === filter.key;
        const count = filterCount(filter.key, summary);
        const label = count != null ? `${filter.label} · ${count}` : filter.label;

        return (
          <Pressable
            key={filter.key}
            accessibilityRole="button"
            onPress={() => onChange(filter.key)}
            style={[
              styles.pill,
              {
                backgroundColor: active ? theme.successBg : Story.white,
                borderColor: active ? '#BCD4C1' : Story.line,
              },
            ]}>
            <Text
              style={[
                styles.pillText,
                { color: active ? theme.primary : theme.muted, fontWeight: active ? '700' : '500' },
              ]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  pill: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pillText: {
    fontFamily: StoryFonts.body,
    fontSize: 11,
  },
});
