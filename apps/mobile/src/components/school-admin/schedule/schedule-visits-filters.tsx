import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { ScheduledVisitTiming } from '@/lib/admissions/admissions-availability';
import type { PostSubmitActionType } from '@/lib/admissions/post-submit-templates';

export type TimingFilter = 'all' | ScheduledVisitTiming;
export type VisitTypeFilter = 'all' | PostSubmitActionType;

type ScheduleVisitsFiltersProps = {
  activeTiming: TimingFilter;
  activeType: VisitTypeFilter;
  timingCounts: Partial<Record<TimingFilter, number>>;
  typeCounts: Partial<Record<VisitTypeFilter, number>>;
  onChangeTiming: (value: TimingFilter) => void;
  onChangeType: (value: VisitTypeFilter) => void;
};

const TIMING_FILTERS: Array<{ value: TimingFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'happening', label: 'Happening' },
  { value: 'past', label: 'Past' },
];

const TYPE_FILTERS: Array<{ value: VisitTypeFilter; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'schedule_campus_tour', label: 'Tours' },
  { value: 'schedule_family_interview', label: 'Interviews' },
  { value: 'schedule_observation_day', label: 'Shadow' },
];

function FilterChip({
  active,
  label,
  count,
  onPress,
}: {
  active: boolean;
  label: string;
  count?: number;
  onPress: () => void;
}) {
  const theme = useAdminTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.accentLight : theme.surface,
          borderColor: active ? theme.accent : theme.border,
        },
      ]}>
      <ThemedText type="small" style={{ color: active ? theme.accent : theme.textSecondary }}>
        {label}
        {count != null ? ` (${count})` : ''}
      </ThemedText>
    </Pressable>
  );
}

export function ScheduleVisitsFilters({
  activeTiming,
  activeType,
  timingCounts,
  typeCounts,
  onChangeTiming,
  onChangeType,
}: ScheduleVisitsFiltersProps) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TIMING_FILTERS.map((filter) => (
          <FilterChip
            key={filter.value}
            active={activeTiming === filter.value}
            label={filter.label}
            count={timingCounts[filter.value]}
            onPress={() => onChangeTiming(filter.value)}
          />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {TYPE_FILTERS.map((filter) => (
          <FilterChip
            key={filter.value}
            active={activeType === filter.value}
            label={filter.label}
            count={typeCounts[filter.value]}
            onPress={() => onChangeType(filter.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    gap: Spacing.two,
    paddingRight: Spacing.two,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
});
