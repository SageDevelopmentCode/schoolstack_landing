import { ScrollView, StyleSheet } from 'react-native';

import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import type { StaffRosterFilter } from '@/lib/school-admin/admin-staff-roster-metrics';
import { Spacing } from '@/constants/theme';

type StaffRosterFiltersProps = {
  activeFilter: StaffRosterFilter;
  totalCount: number;
  teacherCount: number;
  portalActiveCount: number;
  needsReviewCount: number;
  onChange: (filter: StaffRosterFilter) => void;
};

export function StaffRosterFilters({
  activeFilter,
  totalCount,
  teacherCount,
  portalActiveCount,
  needsReviewCount,
  onChange,
}: StaffRosterFiltersProps) {
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
        active={activeFilter === 'teachers'}
        label="Teachers"
        count={teacherCount}
        onPress={() => onChange('teachers')}
      />
      <AdmissionsFilterPill
        active={activeFilter === 'portal_active'}
        label="Portal active"
        count={portalActiveCount}
        onPress={() => onChange('portal_active')}
      />
      <AdmissionsFilterPill
        active={activeFilter === 'review'}
        label="Review"
        count={needsReviewCount}
        onPress={() => onChange('review')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
});
