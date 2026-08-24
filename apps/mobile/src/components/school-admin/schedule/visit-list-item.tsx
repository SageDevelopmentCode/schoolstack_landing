import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { AdminScheduledVisit } from '@/lib/admissions/admin-scheduled-visits';
import type { ScheduledVisitTiming } from '@/lib/admissions/admissions-availability';

type VisitListItemProps = {
  visit: AdminScheduledVisit;
  onPress?: () => void;
};

const TIMING_LABELS: Record<ScheduledVisitTiming, string> = {
  upcoming: 'Upcoming',
  happening: 'Now',
  past: 'Past',
};

function timingColors(timing: ScheduledVisitTiming, theme: ReturnType<typeof useAdminTheme>) {
  switch (timing) {
    case 'upcoming':
      return { bg: theme.infoBg, text: theme.info };
    case 'happening':
      return { bg: theme.successBg, text: theme.success };
    case 'past':
      return { bg: theme.elevated, text: theme.textTertiary };
  }
}

export function VisitListItem({ visit, onPress }: VisitListItemProps) {
  const theme = useAdminTheme();
  const badge = timingColors(visit.timing, theme);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={styles.copy}>
        <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
          {visit.stepTitle}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {visit.studentLabel ?? 'Student pending'}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          {visit.whenLabel}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textTertiary }}>
          {visit.formTitle}
        </ThemedText>
      </View>
      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
        <ThemedText type="small" style={{ color: badge.text }}>
          {TIMING_LABELS[visit.timing]}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
});
