import { Pressable, StyleSheet } from 'react-native';

import { AdminCard } from '@/components/admin/admin-card';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Spacing } from '@/constants/theme';

type AdminNeedHelpCardProps = {
  onPress: () => void;
};

export function AdminNeedHelpCard({ onPress }: AdminNeedHelpCardProps) {
  const theme = useAdminTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
      <AdminCard
        style={{
          backgroundColor: theme.accentLight,
          borderColor: theme.border,
        }}>
        <ThemedText type="badge" style={{ color: theme.textTertiary, letterSpacing: 1.2 }}>
          NEED HELP
        </ThemedText>
        <ThemedText type="title" style={{ color: theme.textPrimary }}>
          Need help?
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Tell us what&apos;s going on and attach screenshots if helpful.
        </ThemedText>
        <ThemedText type="smallBold" style={[styles.cta, { color: theme.accent }]}>
          Get help →
        </ThemedText>
      </AdminCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cta: {
    marginTop: Spacing.one,
  },
});
