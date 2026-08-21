import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

type SubmissionStatusFiltersProps = {
  activeStatus: string;
  counts: Record<string, number>;
  onChange: (status: string) => void;
};

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Applying' },
  { id: 'enrolling', label: 'Enrolling' },
  { id: 'enrolled', label: 'Enrolled' },
  { id: 'withdrawn', label: 'Withdrawn' },
] as const;

export function SubmissionStatusFilters({
  activeStatus,
  counts,
  onChange,
}: SubmissionStatusFiltersProps) {
  const theme = useAdminTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {FILTER_OPTIONS.map((option) => {
        const active = activeStatus === option.id;
        const count =
          option.id === 'all'
            ? Object.entries(counts).reduce((total, [status, value]) => {
                if (status === 'withdrawn') return total;
                return total + value;
              }, 0)
            : counts[option.id] ?? 0;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            onPress={() => onChange(option.id)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.accentLight : theme.surface,
                borderColor: active ? theme.accent : theme.border,
              },
            ]}>
            <ThemedText
              type="smallBold"
              style={{ color: active ? theme.accent : theme.textSecondary }}>
              {option.label}
              {count ? ` ${count}` : ''}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
