import { ScrollView, StyleSheet } from 'react-native';

import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import { organizationStatusLabel } from '@/lib/admissions/application-status-ui';
import type { OrganizationStatus } from '@/lib/organizations';
import { Spacing } from '@/constants/theme';

const STATUSES: OrganizationStatus[] = ['onboarding', 'live', 'paused', 'churned'];

type OrganizationStatusFiltersProps = {
  activeStatus: OrganizationStatus | '';
  counts: Partial<Record<OrganizationStatus, number>>;
  onChange: (status: OrganizationStatus | '') => void;
};

export function OrganizationStatusFilters({
  activeStatus,
  counts,
  onChange,
}: OrganizationStatusFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {STATUSES.map((status) => (
        <AdmissionsFilterPill
          key={status}
          active={activeStatus === status}
          label={organizationStatusLabel(status)}
          count={counts[status]}
          onPress={() => onChange(activeStatus === status ? '' : status)}
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
