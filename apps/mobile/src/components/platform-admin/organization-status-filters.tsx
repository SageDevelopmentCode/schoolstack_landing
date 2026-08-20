import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import type { OrganizationStatus } from '@/lib/organizations';
import {
  organizationStatusBadgeStyle,
  organizationStatusLabel,
} from '@/lib/admissions/application-status-ui';
import { Radius, Spacing } from '@/constants/theme';

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
  const theme = useAdminTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {STATUSES.map((status) => {
        const active = activeStatus === status;
        const colors = organizationStatusBadgeStyle(status, theme);

        return (
          <Pressable
            key={status}
            accessibilityRole="button"
            onPress={() => onChange(active ? '' : status)}
            style={[
              styles.chip,
              active
                ? { backgroundColor: colors.backgroundColor, borderColor: colors.color }
                : { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <ThemedText
              type="smallBold"
              style={{ color: active ? colors.color : theme.textSecondary }}>
              {organizationStatusLabel(status)}
              {counts[status] ? ` (${counts[status]})` : ''}
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
    paddingVertical: Spacing.two,
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
