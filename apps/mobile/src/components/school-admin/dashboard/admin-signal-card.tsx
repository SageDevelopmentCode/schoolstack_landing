import { Pressable, StyleSheet, View } from 'react-native';

import { AdminCard } from '@/components/admin/admin-card';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

type AdminSignalCardProps = {
  headline: string;
  body: string;
  ctaLabel: string;
  onPress: () => void;
};

export function AdminSignalCard({ headline, body, ctaLabel, onPress }: AdminSignalCardProps) {
  const theme = useAdminTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
      <View style={[styles.card, { backgroundColor: theme.accent }]}>
        <ThemedText type="badge" style={styles.kicker}>
          SCHOOL SIGNAL
        </ThemedText>
        <ThemedText type="subtitle" style={styles.headline}>
          {headline}
        </ThemedText>
        <ThemedText type="small" style={styles.body}>
          {body}
        </ThemedText>
        <ThemedText type="smallBold" style={styles.cta}>
          {ctaLabel}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function AdminSignalEmptyCard() {
  const theme = useAdminTheme();

  return (
    <AdminCard>
      <ThemedText type="badge" style={{ color: theme.textTertiary, letterSpacing: 1.2 }}>
        SCHOOL SIGNAL
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>
        Activity will appear here as families apply and enroll.
      </ThemedText>
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  kicker: {
    color: '#C5E1CB',
    letterSpacing: 1.3,
  },
  headline: {
    color: '#FFFFFF',
  },
  body: {
    color: '#D8E6DB',
    lineHeight: 18,
  },
  cta: {
    color: '#D6EFD8',
    marginTop: Spacing.one,
  },
});
