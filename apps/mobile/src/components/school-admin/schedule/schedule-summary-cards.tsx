import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';

type ScheduleSummaryCardsProps = {
  monthSlotCount: number | null;
  monthObservationDayCount: number | null;
  upcomingVisitCount: number | null;
  onPressTours: () => void;
  onPressShadow: () => void;
  onPressVisits: () => void;
};

function SummaryCard({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const theme = useAdminTheme();
  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.elevated,
          borderColor: theme.border,
        },
      ]}>
      <ThemedText type="small" style={{ color: theme.textTertiary }}>
        {label}
      </ThemedText>
      <ThemedText type="title" style={[styles.value, { color: theme.textPrimary }]}>
        {value}
      </ThemedText>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
      {content}
    </Pressable>
  );
}

export function ScheduleSummaryCards({
  monthSlotCount,
  monthObservationDayCount,
  upcomingVisitCount,
  onPressTours,
  onPressShadow,
  onPressVisits,
}: ScheduleSummaryCardsProps) {
  return (
    <View style={styles.grid}>
      <SummaryCard
        label="Open slots this month"
        value={monthSlotCount == null ? '—' : String(monthSlotCount)}
        onPress={onPressTours}
      />
      <SummaryCard
        label="Open shadow days"
        value={monthObservationDayCount == null ? '—' : String(monthObservationDayCount)}
        onPress={onPressShadow}
      />
      <SummaryCard
        label="Upcoming visits"
        value={upcomingVisitCount == null ? '—' : String(upcomingVisitCount)}
        onPress={onPressVisits}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.two,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  value: {
    marginTop: Spacing.one,
    fontSize: 24,
    lineHeight: 28,
  },
});
