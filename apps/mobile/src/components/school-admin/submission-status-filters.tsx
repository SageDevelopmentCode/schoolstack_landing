import { ScrollView, StyleSheet } from 'react-native';

import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import { Spacing } from '@/constants/theme';

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
  const allCount = Object.entries(counts).reduce((total, [status, value]) => {
    if (status === 'withdrawn') return total;
    return total + value;
  }, 0);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {FILTER_OPTIONS.map((option) => {
        const count =
          option.id === 'all' ? allCount : counts[option.id] ?? 0;

        return (
          <AdmissionsFilterPill
            key={option.id}
            active={activeStatus === option.id}
            label={option.label}
            count={count}
            onPress={() => onChange(option.id)}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
});
