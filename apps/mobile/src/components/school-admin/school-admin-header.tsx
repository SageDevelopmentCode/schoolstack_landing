import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { OrganizationLogo } from '@/components/organization-logo';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import type { LiveOrganization } from '@/lib/organizations';
import { Spacing } from '@/constants/theme';

type SchoolAdminHeaderProps = {
  organization: LiveOrganization;
  showBackToOrganizations: boolean;
  onBackToOrganizations?: () => void;
};

export function SchoolAdminHeader({
  organization,
  showBackToOrganizations,
  onBackToOrganizations,
}: SchoolAdminHeaderProps) {
  const theme = useAdminTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      {showBackToOrganizations ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to organizations"
          onPress={onBackToOrganizations}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Organizations
          </ThemedText>
        </Pressable>
      ) : null}

      <View style={styles.titleRow}>
        <OrganizationLogo
          logoSrc={organization.branding.logoSrc}
          logoAlt={organization.branding.logoAlt}
          name={organization.name}
        />
        <View style={styles.titleContent}>
          <ThemedText
            type="smallBold"
            numberOfLines={1}
            style={{ color: theme.textPrimary, fontSize: 16 }}>
            {organization.name}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textTertiary, fontSize: 12 }}>
            School Admin
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: -4,
  },
  pressed: {
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  titleContent: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});
