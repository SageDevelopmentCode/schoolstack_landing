import { ScrollView, StyleSheet } from 'react-native';

import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import type { StudentRosterFilter } from '@/lib/school-admin/admin-student-roster-metrics';
import { Spacing } from '@/constants/theme';

type StudentsRosterFiltersProps = {
  activeFilter: StudentRosterFilter;
  totalCount: number;
  unassignedCount: number;
  programOptions: [string, string][];
  programCounts: Record<string, number>;
  onChange: (filter: StudentRosterFilter) => void;
};

export function StudentsRosterFilters({
  activeFilter,
  totalCount,
  unassignedCount,
  programOptions,
  programCounts,
  onChange,
}: StudentsRosterFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      <AdmissionsFilterPill
        active={activeFilter === 'all'}
        label="All"
        count={totalCount}
        onPress={() => onChange('all')}
      />
      <AdmissionsFilterPill
        active={activeFilter === 'unassigned'}
        label="Unassigned"
        count={unassignedCount}
        onPress={() => onChange('unassigned')}
      />
      {programOptions.map(([programName]) => (
        <AdmissionsFilterPill
          key={programName}
          active={activeFilter === programName}
          label={programName}
          count={programCounts[programName] ?? 0}
          onPress={() => onChange(programName)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
});
