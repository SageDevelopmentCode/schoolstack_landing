import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { greetingParts } from '@/lib/school-admin/greeting';

type AdminDashboardHeaderProps = {
  schoolName: string;
  userFirstName?: string | null;
  onReviewAdmissions: () => void;
};

export function AdminDashboardHeader({
  schoolName,
  userFirstName,
  onReviewAdmissions,
}: AdminDashboardHeaderProps) {
  const theme = useAdminTheme();
  const greetingName = userFirstName?.trim() || 'there';
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <ThemedText type="badge" style={{ color: theme.textTertiary, letterSpacing: 1.2 }}>
          SCHOOL WORKSPACE
        </ThemedText>
        <View style={[styles.datePill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {dateLabel}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="title" style={[styles.greeting, { color: theme.textPrimary }]}>
        {greetingPrefix}, {greetingName}. {greetingEmoji}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        Here is {schoolName}&apos;s operating picture for {dayName}.
      </ThemedText>

      <PrimaryButton
        label="Review admissions →"
        variant="accent"
        appearance="native"
        onPress={onReviewAdmissions}
        style={styles.cta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  datePill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  greeting: {
    marginTop: Spacing.one,
  },
  cta: {
    marginTop: Spacing.two,
    alignSelf: 'stretch',
  },
});
