import { Pressable, StyleSheet, View } from 'react-native';

import { OrganizationLogo } from '@/components/organization-logo';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import {
  organizationStatusBadgeStyle,
  organizationStatusLabel,
} from '@/lib/admissions/application-status-ui';
import type { AdminOrganization } from '@/lib/organizations';
import { Spacing } from '@/constants/theme';

type OrganizationListItemProps = {
  organization: AdminOrganization;
  onPress: (organization: AdminOrganization) => void;
  showDivider?: boolean;
};

export function OrganizationListItem({
  organization,
  onPress,
  showDivider = true,
}: OrganizationListItemProps) {
  const theme = useAdminTheme();

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        onPress={() => onPress(organization)}
        style={({ pressed }) => [
          styles.row,
          pressed && { backgroundColor: theme.elevated },
        ]}>
        <OrganizationLogo
          logoSrc={organization.branding.logoSrc}
          logoAlt={organization.branding.logoAlt}
          name={organization.name}
        />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <ThemedText
              type="smallBold"
              style={[styles.name, { color: theme.textPrimary }]}
              numberOfLines={1}>
              {organization.name}
            </ThemedText>
            <StatusBadge
              label={organizationStatusLabel(organization.status)}
              colors={organizationStatusBadgeStyle(organization.status, theme)}
            />
          </View>
          <ThemedText type="code" style={{ color: theme.textTertiary }} numberOfLines={1}>
            {organization.slug}
          </ThemedText>
        </View>
      </Pressable>
      {showDivider ? (
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    flex: 1,
  },
});
