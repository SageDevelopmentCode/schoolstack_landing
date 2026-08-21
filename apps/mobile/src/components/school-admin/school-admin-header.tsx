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
          <Ionicons name="chevron-back" size={18} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Organizations
          </ThemedText>
        </Pressable>
      ) : null}

      <OrganizationLogo
        logoSrc={organization.branding.logoSrc}
        logoAlt={organization.branding.logoAlt}
        name={organization.name}
      />

      <ThemedText
        type="smallBold"
        numberOfLines={1}
        style={[styles.schoolName, { color: theme.textPrimary }]}>
        {organization.name}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: -4,
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.7,
  },
  schoolName: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
  },
});
